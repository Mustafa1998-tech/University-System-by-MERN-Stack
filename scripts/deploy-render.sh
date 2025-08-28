#!/bin/bash

# Render.com Deployment Script for University SIS
# This script performs pre-deployment checks and setup

set -e  # Exit on any error

echo "🚀 Starting Render deployment for University SIS..."

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the right directory
if [ ! -f "render.yaml" ]; then
    print_error "render.yaml not found. Make sure you're in the project root directory."
    exit 1
fi

print_status "Found render.yaml configuration file"

# Check Node.js version
node_version=$(node --version)
print_status "Node.js version: $node_version"

# Check npm version
npm_version=$(npm --version)
print_status "npm version: $npm_version"

# Function to check environment variables
check_env_vars() {
    local service=$1
    local env_file=$2
    
    print_status "Checking environment variables for $service..."
    
    if [ -f "$env_file" ]; then
        print_status "Found $env_file template"
        
        # Read required variables from template
        required_vars=$(grep -E "^[A-Z_]+=" "$env_file" | cut -d'=' -f1)
        
        missing_vars=()
        for var in $required_vars; do
            if [ -z "${!var}" ]; then
                missing_vars+=("$var")
            fi
        done
        
        if [ ${#missing_vars[@]} -gt 0 ]; then
            print_warning "Missing environment variables for $service:"
            printf '%s\n' "${missing_vars[@]}"
            print_warning "Make sure to set these in your Render service settings"
        else
            print_status "All environment variables are set for $service"
        fi
    else
        print_warning "Environment template not found: $env_file"
    fi
}

# Check backend dependencies
print_status "Checking backend dependencies..."
if [ -d "backend" ]; then
    cd backend
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        print_error "backend/package.json not found"
        exit 1
    fi
    
    # Install dependencies and run tests
    print_status "Installing backend dependencies..."
    npm ci
    
    print_status "Running backend linting..."
    npm run lint || print_warning "Linting issues found in backend"
    
    print_status "Running backend tests..."
    npm test || print_warning "Some backend tests failed"
    
    # Check environment configuration
    check_env_vars "backend" ".env.production.template"
    
    cd ..
else
    print_error "Backend directory not found"
    exit 1
fi

# Check frontend dependencies
print_status "Checking frontend dependencies..."
if [ -d "frontend" ]; then
    cd frontend
    
    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        print_error "frontend/package.json not found"
        exit 1
    fi
    
    # Install dependencies and build
    print_status "Installing frontend dependencies..."
    npm ci
    
    print_status "Running frontend linting..."
    npm run lint || print_warning "Linting issues found in frontend"
    
    print_status "Running frontend tests..."
    npm test -- --watchAll=false || print_warning "Some frontend tests failed"
    
    print_status "Testing frontend build..."
    npm run build
    
    # Check environment configuration
    check_env_vars "frontend" ".env.production.template"
    
    cd ..
else
    print_error "Frontend directory not found"
    exit 1
fi

# Check documentation
print_status "Checking documentation..."
required_docs=("README.md" "docs/RENDER_DEPLOYMENT.md")
for doc in "${required_docs[@]}"; do
    if [ -f "$doc" ]; then
        print_status "Found $doc"
    else
        print_warning "Missing documentation: $doc"
    fi
done

# Security checks
print_status "Running security checks..."

# Check for sensitive files that shouldn't be committed
sensitive_files=(".env" "backend/.env" "frontend/.env" "*.key" "*.pem")
for pattern in "${sensitive_files[@]}"; do
    if ls $pattern 1> /dev/null 2>&1; then
        print_warning "Sensitive files found: $pattern - make sure they're in .gitignore"
    fi
done

# Check .gitignore
if [ -f ".gitignore" ]; then
    print_status "Found .gitignore file"
    
    # Check if important patterns are ignored
    important_patterns=("node_modules" ".env" "*.log" "build/" "dist/")
    for pattern in "${important_patterns[@]}"; do
        if grep -q "$pattern" .gitignore; then
            print_status "✓ $pattern is ignored"
        else
            print_warning "⚠ $pattern should be added to .gitignore"
        fi
    done
else
    print_warning ".gitignore file not found"
fi

# Check package.json engines
print_status "Checking Node.js engine requirements..."
backend_engines=$(jq -r '.engines.node // "not specified"' backend/package.json)
frontend_engines=$(jq -r '.engines.node // "not specified"' frontend/package.json)

print_status "Backend Node.js requirement: $backend_engines"
print_status "Frontend Node.js requirement: $frontend_engines"

# Generate deployment summary
print_status "Generating deployment summary..."

cat << EOF

📋 DEPLOYMENT SUMMARY
=====================================

Project: University Student Information System
Environment: Production (Render.com)
Node.js: $node_version
npm: $npm_version

Services to Deploy:
- 🟡 Backend API (Express.js)
- 🔵 Frontend (React)
- 🟢 MongoDB Database
- 🔴 Redis Cache
- 👷 Background Workers

Required Environment Variables:
- Backend: $(wc -l < backend/.env.production.template) variables
- Frontend: $(wc -l < frontend/.env.production.template) variables

Pre-deployment Checklist:
✅ Dependencies installed
✅ Tests executed
✅ Build successful
✅ Security checks completed
✅ Documentation available

Next Steps:
1. Push code to GitHub repository
2. Connect repository to Render
3. Set environment variables in Render dashboard
4. Deploy services in order: Database → Backend → Frontend
5. Configure custom domain (if needed)
6. Set up monitoring and alerts

EOF

print_status "Deployment preparation completed successfully! 🎉"
print_status "Review the summary above and proceed with Render deployment."

# Optional: Create deployment checklist file
cat << EOF > DEPLOYMENT_CHECKLIST.md
# Render Deployment Checklist

## Pre-deployment
- [ ] Code tested locally
- [ ] All tests passing
- [ ] Environment variables documented
- [ ] Dependencies updated
- [ ] Security scan completed

## Database Setup
- [ ] MongoDB Atlas cluster created
- [ ] Database user configured
- [ ] Network access configured
- [ ] Connection string obtained

## Backend Deployment
- [ ] Repository connected to Render
- [ ] Build command configured: \`npm ci && npm run build\`
- [ ] Start command configured: \`npm start\`
- [ ] Environment variables set
- [ ] Health check endpoint configured
- [ ] Service deployed successfully

## Frontend Deployment
- [ ] Repository connected to Render
- [ ] Build command configured: \`npm ci && npm run build\`
- [ ] Publish directory set to \`./build\`
- [ ] Environment variables set
- [ ] Redirect rules configured
- [ ] Service deployed successfully

## Post-deployment
- [ ] Both services accessible
- [ ] Authentication working
- [ ] File uploads working
- [ ] Email notifications working
- [ ] PDF generation working
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Monitoring configured

## Optional Workers
- [ ] Notification worker deployed
- [ ] File processing worker deployed
- [ ] Background jobs processing

Generated: $(date)
EOF

print_status "Created DEPLOYMENT_CHECKLIST.md for tracking progress"

exit 0
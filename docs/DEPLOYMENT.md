# SIS Deployment Guide 🚢
## دليل نشر نظام معلومات الطلاب

This guide covers deployment options for the SIS (Student Information System) across different environments.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development](#local-development)
3. [Render.com Deployment](#rendercom-deployment)
4. [Docker Production](#docker-production)
5. [Manual Production Setup](#manual-production-setup)
6. [Environment Variables](#environment-variables)
7. [Database Setup](#database-setup)
8. [SSL/TLS Configuration](#ssltls-configuration)
9. [Monitoring & Logging](#monitoring--logging)
10. [Backup & Recovery](#backup--recovery)
11. [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

### System Requirements
- **Node.js**: 18.x or higher
- **npm**: 9.x or higher
- **MongoDB**: 7.0 or higher
- **Redis**: 7.x or higher (optional but recommended)
- **Docker**: 24.x or higher (for containerized deployment)

### External Services
- **Email Service**: SMTP or service like SendGrid, Mailgun
- **SMS Service**: Twilio or similar (optional)
- **File Storage**: MinIO, AWS S3, or local storage
- **Domain & SSL**: For production deployment

## 🏠 Local Development

### Quick Start with Docker
```bash
# Clone the repository
git clone https://github.com/your-username/sis-university-system.git
cd sis

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# Import sample data
docker-compose exec backend npm run seed:dev

# View logs
docker-compose logs -f backend frontend
```

### Manual Setup
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend && npm install && cd ..

# Install frontend dependencies
cd frontend && npm install && cd ..

# Start MongoDB and Redis
docker-compose up mongodb redis -d

# Configure environment variables
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Start backend (Terminal 1)
cd backend && npm run dev

# Start frontend (Terminal 2)
cd frontend && npm start
```

### Development URLs
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/api/v1
- **API Docs**: http://localhost:5000/api-docs
- **MongoDB Express**: http://localhost:8081
- **Redis Commander**: http://localhost:8082

## 🌐 Render.com Deployment

### 1. Repository Setup
```bash
# Fork the repository to your GitHub account
# or push your code to a new repository
git clone https://github.com/your-username/sis-university-system.git
cd sis
git remote set-url origin https://github.com/your-username/sis-university-system.git
git push -u origin main
```

### 2. Database Setup (MongoDB Atlas)
```bash
# 1. Create MongoDB Atlas account at https://cloud.mongodb.com
# 2. Create a new cluster
# 3. Create database user
# 4. Whitelist IP addresses (0.0.0.0/0 for Render)
# 5. Get connection string
```

### 3. Backend Service on Render
```yaml
# Service Configuration
Name: sis-backend
Environment: Node
Build Command: cd backend && npm install
Start Command: cd backend && npm start
Auto-Deploy: Yes (from main branch)

# Environment Variables
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/sis_university
JWT_SECRET=your-super-secret-jwt-key-production
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key-production
CORS_ORIGIN=https://your-frontend-url.onrender.com
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USERNAME=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
```

### 4. Frontend Service on Render
```yaml
# Static Site Configuration
Name: sis-frontend
Build Command: cd frontend && npm install && npm run build
Publish Directory: frontend/build
Auto-Deploy: Yes (from main branch)

# Environment Variables
REACT_APP_API_URL=https://your-backend-url.onrender.com/api/v1
REACT_APP_SOCKET_URL=https://your-backend-url.onrender.com
REACT_APP_DEFAULT_LANGUAGE=en
REACT_APP_SUPPORTED_LANGUAGES=en,ar
```

### 5. Custom Headers (Frontend)
```nginx
# _headers file in frontend/public/
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: same-origin
  Strict-Transport-Security: max-age=31536000; includeSubDomains
```

### 6. Redirects for SPA (Frontend)
```nginx
# _redirects file in frontend/public/
/*    /index.html   200
```

## 🐳 Docker Production

### 1. Production Docker Compose
```yaml
# docker-compose.prod.yml
version: '3.8'
services:
  backend:
    build:
      context: ./backend
      target: production
    environment:
      NODE_ENV: production
      MONGODB_URI: ${MONGODB_URI}
      JWT_SECRET: ${JWT_SECRET}
    restart: unless-stopped
    
  frontend:
    build:
      context: ./frontend
      target: production
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./docker/nginx/prod.conf:/etc/nginx/conf.d/default.conf
      - ./ssl:/etc/ssl/certs
    depends_on:
      - backend
      - frontend
    restart: unless-stopped

  mongodb:
    image: mongo:7.0
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USERNAME}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    volumes:
      - mongodb_data:/data/db
    restart: unless-stopped

volumes:
  mongodb_data:
```

### 2. Production Deployment
```bash
# Build and start production services
docker-compose -f docker-compose.prod.yml up -d

# Import production data
docker-compose -f docker-compose.prod.yml exec backend npm run seed:prod

# Monitor logs
docker-compose -f docker-compose.prod.yml logs -f
```

## 🔧 Manual Production Setup

### 1. Server Preparation (Ubuntu 22.04)
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install MongoDB
wget -qO - https://www.mongodb.org/static/pgp/server-7.0.asc | sudo apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/7.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-7.0.list
sudo apt-get update
sudo apt-get install -y mongodb-org

# Install Redis
sudo apt install redis-server -y

# Install Nginx
sudo apt install nginx -y

# Install PM2 for process management
sudo npm install -g pm2
```

### 2. Application Setup
```bash
# Clone application
git clone https://github.com/your-username/sis-university-system.git /var/www/sis
cd /var/www/sis

# Set permissions
sudo chown -R $USER:$USER /var/www/sis

# Install dependencies
npm run install:all

# Build applications
npm run build

# Configure environment
cp backend/.env.example backend/.env
# Edit backend/.env with production values
```

### 3. PM2 Configuration
```javascript
// ecosystem.config.js
module.exports = {
  apps: [
    {
      name: 'sis-backend',
      cwd: '/var/www/sis/backend',
      script: 'src/app.js',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      },
      instances: 'max',
      exec_mode: 'cluster',
      max_memory_restart: '500M',
      error_file: '/var/log/sis/backend-error.log',
      out_file: '/var/log/sis/backend-out.log',
      log_file: '/var/log/sis/backend.log'
    }
  ]
};
```

### 4. Nginx Configuration
```nginx
# /etc/nginx/sites-available/sis
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com www.your-domain.com;

    ssl_certificate /etc/ssl/certs/your-domain.pem;
    ssl_certificate_key /etc/ssl/private/your-domain.key;

    # Frontend
    location / {
        root /var/www/sis/frontend/build;
        try_files $uri $uri/ /index.html;
        
        # Security headers
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
        add_header X-XSS-Protection "1; mode=block";
    }

    # Backend API
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 🔐 Environment Variables

### Backend Environment Variables
```bash
# Required
NODE_ENV=production
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sis_university
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-super-secret-refresh-jwt-key

# Optional but recommended
REDIS_URL=redis://localhost:6379
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USERNAME=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token
CORS_ORIGIN=https://your-domain.com
```

### Frontend Environment Variables
```bash
REACT_APP_API_URL=https://your-domain.com/api/v1
REACT_APP_SOCKET_URL=https://your-domain.com
REACT_APP_DEFAULT_LANGUAGE=en
REACT_APP_SUPPORTED_LANGUAGES=en,ar
```

## 🗄️ Database Setup

### MongoDB Configuration
```javascript
// MongoDB production settings
{
  "storage": {
    "dbPath": "/var/lib/mongodb",
    "journal": {"enabled": true}
  },
  "systemLog": {
    "destination": "file",
    "logAppend": true,
    "path": "/var/log/mongodb/mongod.log"
  },
  "net": {
    "port": 27017,
    "bindIp": "127.0.0.1"
  },
  "security": {
    "authorization": "enabled"
  },
  "replication": {
    "replSetName": "rs0"
  }
}
```

### Database Initialization
```bash
# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Create admin user
mongosh
use admin
db.createUser({
  user: "admin",
  pwd: "secure_password",
  roles: ["root"]
})

# Create application database and user
use sis_university
db.createUser({
  user: "sis_user",
  pwd: "sis_password",
  roles: ["readWrite"]
})
```

### Import Production Data
```bash
# Seed with sample data
cd /var/www/sis/backend
npm run seed:prod

# Or import from backup
mongorestore --db sis_university /path/to/backup
```

## 🔒 SSL/TLS Configuration

### Let's Encrypt Setup
```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Verify auto-renewal
sudo certbot renew --dry-run
```

### Manual SSL Setup
```bash
# Generate SSL certificate (for testing)
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/your-domain.key \
  -out /etc/ssl/certs/your-domain.crt
```

## 📊 Monitoring & Logging

### System Monitoring
```bash
# Install monitoring tools
sudo apt install htop iotop -y

# PM2 monitoring
pm2 monit

# Check logs
pm2 logs
tail -f /var/log/nginx/access.log
tail -f /var/log/mongodb/mongod.log
```

### Application Health Checks
```bash
# Backend health check
curl https://your-domain.com/api/v1/health

# Database health check
mongosh --eval "db.adminCommand('ping')"

# Redis health check
redis-cli ping
```

### Log Rotation
```bash
# Configure logrotate for application logs
sudo tee /etc/logrotate.d/sis > /dev/null <<EOF
/var/log/sis/*.log {
    daily
    missingok
    rotate 52
    compress
    delaycompress
    notifempty
    create 644 www-data www-data
    postrotate
        pm2 reload sis-backend
    endscript
}
EOF
```

## 💾 Backup & Recovery

### Automated Backup Script
```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/sis"
DB_NAME="sis_university"

# Create backup directory
mkdir -p $BACKUP_DIR

# Database backup
mongodump --db $DB_NAME --out $BACKUP_DIR/db_$DATE

# Application files backup
tar -czf $BACKUP_DIR/app_$DATE.tar.gz /var/www/sis

# Uploads backup
tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz /var/www/sis/backend/uploads

# Clean old backups (keep 30 days)
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completed: $DATE"
```

### Recovery Process
```bash
# Restore database
mongorestore --db sis_university /var/backups/sis/db_20231215_120000/sis_university

# Restore application files
sudo tar -xzf /var/backups/sis/app_20231215_120000.tar.gz -C /

# Restore uploads
sudo tar -xzf /var/backups/sis/uploads_20231215_120000.tar.gz -C /

# Restart services
pm2 restart all
sudo systemctl restart nginx
```

## 🛠️ Troubleshooting

### Common Issues

#### Backend Not Starting
```bash
# Check logs
pm2 logs sis-backend

# Check environment variables
cat /var/www/sis/backend/.env

# Test MongoDB connection
mongosh $MONGODB_URI

# Check port availability
sudo netstat -tlnp | grep :5000
```

#### Frontend Build Issues
```bash
# Clear npm cache
npm cache clean --force

# Rebuild node modules
rm -rf node_modules package-lock.json
npm install

# Check memory usage during build
npm run build --verbose
```

#### Database Connection Issues
```bash
# Check MongoDB status
sudo systemctl status mongod

# Check connection
mongosh --eval "db.adminCommand('ping')"

# Check firewall
sudo ufw status
```

### Performance Optimization

#### MongoDB Optimization
```javascript
// Add indexes for better performance
db.students.createIndex({ "studentId": 1 })
db.courses.createIndex({ "courseCode": 1 })
db.users.createIndex({ "email": 1 })
db.enrollments.createIndex({ "student": 1, "semester": 1 })
```

#### Nginx Optimization
```nginx
# Add to nginx.conf
gzip on;
gzip_types text/plain application/json application/javascript text/css;

# Enable caching
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Security Checklist

- [ ] SSL/TLS enabled and properly configured
- [ ] Firewall configured (UFW or iptables)
- [ ] MongoDB authentication enabled
- [ ] Regular security updates applied
- [ ] Strong passwords and JWT secrets
- [ ] File upload restrictions in place
- [ ] Rate limiting configured
- [ ] Error messages don't leak sensitive info
- [ ] Regular backups automated
- [ ] Monitoring and alerting configured

## 🚀 Post-Deployment

### Initial Setup
1. Access the admin panel: https://your-domain.com
2. Login with admin credentials: admin@university.edu / admin123
3. Change default passwords
4. Configure system settings
5. Import or create initial data
6. Test all major functionalities
7. Set up monitoring and alerts

### User Onboarding
1. Create user accounts for staff and faculty
2. Import student data
3. Set up courses and enrollments
4. Configure academic calendar
5. Train users on the system

---

**Need help?** Check our [Troubleshooting Guide](TROUBLESHOOTING.md) or create an issue on GitHub.

Built with ❤️ for reliable university management.

# Student Information System (SIS) - Deployment Guide

This document provides detailed instructions for deploying the Student Information System (SIS) application to Render.

## Prerequisites

- GitHub account with access to the repository
- Render account (sign up at [render.com](https://render.com/))
- MongoDB Atlas account (or another MongoDB provider)

## Environment Variables

### Backend (.env)

Create a `.env` file in the `backend` directory with the following variables:

```env
NODE_ENV=production
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

### Frontend (.env.production)

Create a `.env.production` file in the `frontend` directory:

```env
REACT_APP_API_URL=https://your-backend-url.onrender.com
```

## Deployment to Render

### 1. Set up GitHub Repository

1. Push your code to a GitHub repository if you haven't already
2. Connect your GitHub account to Render

### 2. Deploy Backend Service

1. Go to your Render dashboard and click "New +" > "Web Service"
2. Connect your GitHub repository
3. Configure the backend service:
   - **Name**: sis-backend
   - **Region**: Select the region closest to your users
   - **Branch**: main
   - **Root Directory**: /backend
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free
   - **Auto-Deploy**: Yes

4. Add environment variables from your `.env` file
5. Click "Create Web Service"

### 3. Deploy Frontend Service

1. In your Render dashboard, click "New +" > "Static Site"
2. Connect your GitHub repository
3. Configure the frontend service:
   - **Name**: sis-frontend
   - **Branch**: main
   - **Root Directory**: /frontend
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: build
   - **Environment Variables**:
     - `REACT_APP_API_URL`: URL of your deployed backend service (e.g., https://sis-backend.onrender.com)

4. Click "Create Static Site"

### 4. Set up MongoDB Database

1. In your Render dashboard, click "New +" > "MongoDB"
2. Configure the database:
   - **Name**: sis-db
   - **Database Name**: sis
   - **User**: sis_user
   - **Plan**: Free
3. Click "Create Database"
4. Update the `MONGODB_URI` in your backend service with the new connection string

## CI/CD with GitHub Actions

The repository includes a GitHub Actions workflow (`.github/workflows/ci-cd.yml`) that automates:

1. Running tests on push and pull requests
2. Linting the codebase
3. Deploying to Render when changes are pushed to the `main` branch

### Required Secrets

Add these secrets to your GitHub repository (Settings > Secrets > Actions):

- `RENDER_API_KEY`: Your Render API key
- `RENDER_SERVICE_ID`: Your Render service ID
- `DATABASE_URL`: Your MongoDB connection string
- `JWT_SECRET`: Your JWT secret
- `SLACK_WEBHOOK_URL` (optional): For deployment notifications

## Manual Deployment

### Backend

```bash
cd backend
npm install
npm start
```

### Frontend

```bash
cd frontend
npm install
npm run build
npx serve -s build
```

## Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check the build logs in the Render dashboard
   - Ensure all environment variables are set correctly

2. **Database Connection Issues**:
   - Verify the MongoDB connection string
   - Check if your IP is whitelisted in MongoDB Atlas

3. **CORS Errors**:
   - Ensure the frontend URL is included in the CORS whitelist in the backend

## Monitoring and Maintenance

- Monitor your services in the Render dashboard
- Set up alerts for errors and performance issues
- Regularly update dependencies to patch security vulnerabilities

## Rollback Procedure

1. In the Render dashboard, go to your service
2. Navigate to the "Deploys" tab
3. Find the previous working deployment
4. Click "Redeploy" to roll back to that version

## Contact

For support, please contact [your-email@example.com](mailto:your-email@example.com)
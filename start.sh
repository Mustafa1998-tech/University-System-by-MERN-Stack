#!/bin/bash

# SIS Quick Start Script
# This script helps you get the SIS system running quickly

set -e

echo "🎓 Welcome to SIS - Student Information System"
echo "============================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    echo "Visit: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    echo "Visit: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Create environment files if they don't exist
if [ ! -f backend/.env ]; then
    echo "📝 Creating backend environment file..."
    cp backend/.env.example backend/.env
fi

if [ ! -f frontend/.env ]; then
    echo "📝 Creating frontend environment file..."
    cp frontend/.env.example frontend/.env
fi

echo "🚀 Starting SIS system with Docker Compose..."

# Start the system
docker-compose up -d

echo "⏳ Waiting for services to start..."
sleep 30

# Import sample data
echo "📊 Importing sample data..."
docker-compose exec -T backend npm run seed

echo ""
echo "🎉 SIS System is now running!"
echo ""
echo "🌐 Access URLs:"
echo "   Frontend:      http://localhost:3000"
echo "   Backend API:   http://localhost:5000/api/v1"
echo "   API Docs:      http://localhost:5000/api-docs"
echo "   MongoDB Admin: http://localhost:8081 (admin/admin123)"
echo ""
echo "👤 Demo Accounts:"
echo "   Admin:      admin@university.edu / admin123"
echo "   Staff:      staff@university.edu / staff123"
echo "   Instructor: instructor@university.edu / instructor123"
echo "   Student:    student@university.edu / student123"
echo ""
echo "📚 Documentation:"
echo "   Main README:    ./README.md"
echo "   Deployment:     ./docs/DEPLOYMENT.md"
echo "   Troubleshooting: ./docs/TROUBLESHOOTING.md"
echo ""
echo "🛑 To stop the system: docker-compose down"
echo "📋 To view logs: docker-compose logs -f"
echo ""
echo "Happy learning! 🎓✨"
#!/bin/bash

# Quick start guide for Kingsbal API
# This script helps you get started quickly

echo "🚀 Kingsbal API - Quick Start Guide"
echo "==================================="
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json not found"
  echo "Please run this script from the backend directory"
  exit 1
fi

echo "Step 1: Installing dependencies..."
npm install

echo ""
echo "Step 2: Creating environment file..."
if [ ! -f ".env" ]; then
  cp .env.example .env
  echo "✓ .env file created (using demo mode defaults)"
  echo "  Tip: Edit .env to add DATABASE_URL for production"
else
  echo "✓ .env file already exists"
fi

echo ""
echo "Step 3: Testing local development..."
echo "Starting server on http://localhost:5000"
echo ""
echo "Available endpoints:"
echo "  GET  http://localhost:5000/              - Health check"
echo "  GET  http://localhost:5000/health        - Detailed health"
echo "  GET  http://localhost:5000/api/status    - API status"
echo ""
echo "Public endpoints (no auth needed):"
echo "  GET  http://localhost:5000/api/public/nursing-questions"
echo "  GET  http://localhost:5000/api/questions/all"
echo "  GET  http://localhost:5000/api/curriculum/topics"
echo ""
echo "Demo credentials:"
echo "  Email: demo@kingsbal.com"
echo "  Password: password123"
echo "  (or admin@kingsbal.com / admin123)"
echo ""
echo "Login to get token:"
echo "  POST http://localhost:5000/api/auth/login"
echo ""
echo "⏱️  Press Ctrl+C to stop the server"
echo ""

# Start the development server
npm run dev

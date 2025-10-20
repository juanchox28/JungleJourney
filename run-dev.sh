#!/bin/bash

# JungleJourney Development Runner Script
# This script sets up the correct Node.js version and runs the development server

set -e  # Exit on any error

echo "🚀 Starting JungleJourney Development Server"
echo "=============================================="

# Check if NVM is available
if [ -z "$NVM_DIR" ]; then
    export NVM_DIR="$HOME/.nvm"
fi

# Load NVM if it exists
if [ -s "$NVM_DIR/nvm.sh" ]; then
    echo "📦 Loading NVM..."
    source "$NVM_DIR/nvm.sh"
else
    echo "❌ NVM not found. Please install NVM first."
    echo "   Visit: https://github.com/nvm-sh/nvm#installing-and-updating"
    exit 1
fi

# Use the correct Node.js version
echo "🔧 Switching to Node.js v18.20.8..."
nvm use 18.20.8

# Verify Node.js version
NODE_VERSION=$(node --version)
if [[ "$NODE_VERSION" != "v18.20.8" ]]; then
    echo "❌ Wrong Node.js version. Expected v18.20.8, got $NODE_VERSION"
    exit 1
fi

echo "✅ Node.js $NODE_VERSION ready"

# Kill any existing processes on port 5000
echo "🧹 Cleaning up any existing processes on port 5000..."
pkill -f "tsx server/index.ts" 2>/dev/null || true
pkill -f "node.*server/index.ts" 2>/dev/null || true

# Wait a moment for processes to terminate
sleep 2

# Check if port 5000 is still in use
if lsof -Pi :5000 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "❌ Port 5000 is still in use. Please close other applications using this port."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Set development environment
export NODE_ENV=development

echo "🎯 Starting development server..."
echo "   Frontend will be available at: http://localhost:5000"
echo "   API endpoints at: http://localhost:5000/api/*"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

# Run the development server
npm run dev
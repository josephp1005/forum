#!/bin/bash

echo "🚀 Setting up Twitter API Backend Proxy"
echo "======================================="

# Navigate to backend directory
cd backend

# Check if package.json exists
if [ ! -f "package.json" ]; then
    echo "❌ Backend directory not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies
echo "📦 Installing backend dependencies..."
npm install

# Check if .env file has been configured
if grep -q "your_twitter_bearer_token_here" .env; then
    echo ""
    echo "⚠️  IMPORTANT: You need to configure your Twitter Bearer Token!"
    echo ""
    echo "1. Open backend/.env file"
    echo "2. Replace 'your_twitter_bearer_token_here' with your actual Twitter Bearer Token"
    echo "3. Get your token from: https://developer.twitter.com/"
    echo ""
    echo "Then run:"
    echo "  cd backend"
    echo "  npm run dev"
    echo ""
else
    echo ""
    echo "✅ Dependencies installed! Starting the server..."
    echo ""
    npm run dev
fi
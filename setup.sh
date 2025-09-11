#!/bin/bash

# CodeniWeather Setup Script
# This script helps you set up the development environment

echo "🌤️  Welcome to CodeniWeather Setup!"
echo "=================================="
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    echo "   Visit: https://nodejs.org/"
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    echo "   Please upgrade Node.js from: https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Install dependencies
echo "📦 Installing dependencies..."
if npm install; then
    echo "✅ Dependencies installed successfully"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo ""

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "🔧 Creating environment file..."
    cp .env.example .env.local
    echo "✅ Created .env.local from .env.example"
else
    echo "ℹ️  .env.local already exists"
fi

echo ""

# Check if API key is set
if grep -q "your_openweather_api_key_here" .env.local; then
    echo "⚠️  API Key Setup Required"
    echo "========================="
    echo ""
    echo "To complete the setup, you need to:"
    echo "1. Get a free API key from: https://openweathermap.org/api"
    echo "2. Edit .env.local and replace 'your_openweather_api_key_here' with your actual key"
    echo ""
    echo "Example:"
    echo "NEXT_PUBLIC_OPENWEATHER_API_KEY=1234567890abcdef1234567890abcdef"
    echo ""
    echo "After setting your API key, run: npm run dev"
else
    echo "✅ API key appears to be configured"
fi

echo ""
echo "🎉 Setup complete!"
echo ""
echo "Next steps:"
echo "1. Set your OpenWeatherMap API key in .env.local"
echo "2. Run: npm run dev"
echo "3. Open: http://localhost:3000"
echo ""
echo "For detailed instructions, see: ENVIRONMENT_SETUP.md"
echo ""
echo "Happy coding! 🌤️"
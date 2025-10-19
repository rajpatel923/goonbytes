#!/bin/bash

# Live Gun Detection Startup Script
echo "🔫 Live Gun Detection System"
echo "=========================="

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "Run ./setup.sh first to set up the environment"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "Please create a .env file with your Roboflow API key"
    exit 1
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install/update dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

echo ""
echo "🎥 Starting Live Gun Detection..."
echo "================================="
echo ""
echo "📹 Using your FaceTime camera for real-time detection"
echo "🔫 Will show red boxes around detected guns"
echo "⌨️  Press 'q' to quit"
echo ""

# Start the live detection
python live_gun_detection.py

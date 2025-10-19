#!/bin/bash

# Fixed FastAPI Video Stream Server Startup Script
echo "🎥 Gun Detection Video Stream Server (Fixed)"
echo "============================================="

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found!"
    echo "Run ./setup.sh first to set up the environment"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found!"
    echo "Please create a .env file with your Roboflow API key:"
    echo "echo 'ROBOFLOW_API_KEY=your_key_here' > .env"
    exit 1
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install/update dependencies
echo "📦 Installing dependencies..."
pip install -r requirements.txt

echo ""
echo "🔍 Checking for existing server on port 8000..."
if lsof -ti:8000 > /dev/null 2>&1; then
    echo "⚠️  Port 8000 is already in use. Killing existing process..."
    lsof -ti:8000 | xargs kill -9
    sleep 2
fi

echo ""
echo "🚀 Starting Fixed FastAPI Video Stream Server..."
echo "==============================================="
echo ""
echo "📹 WebSocket endpoint: ws://localhost:8000/ws/video-stream"
echo "🔧 Health check: http://localhost:8000/health"
echo "🔫 Gun detection with real-time streaming (FIXED VERSION)"
echo "⌨️  Press Ctrl+C to stop the server"
echo ""

# Start the fixed FastAPI server
python video_stream_server_fixed.py

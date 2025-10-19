#!/bin/bash

echo "🔫 Gun Detection System"
echo "======================="

# Check virtual environment
if [ ! -d "venv" ]; then
    echo "❌ Run ./setup.sh first!"
    exit 1
fi

# Check .env file
if [ ! -f ".env" ]; then
    echo "❌ Create .env file with your ROBOFLOW_API_KEY"
    exit 1
fi

# Activate and run
source venv/bin/activate
echo "🎥 Starting detection... (Press 'q' to quit)"
python live_gun_detection.py
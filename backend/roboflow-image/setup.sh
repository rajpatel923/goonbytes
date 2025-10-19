#!/bin/bash

# Setup script for Gun Detection System
echo "Setting up Gun Detection System..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment with Python 3.10..."
    /opt/homebrew/bin/python3.10 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Install requirements
echo "Installing requirements..."
pip install -r requirements.txt

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Create .env file: echo 'ROBOFLOW_API_KEY=your_key' > .env"
echo "2. Run: ./run_live_detection.sh"

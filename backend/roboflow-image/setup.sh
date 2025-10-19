#!/bin/bash

echo "Setting up Gun Detection..."

# Create virtual environment
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    /opt/homebrew/bin/python3.10 -m venv venv
fi

# Activate and install
source venv/bin/activate
echo "Installing dependencies..."
pip install -r requirements.txt

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Create .env file: echo 'ROBOFLOW_API_KEY=your_key' > .env"
echo "2. Run: ./run_live_detection.sh"
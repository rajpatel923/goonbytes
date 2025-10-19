#!/bin/bash

# Setup script for Roboflow Inference Pipeline
echo "Setting up Roboflow Inference Pipeline..."

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

echo "Setup complete!"
echo ""
echo "To run the inference pipeline:"
echo "1. Activate the virtual environment: source venv/bin/activate"
echo "2. Update the API key in inference_pipeline.py"
echo "3. Run: python inference_pipeline.py"

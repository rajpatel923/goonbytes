# Roboflow Inference Pipeline

This project sets up a Roboflow inference pipeline for real-time video processing using your custom workflow.

## Setup

### Prerequisites
- Python 3.10 (installed via Homebrew)
- macOS (tested on macOS 14+)

### Installation

1. **Run the setup script:**
   ```bash
   ./setup.sh
   ```

   Or manually:
   ```bash
   # Create virtual environment
   /opt/homebrew/bin/python3.10 -m venv venv
   
   # Activate virtual environment
   source venv/bin/activate
   
   # Install dependencies
   pip install -r requirements.txt
   ```

## Usage

1. **Update your API credentials:**
   - Open `.env` file
   - Replace `your_api_key_here` with your actual Roboflow API key
   - Update workspace name and workflow ID if needed

2. **Run the inference pipeline:**
   ```bash
   # Activate virtual environment
   source venv/bin/activate
   
   # Run the pipeline
   python inference_pipeline.py
   ```

## Configuration

The pipeline is configured to:
- Use your webcam (device ID 0) as the video source
- Process at 30 FPS maximum
- Display results in a window titled "Workflow Image"
- Print prediction results to the console

### Customization

You can modify the following parameters in `inference_pipeline.py`:

- `video_reference`: Change to a video file path, different camera ID, or RTSP stream URL
- `max_fps`: Adjust the processing frame rate
- `my_sink()` function: Customize how results are processed and displayed

## Files

- `inference_pipeline.py`: Main script with the inference pipeline
- `.env`: Environment variables (API keys, workspace config)
- `requirements.txt`: Python dependencies
- `setup.sh`: Automated setup script
- `.gitignore`: Git ignore file (protects .env from being committed)
- `README.md`: This documentation

## Troubleshooting

### Common Issues

1. **"command not found: pip"**
   - Use `python3 -m pip` instead of `pip`
   - Or activate the virtual environment first: `source venv/bin/activate`

2. **Python version compatibility**
   - The inference package requires Python 3.9-3.11
   - This setup uses Python 3.10 for compatibility

3. **Camera access issues**
   - Ensure your camera is not being used by another application
   - Try different device IDs (1, 2, etc.) if 0 doesn't work

4. **API key issues**
   - Make sure your Roboflow API key is valid
   - Verify your workspace name and workflow ID are correct

### Getting Help

- Check the [Roboflow Inference documentation](https://inference.roboflow.com/)
- Verify your workflow is properly configured in the Roboflow dashboard
- Ensure your API key has the necessary permissions

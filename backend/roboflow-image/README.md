# Gun Detection System

Simple weapon detection that draws red boxes around detected guns.

## Quick Start

```bash
# 1. Setup (first time only)
./setup.sh

# 2. Create .env file with your Roboflow API key
echo "ROBOFLOW_API_KEY=your_api_key_here" > .env

# 3a. Run LIVE camera detection
./run_live_detection.sh

# 3b. OR process VIDEO file
source venv/bin/activate
python video_gun_detection.py your_video.mp4
```

## Live Camera Detection

```bash
source venv/bin/activate
python live_gun_detection.py
```

Press 'q' to quit.

## Video File Detection

```bash
source venv/bin/activate
python video_gun_detection.py input.mp4
# Saves as input_detected.mp4

# Or specify output name:
python video_gun_detection.py input.mp4 output.mp4
```

## Settings

Edit these in `live_gun_detection.py`:
- `CONFIDENCE_THRESHOLD = 0.65` - Detection sensitivity (higher = less false positives)
- `STABILITY_FRAMES = 10` - Frames needed before showing box (higher = less flickering)
- `MAX_FPS = 15` - Processing speed (lower = less CPU usage)

## Requirements

- Python 3.10
- macOS with webcam
- Roboflow API key
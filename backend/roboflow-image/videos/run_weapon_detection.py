"""
Weapon Detection Inference Script
Processes video with Roboflow's InferencePipeline and saves output with bounding boxes
Includes stabilization to prevent flickering
"""
from inference import get_model
import cv2
import supervision as sv
import os
import glob
from collections import deque

# Configuration
MODEL_ID = "weapon-detection-ctenp/1"
API_KEY = "jFtsGiCtuQBpOiDMNcPQ"
INPUT_VIDEO = "03_Rank_00:15.mp4"
OUTPUT_VIDEO = "output_with_detections.mp4"

# Stabilization settings
CONFIDENCE_THRESHOLD = 0.4  # 40% confidence threshold
STABILITY_FRAMES = 2   # Need 10 consecutive frames
NMS_THRESHOLD = 0.3

class DetectionStabilizer:
    """Prevents flickering by requiring consecutive detections"""
    def __init__(self, min_consecutive=STABILITY_FRAMES):
        self.detection_history = deque(maxlen=min_consecutive + 2)
        self.min_consecutive = min_consecutive
        self.last_stable = None
    
    def update(self, detections):
        has_detection = len(detections) > 0
        self.detection_history.append(has_detection)
        
        recent = sum(list(self.detection_history)[-self.min_consecutive:])
        
        if recent >= self.min_consecutive:
            if has_detection:
                self.last_stable = detections
                return detections
            elif self.last_stable is not None:
                return self.last_stable
        
        if recent == 0:
            self.last_stable = None
        
        return sv.Detections.empty()

def process_all_videos_in_directory():
    """
    Batch processing function that traverses through the entire videos directory
    and creates annotated videos for all video files using weapon detection.
    This function can be easily commented out when not needed.
    """
    print("🔫 Starting Batch Video Processing")
    print("=" * 50)
    
    # Get current directory (should be videos directory)
    current_dir = os.getcwd()
    print(f"Processing directory: {current_dir}")
    
    # Find all video files in the directory
    video_extensions = ['*.mp4', '*.avi', '*.mov', '*.mkv', '*.wmv', '*.flv', '*.webm']
    video_files = []
    
    for extension in video_extensions:
        video_files.extend(glob.glob(extension))
    
    # Filter out already processed files (those with '_detected' in name)
    input_videos = [f for f in video_files if '_detected' not in f and f != 'output_with_detections.mp4']
    
    if not input_videos:
        print("No video files found to process!")
        return
    
    print(f"Found {len(input_videos)} video files to process:")
    for video in input_videos:
        print(f"  - {video}")
    
    # Initialize the model once for all videos
    print("\nInitializing model...")
    try:
        model = get_model(
            model_id=MODEL_ID,
            api_key=API_KEY
        )
        print("✅ Model initialized successfully")
    except Exception as e:
        print(f"❌ Error initializing model: {e}")
        return
    
    # Initialize annotators
    box_annotator = sv.BoxAnnotator(thickness=5, color=sv.Color.RED)
    label_annotator = sv.LabelAnnotator(text_color=sv.Color.WHITE, text_thickness=2)
    
    # Process each video file
    for i, input_video in enumerate(input_videos, 1):
        print(f"\n🎬 Processing video {i}/{len(input_videos)}: {input_video}")
        print("-" * 40)
        
        # Create output filename
        name, ext = os.path.splitext(input_video)
        output_video = f"{name}_detected{ext}"
        
        # Skip if output already exists
        if os.path.exists(output_video):
            print(f"⏭️  Skipping {input_video} - output already exists: {output_video}")
            continue
        
        try:
            # Initialize stabilizer for this video
            stabilizer = DetectionStabilizer()
            
            # Open input video
            cap = cv2.VideoCapture(input_video)
            if not cap.isOpened():
                print(f"❌ Error: Could not open video '{input_video}'")
                continue
            
            # Get video properties
            fps = int(cap.get(cv2.CAP_PROP_FPS))
            width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
            height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
            total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
            
            print(f"📊 Video properties: {width}x{height} @ {fps}fps, {total_frames} frames")
            
            # Initialize video writer
            fourcc = cv2.VideoWriter_fourcc(*'mp4v')
            out = cv2.VideoWriter(output_video, fourcc, fps, (width, height))
            
            frame_count = 0
            detection_count = 0
            
            print("🔄 Processing frames...")
            
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                
                frame_count += 1
                
                # Run inference on frame
                try:
                    results = model.infer(frame)[0]
                    detections = sv.Detections.from_inference(results)
                    
                    # Filter by confidence
                    if len(detections) > 0:
                        detections = detections[detections.confidence > CONFIDENCE_THRESHOLD]
                        detections = detections.with_nms(threshold=NMS_THRESHOLD)
                    
                    # Apply stabilization to prevent flickering
                    stable_detections = stabilizer.update(detections)
                    
                    # Only draw boxes if we have stable detections
                    if len(stable_detections) > 0:
                        # Draw bounding boxes
                        frame = box_annotator.annotate(scene=frame, detections=stable_detections)
                        # Draw labels
                        frame = label_annotator.annotate(scene=frame, detections=stable_detections)
                        detection_count += len(stable_detections)
                        if frame_count % 30 == 0:  # Print every 30 frames
                            print(f"  Frame {frame_count}: Found {len(stable_detections)} weapons")
                
                except Exception as e:
                    print(f"  ⚠️  Error processing frame {frame_count}: {e}")
                
                # Write frame to output video
                out.write(frame)
                
                # Print progress every 100 frames
                if frame_count % 100 == 0:
                    progress = (frame_count / total_frames) * 100
                    print(f"  📈 Progress: {progress:.1f}% ({frame_count}/{total_frames} frames)")
            
            # Clean up
            cap.release()
            out.release()
            
            print(f"✅ Completed: {input_video} → {output_video}")
            print(f"📊 Total detections: {detection_count} across {frame_count} frames")
            
        except Exception as e:
            print(f"❌ Error processing {input_video}: {e}")
            continue
    
    print(f"\n🎉 Batch processing completed!")
    print(f"📁 Processed {len(input_videos)} video files")
    print("=" * 50)

def main():
    """
    Main function to run weapon detection inference
    """
    print("🔫 Starting Weapon Detection Inference")
    print(f"Input video: {INPUT_VIDEO}")
    print(f"Output video: {OUTPUT_VIDEO}")
    
    # Check if input video exists
    if not os.path.exists(INPUT_VIDEO):
        print(f"Error: Input video '{INPUT_VIDEO}' not found!")
        return
    
    try:
        # Initialize the model
        print("Initializing model...")
        model = get_model(
            model_id=MODEL_ID,
            api_key=API_KEY
        )
        
        # Initialize annotators
        box_annotator = sv.BoxAnnotator(thickness=5, color=sv.Color.RED)
        label_annotator = sv.LabelAnnotator(text_color=sv.Color.WHITE, text_thickness=2)
        
        # Initialize stabilizer
        stabilizer = DetectionStabilizer()
        
        # Open input video
        cap = cv2.VideoCapture(INPUT_VIDEO)
        if not cap.isOpened():
            print(f"Error: Could not open video '{INPUT_VIDEO}'")
            return
        
        # Get video properties
        fps = int(cap.get(cv2.CAP_PROP_FPS))
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        print(f"Video properties: {width}x{height} @ {fps}fps, {total_frames} frames")
        
        # Initialize video writer
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        out = cv2.VideoWriter(OUTPUT_VIDEO, fourcc, fps, (width, height))
        
        frame_count = 0
        
        print("Processing video...")
        
        while True:
            ret, frame = cap.read()
            if not ret:
                break
            
            frame_count += 1
            
            # Run inference on frame
            try:
                results = model.infer(frame)[0]
                detections = sv.Detections.from_inference(results)
                
                # Filter by confidence
                if len(detections) > 0:
                    detections = detections[detections.confidence > CONFIDENCE_THRESHOLD]
                    detections = detections.with_nms(threshold=NMS_THRESHOLD)
                
                # Apply stabilization to prevent flickering
                stable_detections = stabilizer.update(detections)
                
                # Only draw boxes if we have stable detections
                if len(stable_detections) > 0:
                    # Draw bounding boxes
                    frame = box_annotator.annotate(scene=frame, detections=stable_detections)
                    # Draw labels
                    frame = label_annotator.annotate(scene=frame, detections=stable_detections)
                    print(f"Frame {frame_count}: Found {len(stable_detections)} weapons (stabilized)")
                
            except Exception as e:
                print(f"Error processing frame {frame_count}: {e}")
            
            # Write frame to output video
            out.write(frame)
            
            # Print progress every 30 frames
            if frame_count % 30 == 0:
                progress = (frame_count / total_frames) * 100
                print(f"Progress: {progress:.1f}% ({frame_count}/{total_frames} frames)")
        
        # Clean up
        cap.release()
        out.release()
        
        print(f"✅ Processing completed! Output saved as: {OUTPUT_VIDEO}")
        
    except Exception as e:
        print(f"Error during inference: {e}")
        return

if __name__ == "__main__":
    # Choose which function to run:
    
    # Option 1: Process a single video (original functionality)
    main()
    
    # Option 2: Process all videos in directory (batch processing)
    # Uncomment the line below to run batch processing instead:
    # process_all_videos_in_directory()
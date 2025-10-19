# 1. Import the InferencePipeline library
import os
import cv2
from dotenv import load_dotenv
from typing import Any, Dict

# Robust import: support running this file as a script and as a package
try:
    # When the package is installed or run as a module
    from .event_formatter import aggregator
except Exception:
    # Fallback to absolute import when executing the script directly
    try:
        from event_formatter import aggregator
    except Exception:
        aggregator = None

# Load environment variables from .env file
load_dotenv()


def my_sink(result, video_frame):
    # Display the video frame (always show camera feed)
    if result.get("output_image"):
        # Show workflow output if available (with detections)
        cv2.imshow("Gun Detection", result["output_image"].numpy_image)
    else:
        # Show raw frame if no workflow output
        cv2.imshow("Gun Detection", video_frame.image)

    cv2.waitKey(1)
    # Pass per-frame summary into the aggregator if available. If an event is emitted
    # aggregator.add_frame will return an event dict and internally push it to Supabase
    if aggregator is None:
        return
    try:
        camera_id = os.getenv("CAMERA_ID", "camera_1")
        event = aggregator.add_frame(result, camera_id)
        if event:
            print("Aggregated event emitted:", event.get("event_id"))
    except Exception as e:
        print("Aggregator error:", e)


def start_pipeline():
    # Import InferencePipeline lazily so module import doesn't require the library
    try:
        from inference import InferencePipeline
    except Exception as e:
        raise RuntimeError("Failed to import InferencePipeline: {}".format(e))

    # 2. Initialize a pipeline object
    pipeline = InferencePipeline.init_with_workflow(
        api_key=os.getenv("ROBOFLOW_API_KEY"),
        workspace_name=os.getenv("ROBOFLOW_WORKSPACE_NAME"),
        workflow_id=os.getenv("ROBOFLOW_WORKFLOW_ID"),
        video_reference=0,  # device id or path or RTSP
        max_fps=30,
        on_prediction=my_sink,
    )

    # 3. Initialize the display window
    cv2.namedWindow("Gun Detection", cv2.WINDOW_AUTOSIZE)

    # 4. Start the pipeline and wait for it to finish
    try:
        pipeline.start()
        pipeline.join()
    except KeyboardInterrupt:
        print("\nShutting down...")
    finally:
        # Clean up OpenCV windows
        cv2.destroyAllWindows()


if __name__ == "__main__":
    start_pipeline()

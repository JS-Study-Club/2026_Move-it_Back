import mediapipe as mp
import cv2
import json
import sys
import os

def extract_pose(video_path, model_path, start_time, duration, target_fps=10):
    BaseOptions = mp.tasks.BaseOptions
    PoseLandmarker = mp.tasks.vision.PoseLandmarker
    PoseLandmarkerOptions = mp.tasks.vision.PoseLandmarkerOptions
    VisionRunningMode = mp.tasks.vision.RunningMode

    options = PoseLandmarkerOptions(
        base_options=BaseOptions(model_asset_path=model_path),
        running_mode=VisionRunningMode.VIDEO)

    results_data = []

    with PoseLandmarker.create_from_options(options) as landmarker:
        cap = cv2.VideoCapture(video_path)
        original_fps = cap.get(cv2.CAP_PROP_FPS)
        if original_fps <= 0: original_fps = 30
        
        # Calculate frame skipping logic
        skip_factor = max(1, int(original_fps / target_fps))
        
        cap.set(cv2.CAP_PROP_POS_MSEC, start_time * 1000)
        
        frame_idx = 0
        processed_count = 0
        max_duration_frames = int(duration * original_fps) if duration else float('inf')

        while cap.isOpened() and frame_idx < max_duration_frames:
            success, frame = cap.read()
            if not success:
                break

            # Only process frames based on the skip factor
            if frame_idx % skip_factor == 0:
                timestamp_ms = int(cap.get(cv2.CAP_PROP_POS_MSEC))
                
                # Convert the BGR image to RGB
                rgb_frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb_frame)

                # Perform pose landmarking
                detection_result = landmarker.detect_for_video(mp_image, timestamp_ms)

                if detection_result.pose_landmarks:
                    landmarks = detection_result.pose_landmarks[0]
                    serialized_landmarks = []
                    for lm in landmarks:
                        # Round values to 4 decimal places to reduce JSON size
                        serialized_landmarks.append({
                            'x': round(lm.x, 4),
                            'y': round(lm.y, 4),
                            'z': round(lm.z, 4),
                            'v': round(lm.visibility, 3) # shortened key and precision
                        })
                    
                    results_data.append({
                        't': round(timestamp_ms / 1000.0, 3), # shortened key
                        'l': serialized_landmarks            # shortened key
                    })
                
                processed_count += 1

            frame_idx += 1

        cap.release()

    return results_data

if __name__ == "__main__":
    if len(sys.argv) < 5:
        print("Usage: python pose_extractor.py <video_path> <model_path> <start_time> <duration> [target_fps]")
        sys.exit(1)

    video_path = sys.argv[1]
    model_path = sys.argv[2]
    start_time = float(sys.argv[3])
    duration = float(sys.argv[4]) if sys.argv[4] != 'None' else None
    target_fps = int(sys.argv[5]) if len(sys.argv) > 5 else 10

    try:
        results = extract_pose(video_path, model_path, start_time, duration, target_fps)
        print(json.dumps(results))
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

import cv2
from PIL import Image
import numpy as np
from typing import List


def extract_frames(video_path: str, fps: int = 1, max_frames: int = 30) -> List[Image.Image]:
    """
    Extract frames from a video at a given rate.
    - fps: how many frames to sample per second
    - max_frames: cap to avoid processing too many frames
    Returns a list of PIL Images.
    """
    cap = cv2.VideoCapture(video_path)

    if not cap.isOpened():
        raise ValueError(f"Could not open video: {video_path}")

    video_fps = cap.get(cv2.CAP_PROP_FPS)
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))

    if video_fps <= 0:
        video_fps = 25  # fallback

    # Sample interval: every N frames
    interval = max(1, int(video_fps / fps))

    frames = []
    frame_idx = 0

    while cap.isOpened() and len(frames) < max_frames:
        ret, frame = cap.read()
        if not ret:
            break

        if frame_idx % interval == 0:
            # Convert BGR (OpenCV) to RGB (PIL)
            rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            pil_img = Image.fromarray(rgb)
            frames.append(pil_img)

        frame_idx += 1

    cap.release()
    return frames
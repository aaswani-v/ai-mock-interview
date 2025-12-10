"""
Generate a simple test video with audio for testing the API.
Creates a 5-second video with a black screen, text, and a simple audio tone.
"""

import cv2
import numpy as np
from pathlib import Path
import subprocess
import os

def generate_test_video_with_audio(output_path: str, duration_seconds: int = 5, fps: int = 30):
    """
    Generate a simple test video with audio.
    
    Args:
        output_path: Path to save the video
        duration_seconds: Video duration in seconds
        fps: Frames per second
    """
    width, height = 640, 480
    temp_video = output_path.replace('.mp4', '_temp.mp4')
    
    # Create video without audio first
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    out = cv2.VideoWriter(temp_video, fourcc, fps, (width, height))
    
    total_frames = duration_seconds * fps
    
    for frame_num in range(total_frames):
        # Create black frame
        frame = np.zeros((height, width, 3), dtype=np.uint8)
        
        # Add text
        text = f"Test Video - Frame {frame_num}/{total_frames}"
        cv2.putText(frame, text, (50, height//2), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
        
        # Add a simple animation (moving circle)
        x = int((frame_num / total_frames) * width)
        y = height // 2 + 50
        cv2.circle(frame, (x, y), 20, (0, 255, 0), -1)
        
        out.write(frame)
    
    out.release()
    print(f"✅ Generated video (no audio): {temp_video}")
    
    # Add silent audio track using ffmpeg
    # Generate a silent audio track
    ffmpeg_path = "ffmpeg.exe" if os.path.exists("ffmpeg.exe") else "ffmpeg"
    
    cmd = [
        ffmpeg_path,
        "-f", "lavfi",
        "-i", f"anullsrc=channel_layout=mono:sample_rate=16000",
        "-i", temp_video,
        "-c:v", "copy",
        "-c:a", "aac",
        "-t", str(duration_seconds),
        "-shortest",
        "-y",
        output_path
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, check=True)
        print(f"✅ Added audio track: {output_path}")
        
        # Remove temp file
        os.remove(temp_video)
        
        # Check file size
        file_size_mb = Path(output_path).stat().st_size / (1024 * 1024)
        print(f"   Duration: {duration_seconds}s, FPS: {fps}, Frames: {total_frames}")
        print(f"   File size: {file_size_mb:.2f} MB")
        
    except subprocess.CalledProcessError as e:
        print(f"❌ Failed to add audio: {e.stderr}")
        print(f"   Using video without audio: {temp_video}")
        if os.path.exists(temp_video):
            os.rename(temp_video, output_path)


if __name__ == "__main__":
    output_dir = Path(__file__).parent
    output_file = output_dir / "short_speech.mp4"
    
    # Remove old file if exists
    if output_file.exists():
        output_file.unlink()
    
    generate_test_video_with_audio(str(output_file), duration_seconds=5, fps=30)

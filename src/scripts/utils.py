import json
from typing import Any
import shutil
import cv2
import base64
import os



def read_json_file(file_path: str) -> Any:
    with open(file_path, 'r') as file:
        return json.load(file)


def write_json_file(file_path: str, data: Any) -> None:
    with open(file_path, 'w') as file:
        json.dump(data, file, indent=4)

def preprocess_video(input_vid_path: str, output_vid_path: str, fps=2, height=720, silent=True) -> None:
    """Preprocesses a video file to reduce its size and frame rate."""
    if not shutil.which("ffmpeg"):
        raise FileNotFoundError("ffmpeg not found on the system.")

    command = f'ffmpeg -i {input_vid_path} -vf scale=-2:{height} -r {fps} -preset ultrafast -an {output_vid_path} -y {"-nostats -loglevel 0" if silent else ""}'

    os.system(command)

def clip_video(input_vid_path: str, output_vid_path: str, start_time: int, end_time: int, silent=True) -> None:
    """Clips a video file."""
    if not shutil.which("ffmpeg"):
        raise FileNotFoundError("ffmpeg not found on the system.")

    command = f'ffmpeg -i {input_vid_path} -ss {start_time} -to {end_time} -c copy {output_vid_path} -y {"-nostats -loglevel 0" if silent else ""}'

    os.system(command)

def extract_frames_fixed(video_path, interval = 1):
    print(video_path)
    video = cv2.VideoCapture(video_path)
    frames = []
    fps = video.get(cv2.CAP_PROP_FPS)
    #get frames at fixed interval in seconds
    frame_interval = int(fps) * interval
    count = 0

    total_frames = int(video.get(cv2.CAP_PROP_FRAME_COUNT))
    print(total_frames, frame_interval)
    for i in range(0, total_frames, frame_interval):
        video.set(cv2.CAP_PROP_POS_FRAMES, i)
        ret, frame = video.read()
        if ret:
            frames.append(frame)
            count += 1

    video.release()
    return frames

def reduce_resolution(frames, width = 320, height = 240):
    reduced_frames = []
    for frame in frames:
        reduced_frames.append(cv2.resize(frame, (width, height)))
    return reduced_frames

def base64_encode_frames(frames):
    encoded_frames = []

    for frame in frames:
        _, buffer = cv2.imencode('.jpg', frame)
        encoded_frames.append(base64.b64encode(buffer).decode('utf-8'))

    return encoded_frames

import json
from typing import Any
import shutil
import cv2
import base64
import os
import subprocess
import sys
import logging

logger = logging.getLogger(__name__)

def read_json_file(file_path: str) -> Any:
    with open(file_path, 'r', encoding='utf-8') as file:
        return json.load(file)


def write_json_file(file_path: str, data: Any) -> None:
    with open(file_path, 'w', encoding='utf-8') as file:
        json.dump(data, file, indent=4)

def preprocess_video(input_vid_path: str, output_vid_path: str, fps=2, height=720, silent=True) -> None:
    """Preprocesses a video file to reduce its size and frame rate."""

    command = [
        'ffmpeg',
        "-i", input_vid_path,
        "-vf", f"scale=-2:{height}",
        "-r", str(fps),
        "-preset", "ultrafast",
        "-an",
        output_vid_path,
        "-y"
    ]
    if silent:
        command.extend(["-nostats", "-loglevel", "0"])

    subprocess.run(command)

def clip_video(input_vid_path: str, output_vid_path: str, start_time: int, end_time: int, silent=True) -> None:
    """Clips a video file."""
    if not shutil.which("ffmpeg"):
        logger.error("ffmpeg not found on the system.")
        raise FileNotFoundError("ffmpeg not found on the system.")

    command = [
        'ffmpeg',
        "-i", input_vid_path,
        "-ss", str(start_time),
        "-to", str(end_time),
        "-c", "copy",
        output_vid_path,
        "-y"
    ]
    if silent:
        command.extend(["-nostats", "-loglevel", "0"])

    subprocess.run(command)

def concat_videos(input_list_path: str, output_vid_path: str, silent=True) -> None:
    """Concatenates multiple video files."""

    command = [
        'ffmpeg',
        "-f", "concat",
        "-safe", "0",
        "-i", input_list_path,
        "-c", "copy",
        output_vid_path,
        "-y"
    ]

    if silent:
        command.extend(["-nostats", "-loglevel", "0"])

    subprocess.run(command)


def extract_frames_fixed(video_path, interval = 1):
    video = cv2.VideoCapture(video_path)
    frames = []
    fps = video.get(cv2.CAP_PROP_FPS)
    #get frames at fixed interval in seconds
    frame_interval = int(fps) * interval
    count = 0

    total_frames = int(video.get(cv2.CAP_PROP_FRAME_COUNT))
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

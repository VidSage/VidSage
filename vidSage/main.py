import sys
import json
import os

def handle_generate_summaries(input_json_path: str, output_json_path: str):
    data = [
        {
            "file": {
                "absolutePath": "/path/to/clip1.mp4",
                "name": "Clip1",
            },
            "summary": "Summary of clip1",
            "astheticRating": 4,
            "segments": [
                {
                    "startTimeSec": 0,
                    "endTimeSec": 20,
                    "description": "展示户外秋天的场景",
                    "srcFile": None,
                },
                {
                    "startTimeSec": 20,
                    "endTimeSec": 90,
                    "description": "5个人在打篮球",
                    "srcFile": None,
                },
                {
                    "startTimeSec": 90,
                    "endTimeSec": 130,
                    "description": "展示有绿色植物的校园环境",
                    "srcFile": None,
                },
                {
                    "startTimeSec": 130,
                    "endTimeSec": 170,
                    "description": "展示蓝色天空和大面积湖水",
                    "srcFile": None,
                },
                {
                    "startTimeSec": 170,
                    "endTimeSec": 200,
                    "description": "展示校园和大量行人",
                    "srcFile": None,
                },
            ],
        },
        {
            "file": {
                "absolutePath": "/path/to/clip2.mp4",
                "name": "Clip2",
            },
            "summary": "Summary of clip2",
            "astheticRating": 3,
            "segments": [
                {
                    "startTimeSec": 0,
                    "endTimeSec": 30,
                    "description": "Scene with morning light",
                    "srcFile": None,
                },
                {
                    "startTimeSec": 30,
                    "endTimeSec": 60,
                    "description": "Overview of the campus library",
                    "srcFile": None,
                },
                {
                    "startTimeSec": 60,
                    "endTimeSec": 90,
                    "description": "Students walking through corridors",
                    "srcFile": None,
                },
            ],
        },
        {
            "file": {
                "absolutePath": "/path/to/clip3.mp4",
                "name": "Clip3",
            },
            "summary": "Summary of clip3",
            "astheticRating": 5,
            "segments": [
                {
                    "startTimeSec": 0,
                    "endTimeSec": 60,
                    "description": "A panoramic view of the city",
                    "srcFile": None,
                },
            ],
        },
        {
            "file": {
                "absolutePath": "/path/to/clip4.mp4",
                "name": "Clip4",
            },
            "summary": "Summary of clip4",
            "astheticRating": 4,
            "segments": [
                {
                    "startTimeSec": 0,
                    "endTimeSec": 30,
                    "description": "Intro scene with music",
                    "srcFile": None,
                },
                {
                    "startTimeSec": 30,
                    "endTimeSec": 60,
                    "description": "Main content",
                    "srcFile": None,
                },
            ],
        },
        {
            "file": {
                "absolutePath": "/path/to/clip5.mp4",
                "name": "Clip5",
            },
            "summary": "Summary of clip5",
            "astheticRating": 2,
            "segments": [
                {
                    "startTimeSec": 0,
                    "endTimeSec": 50,
                    "description": "Experimental footage",
                    "srcFile": None,
                },
            ],
        },
    ]
    with open(output_json_path, "w", encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)


def handle_generate_storyline(input_json_path: str, output_json_path: str):
    data = [
        {
            "startTimeSec": 0,
            "endTimeSec": 20,
            "description": "展示户外秋天的场景",
            "srcFile": {"absolutePath": "/path/to/clip1.mp4", "name": "Clip 1"},
        },
        {
            "startTimeSec": 20,
            "endTimeSec": 90,
            "description": "5个人在打篮球",
            "srcFile": {"absolutePath": "/path/to/clip2.mp4", "name": "Clip 2"},
        },
        {
            "startTimeSec": 90,
            "endTimeSec": 130,
            "description": "展示有绿色植物的校园环境",
            "srcFile": {"absolutePath": "/path/to/clip1.mp4", "name": "Clip 1"},
        },
        {
            "startTimeSec": 130,
            "endTimeSec": 170,
            "description": "展示蓝色天空和大面积湖水",
            "srcFile": {"absolutePath": "/path/to/clip3.mp4", "name": "Clip 3"},
        },
        {
            "startTimeSec": 170,
            "endTimeSec": 200,
            "description": "展示校园和大量行人",
            "srcFile": {"absolutePath": "/path/to/clip2.mp4", "name": "Clip 2"},
        },
    ]
    with open(output_json_path, "w", encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=4)

def handle_generate_video(input_json_path: str, output_video_path: str):
    os.rename("D:\Downloads\cup.mp4", output_video_path)

def main():
    # Check if the required positional argument is provided
    if len(sys.argv) != 4:
        print("Usage: python script.py <argument>")
        sys.exit(1)
    
    op = sys.argv[1]

    if op == "generateSummaries":
        handle_generate_summaries(sys.argv[2], sys.argv[3])
    elif op == "generateStoryline":
        handle_generate_storyline(sys.argv[2], sys.argv[3])
    elif op == "generateVideo":
        handle_generate_video(sys.argv[2], sys.argv[3])
    else:
        print("Invalid operation")
        sys.exit(1)

if __name__ == "__main__":
    main()

import os
from typing import List
from scenedetect import detect, HashDetector

from utils import read_json_file, write_json_file, preprocess_video, extract_frames_fixed, reduce_resolution, base64_encode_frames
from videoObjects import VideoFile, Segment, VideoSummary, Story, Scene





def generate_summaries(input_json_path: str, output_json_path: str, task_id: str, llm_client, LLM_IMG_LIMIT = 50) -> bool:
    """Generates video summaries based on input JSON."""
    files = read_json_file(input_json_path)

    #create a temp directory
    task_folder = f'./tmp/{task_id}'
    os.makedirs(task_folder, exist_ok=True)
    scenes = {}

    #preprocess the video files and detect scenes
    for file in files:
        file = file['file']
        input_vid_path = file['absolutePath']
        output_vid_path = f'{task_folder}/{file["name"]}'
        print(output_vid_path)
        preprocess_video(input_vid_path, output_vid_path)

        scene_list = detect(output_vid_path, HashDetector(threshold=0.45))
        scene_sec = []
        for scene in scene_list:
            scene_sec.append((int(scene[0].get_seconds()), int(scene[1].get_seconds())))

        scenes[file['absolutePath']] = scene_sec
        os.remove(output_vid_path)

    print('finished preprocessing')
    #generate summaries
    summaries = []
    for file in files:
        file = file['file']
        input_vid_path = file['absolutePath']
        frames = extract_frames_fixed(input_vid_path)
        reduced_frames = reduce_resolution(frames,1280, 720)
        encoded_frames = base64_encode_frames(reduced_frames)
        output_messages = []
        scene_sec = scenes[input_vid_path]
        if not scene_sec:
            scene_sec = [(0, len(frames))]
        segments = []
        for scene in scene_sec:
            startTimeSec = scene[0]
            endTimeSec = scene[1]
            segment = Segment(startTimeSec, endTimeSec, "filtered")
            for i in range(startTimeSec, endTimeSec, LLM_IMG_LIMIT):
                end_second = min(i + LLM_IMG_LIMIT - 1, endTimeSec - 1)
                messages = [
                    { "role": "system", "content": "You are good at analyzing the video willing to provide the detailed descriptions of the video, include all the objects you see in the video as well as the position of the objects." },
                    { "role": "user", "content": [
                        {
                            "type": "text",
                            "text":
                            f"""
                            Give me the detailed description of the provided sequence of frames from the video.
                            """
                        }
                    ] }
                ]
                if output_messages:
                    messages[1]['content'][0]['text'] += f"\n Here are previous descriptions from {startTimeSec} to {i - 1} seconds, combine the previous description and give me a new description \n" + output_messages[-1]

                for frame in (encoded_frames[i:i+LLM_IMG_LIMIT] if i+LLM_IMG_LIMIT < end_second else encoded_frames[i:end_second]):
                    messages[1]['content'].append(
                        {
                            "type": "image_url",
                            "image_url": {
                                "url" : f"data:image/jpeg;base64,{frame}",
                                "detail": "low"
                            }
                        }
                    )
                for _ in range(3):
                    try:
                        response = llm_client.chat.completions.create(
                            model="gpt-4o",
                            messages=messages,
                            max_tokens=4000
                        )
                        output_messages.append(response.choices[0].message.content)
                        # print(len(encoding.encode(output_messages[-1])))
                        # print(response.choices[0].message.content)
                        break
                    except Exception as e:
                        print(e)
                        messages[1]['content'][0]['text'] += "\n Your last response was filtered by the Azure content filter. Please avoid using inappropriate language."
                        print("Retrying...")
            if output_messages:
                segment.description = output_messages[-1]
            segments.append(segment)
            print(segment.startTimeSec, segment.endTimeSec)
            print(segment.description)

        # TODO: generate the whole summary and aesthetic rating
        summaries.append(VideoSummary(VideoFile(file['absolutePath'], file['name']), "whole summary", 4, segments))

    write_json_file(output_json_path, [summary.to_dict() for summary in summaries])

    return True


def generate_storyline(input_json_path: str, output_json_path: str, task_id: str, llm_client) -> bool:
    """Generates a storyline based on video summaries and a user prompt."""
    task_folder = f'./tmp/{task_id}'
    if not os.path.exists(task_folder):
        print(f"Task folder {task_folder} does not exist")
        return False
    summaries = read_json_file(input_json_path)
    all_summaries = ""
    for summary in summaries:
        for segment in summary['segments']:
            all_summaries += f"{summary['file']['absolutePath']} from {segment['startTimeSec']} to {segment['endTimeSec']}: \n {segment['description']} \n ---------------- \n"

    messages = [
        { "role": "system", "content": "You are very helpful and are very good at giving storyline based on the footages" },
        { "role": "user", "content": [
            {
                "type": "text",
                "text":
                f"""
                Based on the description of the videos, suggest me a story with selected parts of videos. You can change the order of the input.

                {all_summaries}
                """
            }
        ] }
    ]

    for _ in range(1):
      try:
          response = llm_client.beta.chat.completions.parse(
              model="gpt-4o", #TODO: fill in the model
              response_format=Story,
              messages=messages,
              max_tokens=2000
          )
          # print(response.choices[0].message.parsed)
          out_story = response.choices[0].message.parsed
          break
      except Exception as e:
          print(e)
          print("Retrying...")

    # Mock implementation
    storyline = []

    tmp_folder = f'./tmp/{task_id}/clips'
    os.makedirs(tmp_folder, exist_ok=True)
    for scene in out_story.scenes:
        input_vid_path = scene.file_path
        if not os.path.exists(input_vid_path):
            print(f"File {input_vid_path} does not exist")
            continue
        # use ffmpeg to extract the scene
        filename = os.path.basename(input_vid_path)
        output_vid_path = f'{tmp_folder}/{filename}_{scene.start}_{scene.end}.mp4'
        command = f'ffmpeg -i {input_vid_path} -ss {scene.start} -to {scene.end} -c copy {output_vid_path}'
        os.system(command)
        storyline.append({
            "startTimeSec": scene.start,
            "endTimeSec": scene.end,
            "description": scene.story,
            "srcFile": {
                "absolutePath": os.path.abspath(output_vid_path),
                "name": f"{filename}_{scene.start}_{scene.end}.mp4"
            }
        })

    write_json_file(output_json_path, storyline)

    return True


def generate_video(input_json_path: str, output_video_path: str, task_id: str) -> bool:
    """Generates a video file from segments."""
    task_folder = f'./tmp/{task_id}'
    if not os.path.exists(task_folder):
        print(f"Task folder {task_folder} does not exist")
        return False
    storyline = read_json_file(input_json_path)

    video_list = [story['srcFile']['absolutePath'] for story in storyline]
    tmp_folder = f'./tmp/{task_id}'
    with open(f'{tmp_folder}/vid_list.txt', 'w') as f:
        for video in video_list:
            f.write(f"file '{video}'\n")

    os.system(f'ffmpeg -f concat -safe 0 -i {tmp_folder}/vid_list.txt -c copy {output_video_path} -y -nostats -loglevel 0')

    return True

def remove_temp_files(task_id: str) -> None:
    """Removes temporary files."""
    task_folder = f'./tmp/{task_id}'
    if os.path.exists(task_folder):
        os.system(f'rm -rf {task_folder}')

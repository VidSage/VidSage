import os
from typing import List
from scenedetect import detect, HashDetector
import shutil

from utils import read_json_file, write_json_file, preprocess_video, extract_frames_fixed, reduce_resolution, base64_encode_frames, concat_videos, clip_video
from videoObjects import VideoFile, Segment, VideoSummary, Story, Scene, Description
import logging





def generate_summaries(input_json_path: str, output_json_path: str, llm_client, LLM_IMG_LIMIT = 50) -> bool:
    """Generates video summaries based on input JSON."""
    args = read_json_file(input_json_path)
    task_id = args['taskId']
    files = args['files']


    #create a temp directory
    task_folder = f'./tmp/{task_id}'
    os.makedirs(task_folder, exist_ok=True)
    scenes = {}

    #preprocess the video files and detect scenes
    logging.debug("Preprocessing videos...")
    for file in files:
        input_vid_path = file['absolutePath']
        filename = os.path.basename(input_vid_path)
        output_vid_path = f'{task_folder}/{filename}'
        logging.debug(f"Preprocessing video: {input_vid_path}")
        preprocess_video(input_vid_path, output_vid_path)

        scene_list = detect(output_vid_path, HashDetector(threshold=0.45))
        scene_sec = []
        for scene in scene_list:
            scene_sec.append((int(scene[0].get_seconds()), int(scene[1].get_seconds())))

        scenes[file['absolutePath']] = scene_sec
        os.remove(output_vid_path)
    logging.debug("Preprocessing complete.")

    logging.debug("Generating summaries...")
    #generate summaries
    summaries = []
    for file in files:
        input_vid_path = file['absolutePath']
        logging.debug(f"Generating summary for video: {input_vid_path}")
        frames = extract_frames_fixed(input_vid_path)
        reduced_frames = reduce_resolution(frames, 1280, 720)
        encoded_frames = base64_encode_frames(reduced_frames)
        output_messages = []
        scene_sec = scenes[input_vid_path]
        if not scene_sec:
            scene_sec = [(0, len(frames))]
        segments = []
        ratings = []
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
                            Give me the detailed description of the provided sequence of frames from the video. Additionally, give me the aesthetic rating from 1 to 5 for the sequence of frames.
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
                        response = llm_client.beta.chat.completions.parse(
                            model="gpt-4o",
                            response_format=Description,
                            messages=messages,
                            max_tokens=4000
                        )
                        desc = response.choices[0].message.parsed
                        output_messages.append(desc.description)
                        ratings.append(desc.aestheticRating)
                        break
                    except Exception as e:
                        logging.error(e)
                        messages[1]['content'][0]['text'] += "\n Your last response was filtered by the Azure content filter. Please avoid using inappropriate language."

            if output_messages:
                segment.description = output_messages[-1]
            segments.append(segment)
            logging.debug(f"Segment from {startTimeSec} to {endTimeSec} seconds: {segment.description}")
            logging.debug(f"Rating: {ratings[-1]}")

        whole = ''
        for segment in segments:
            whole += 'from ' + str(segment.startTimeSec) + ' to ' + str(segment.endTimeSec) + ' seconds: \n'
            whole += segment.description + '\n'

        messages = [
            { "role": "user", "content": [
                {
                    "type": "text",
                    "text":
                    f"""
                    Based on the description of the video from each part, give me a short summary of the video.

                    {whole}
                    """
                }
            ] }
        ]
        for _ in range(3):
            try:
                response = llm_client.chat.completions.create(
                    model="gpt-4o",
                    messages=messages,
                    max_tokens=4000
                )
                whole_summary = response.choices[0].message.content
                break
            except Exception as e:
                logging.error(e)
                messages[0]['content'][0]['text'] += "\n Your last response was filtered by the Azure content filter. Please avoid using inappropriate language."

        rating = round(sum(ratings) / len(ratings))
        summaries.append(VideoSummary(VideoFile(file['absolutePath'], os.path.basename(file['name'])), whole_summary, rating, segments))

    write_json_file(output_json_path, [summary.to_dict() for summary in summaries])

    return True


def generate_storyline(input_json_path: str, output_json_path: str, llm_client) -> bool:
    """Generates a storyline based on video summaries and a user prompt."""
    args = read_json_file(input_json_path)
    task_id = args['taskId']
    summaries = args['summaries']
    prompt = args['prompt']
    duration = args['duration']


    task_folder = f'./tmp/{task_id}'
    os.makedirs(task_folder, exist_ok=True)
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
    if prompt != "":
        messages[1]['content'].append(
            {
                "type": "text",
                "text": f"""
                Here is the prompt user want the story to be based on:
                {prompt}
                """
            }
        )
    messages[1]['content'].append(
        {
            "type": "text",
            "text": f"""
            The duration of the whole video should be around {duration} minutes.
            """
        }
    )
    for _ in range(1):
      try:
          response = llm_client.beta.chat.completions.parse(
              model="gpt-4o",
              response_format=Story,
              messages=messages,
              max_tokens=2000
          )
          out_story = response.choices[0].message.parsed
          break
      except Exception as e:
          logging.error(e)
          messages[1]['content'][0]['text'] += "\n Your last response was filtered by the Azure content filter. Please avoid using inappropriate language."

    storyline = []

    tmp_folder = f'./tmp/{task_id}/clips'
    os.makedirs(tmp_folder, exist_ok=True)
    for scene in out_story.scenes:
        input_vid_path = scene.file_path
        if not os.path.exists(input_vid_path):
            logging.error(f"File {input_vid_path} does not exist.")
            continue
        # use ffmpeg to extract the scene
        filename = os.path.basename(input_vid_path)

        output_vid_path = f'{tmp_folder}/{filename}_{scene.start}_{scene.end}.mp4'

        clip_video(input_vid_path, output_vid_path, scene.start, scene.end)
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


def generate_video(input_json_path: str, output_video_path: str) -> bool:
    """Generates a video file from segments."""
    args = read_json_file(input_json_path)
    task_id = args['taskId']
    storyline = args['segments']

    task_folder = f'./tmp/{task_id}'
    os.makedirs(task_folder, exist_ok=True)

    video_list = [story['srcFile']['absolutePath'] for story in storyline]
    tmp_folder = f'./tmp/{task_id}'
    with open(f'{tmp_folder}/vid_list.txt', 'w') as f:
        for video in video_list:
            f.write(f"file '{video}'\n")

    concat_videos(f'{tmp_folder}/vid_list.txt', output_video_path)

    return True

def remove_temp_files() -> None:
    """Removes temporary files."""
    tmp_folder = './tmp/'
    shutil.rmtree(tmp_folder)


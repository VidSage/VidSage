import os
import json


if __name__ == '__main__':
    vid_folder = 'E:\\blitzat\\PKUCampus'
    vid_files = [f for f in os.listdir(vid_folder) if f.endswith('.MOV')]
    input_json = []
    for file in vid_files[:3]:
      input_json.append({
          "file": {
              "absolutePath": os.path.join(vid_folder, file),
              "name": file
          }
      })

    task_id = '1234'
    task_folder = f'./tmp/{task_id}'
    os.makedirs(task_folder, exist_ok=True)
    with open(os.path.join(task_folder, 'input.json'), 'w') as f:
        json.dump(input_json, f)

    input_path = os.path.join(task_folder, 'input.json')
    summary_path = os.path.join(task_folder, 'summary.json')
    os.system(f'python src/scripts/vidsage.py generateSummaries {input_path} {summary_path} {task_id}')

    with open(summary_path, 'r') as f:
        summaries = json.load(f)
        print(json.dumps(summaries, indent=4))

    story_path = os.path.join(task_folder, 'storyOutput.json')
    os.system(f'python src/scripts/vidsage.py generateStoryline {summary_path} {story_path} {task_id}')

    with open(story_path, 'r') as f:
        storyline = json.load(f)
        print(json.dumps(storyline, indent=4))

    os.system(f'python src/scripts/vidsage.py generateVideo {story_path} {os.path.join(task_folder, "output.mp4")} {task_id}')
    print('Done!')


import sys
from tasks import generate_summaries, generate_storyline, generate_video
import dotenv
import os
from openai import OpenAI
import uuid


if __name__ == "__main__":
    dotenv.load_dotenv()

    if len(sys.argv) < 5:
        print("Usage: python vidSage.py <command> <input_json_path> <output_path> <task_id>")
        sys.exit(1)

    command = sys.argv[1]
    input_json_path = sys.argv[2]
    output_path = sys.argv[3]
    task_id = sys.argv[4]

    client = OpenAI()


    if command == "generateSummaries":
        generate_summaries(input_json_path, output_path, task_id, client)
    elif command == "generateStoryline":
        generate_storyline(input_json_path, output_path, task_id, client)
    elif command == "generateVideo":
        generate_video(input_json_path, output_path, task_id)
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)

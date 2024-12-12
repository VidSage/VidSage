import sys

from tasks import generate_summaries, generate_storyline, generate_video, remove_temp_files
import dotenv
import os
from openai import OpenAI
import uuid


if __name__ == "__main__":
    # dotenv.load_dotenv()
    # # print(os.getenv("OPENAI_API_KEY"))

    # if os.getenv("OPENAI_API_KEY") is None:
    #     print("OPENAI_API_KEY environment variable not set.")
    #     sys.exit(1)

    if len(sys.argv) == 1 and sys.argv[1] == 'cleanUp':
        remove_temp_files()
        sys.exit(0)
    elif len(sys.argv) != 5:
        print("Usage: python main.py <command> <input_json_path> <output_path> <api_key> | python main.py cleanUp")
        sys.exit(1)

    command = sys.argv[1]
    input_json_path = sys.argv[2]
    output_path = sys.argv[3]
    api_key = sys.argv[4]

    client = OpenAI(api_key=api_key)

    if command == "generateSummaries":
        generate_summaries(input_json_path, output_path, client)
    elif command == "generateStoryline":
        generate_storyline(input_json_path, output_path, client)
    elif command == "generateVideo":
        generate_video(input_json_path, output_path)
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)

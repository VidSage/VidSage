import sys
from tasks import generate_summaries, generate_storyline, generate_video, remove_temp_files
import dotenv
import os
from openai import OpenAI
import uuid


if __name__ == "__main__":
    dotenv.load_dotenv()
    print(os.getenv("OPENAI_API_KEY"))

    if len(sys.argv) != 4:
        print("Usage: python main.py <command> <input_json_path> <output_path>")
        sys.exit(1)

    command = sys.argv[1]
    input_json_path = sys.argv[2]
    output_path = sys.argv[3]

    client = OpenAI()

    if command == "generateSummaries":
        generate_summaries(input_json_path, output_path, client)
    elif command == "generateStoryline":
        generate_storyline(input_json_path, output_path, client)
    elif command == "generateVideo":
        generate_video(input_json_path, output_path)
    elif command == "cleanUp":
        remove_temp_files()
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)

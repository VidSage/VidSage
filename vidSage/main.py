import sys

from tasks import generate_summaries, generate_storyline, generate_video, remove_temp_files
import dotenv
import os
from openai import OpenAI, AzureOpenAI
import uuid
import subprocess
import json


def get_debug_info():
    # get PATH variable
    path = os.getenv("PATH")
    # get the location of ffmpeg
    ffmpeg_path = subprocess.run(["which", "ffmpeg"], stdout=subprocess.PIPE).stdout.decode().strip()
    # get ffmpeg version
    ffmpeg_version = subprocess.run([ffmpeg_path, "-version"], stdout=subprocess.PIPE).stdout.decode().strip()

    ret = {
        "path": path,
        "ffmpeg_path": ffmpeg_path,
        "ffmpeg_version": ffmpeg_version
    }
    print(json.dumps(ret))


if __name__ == "__main__":
    # dotenv.load_dotenv()
    # # print(os.getenv("OPENAI_API_KEY"))

    # if os.getenv("OPENAI_API_KEY") is None:
    #     print("OPENAI_API_KEY environment variable not set.")
    #     sys.exit(1)

    if len(sys.argv) == 2 and sys.argv[1] == 'cleanUp':
        remove_temp_files()
        sys.exit(0)

    if len(sys.argv) == 4 and sys.argv[1] == 'generateVideo':
        input_json_path = sys.argv[2]
        output_path = sys.argv[3]
        generate_video(input_json_path, output_path)
        sys.exit(0)

    if len(sys.argv) < 5:
        print("Usage:")
        print("  python main.py cleanUp")
        print("  python main.py <command> <input_json_path> <output_path> openai <api_key>")
        print("  python main.py <command> <input_json_path> <output_path> azure <api_key> <endpoint> <deployment_name>")
        sys.exit(1)

    command = sys.argv[1]
    input_json_path = sys.argv[2]
    output_path = sys.argv[3]
    provider = sys.argv[4].lower()

    if provider not in ['openai', 'azure']:
        print("Provider must be 'openai' or 'azure'.")
        sys.exit(1)

    if provider == 'openai':
        if len(sys.argv) != 6:
            print("Usage: python main.py <command> <input_json_path> <output_path> openai <api_key>")
            sys.exit(1)
        api_key = sys.argv[5]

        # Instantiate OpenAI client for openai
        client = OpenAI(api_key=api_key)

    else:  # azure
        if len(sys.argv) != 8:
            print("Usage: python main.py <command> <input_json_path> <output_path> azure <api_key> <endpoint> <deployment_name>")
            sys.exit(1)
        api_key = sys.argv[5]
        endpoint = sys.argv[6]
        deployment_name = sys.argv[7]

        client = AzureOpenAI(api_key=api_key, azure_endpoint=endpoint, azure_deployment=deployment_name, api_version='2024-10-01-preview')

    if command == "generateSummaries":
        generate_summaries(input_json_path, output_path, client)
    elif command == "generateStoryline":
        generate_storyline(input_json_path, output_path, client)
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)

import sys
from tasks import generate_summaries, generate_storyline, generate_video


if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python vidSage.py <command> <input_json_path> <output_path>")
        sys.exit(1)

    command = sys.argv[1]
    input_json_path = sys.argv[2]
    output_path = sys.argv[3]

    if command == "generateSummaries":
        generate_summaries(input_json_path, output_path)
    elif command == "generateStoryline":
        generate_storyline(input_json_path, output_path)
    elif command == "generateVideo":
        generate_video(input_json_path, output_path)
    else:
        print(f"Unknown command: {command}")
        sys.exit(1)

import shutil
import sys
from tasks import generate_summaries, generate_storyline, generate_video, remove_temp_files
import dotenv
import os
from openai import OpenAI, AzureOpenAI
import uuid
import subprocess
import json
import argparse
import logging
import google.generativeai as genai




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
    parser = argparse.ArgumentParser(description="A tool for generating video summaries, storylines, and final videos.")
    subparsers = parser.add_subparsers(dest='command', help="Commands")

    # Command: cleanUp
    clean_parser = subparsers.add_parser('cleanUp', help='Remove temporary files generated during processing.')

    # Command: generateVideo
    video_parser = subparsers.add_parser('generateVideo', help='Generate a final video based on JSON input.')
    video_parser.add_argument('input_json_path', help='Path to the input JSON file.')
    video_parser.add_argument('output_path', help='Path to the output video file.')

    # Command: generateSummaries
    summaries_parser = subparsers.add_parser('generateSummaries', help='Generate summaries using the specified provider.')
    summaries_parser.add_argument('input_json_path', help='Path to the input JSON file.')
    summaries_parser.add_argument('output_path', help='Path to the output file.')
    summaries_parser.add_argument('provider', choices=['openai', 'azure'], help='Provider to use (openai or azure).')
    summaries_parser.add_argument('api_key', help='API key for the provider.')
    summaries_parser.add_argument('--endpoint', help='Azure endpoint (required if provider is azure).')
    summaries_parser.add_argument('--deployment_name', help='Azure deployment name (required if provider is azure).')

    # Command: generateStoryline
    storyline_parser = subparsers.add_parser('generateStoryline', help='Generate storyline using the specified provider.')
    storyline_parser.add_argument('input_json_path', help='Path to the input JSON file.')
    storyline_parser.add_argument('output_path', help='Path to the output file.')
    storyline_parser.add_argument('provider', choices=['openai', 'azure'], help='Provider to use (openai or azure).')
    storyline_parser.add_argument('api_key', help='API key for the provider.')
    storyline_parser.add_argument('--endpoint', help='Azure endpoint (required if provider is azure).')
    storyline_parser.add_argument('--deployment_name', help='Azure deployment name (required if provider is azure).')

    args = parser.parse_args()

    logger = logging.getLogger()

    logger.debug("path:" + os.environ['PATH'])

    if not shutil.which("ffmpeg"):
        sys.stderr.write("ffmpeg not found on the system.")
        sys.exit(1)

    if args.command == 'cleanUp':
        remove_temp_files()
        logger.debug("Temporary files removed.")
        sys.exit(0)

    elif args.command == 'generateVideo':
        logger.debug("Generating video...")
        try:
            generate_video(args.input_json_path, args.output_path)
        except Exception as e:
            sys.stderr.write(str(e))
            sys.exit(1)
        logger.debug("Video generated.")
        sys.exit(0)

    elif args.command in ['generateSummaries', 'generateStoryline']:
        provider = args.provider.lower()

        # Validate provider-specific arguments
        if provider == 'azure':
            if not args.endpoint or not args.deployment_name:
                parser.error("For azure, --endpoint and --deployment_name are required.")

        # Instantiate the client
        if provider == 'openai':
            client = OpenAI(api_key=args.api_key)
        else:
            client = AzureOpenAI(
                api_key=args.api_key,
                azure_endpoint=args.endpoint,
                azure_deployment=args.deployment_name,
                api_version='2024-10-01-preview'
            )

        if args.command == 'generateSummaries':
            logger.debug("Generating summaries...")
            try:
              generate_summaries(args.input_json_path, args.output_path, client)
            except Exception as e:
                sys.stderr.write(str(e))
                sys.exit(1)
            logger.debug("Summaries generated.")
        else:  # generateStoryline
            logger.debug("Generating storyline...")
            try:
              generate_storyline(args.input_json_path, args.output_path, client)
            except Exception as e:
                sys.stderr.write(str(e))
                sys.exit(1)
            logger.debug("Storyline generated.")

    else:
        parser.print_help()
        sys.exit(1)

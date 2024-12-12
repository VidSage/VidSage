#!/bin/bash

# Script to download statically linked FFmpeg binaries
# Usage: ./download_ffmpeg.sh <platform> <destination_path>

set -e  # Exit on error
set -o pipefail  # Pipeline fails if any command fails

# Check arguments
if [[ $# -ne 2 ]]; then
    echo "Usage: $0 <platform> <destination_path>"
    echo "Supported platforms: linux, mac, win"
    exit 1
fi

# Input arguments
PLATFORM=$1
DEST_PATH=$2

# Ensure the destination directory exists
mkdir -p "$DEST_PATH"

# Download FFmpeg binaries
download_ffmpeg() {
    PLATFORM=$1
    OUTPUT_DIR=$2

    case "$PLATFORM" in
        linux)
            FFMPEG_URL="https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz"
            FFMPEG_TAR="ffmpeg-release-amd64-static.tar.xz"
            ;;

        mac)
            FFMPEG_URL="https://evermeet.cx/ffmpeg/get/zip"
            FFMPEG_ZIP="ffmpeg.zip"
            ;;

        win)
            FFMPEG_URL="https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-essentials.zip"
            FFMPEG_ZIP="ffmpeg-release-essentials.zip"
            ;;

        *)
            echo "Unsupported platform: $PLATFORM"
            echo "Supported platforms: linux, mac, win"
            exit 1
            ;;
    esac

    echo "Downloading FFmpeg binary for $PLATFORM..."

    if [[ "$PLATFORM" == "linux" ]]; then
        wget -q --show-progress -O "$OUTPUT_DIR/$FFMPEG_TAR" "$FFMPEG_URL"
        tar -xf "$OUTPUT_DIR/$FFMPEG_TAR" -C "$OUTPUT_DIR"
        mv "$OUTPUT_DIR"/*/ffmpeg "$OUTPUT_DIR/ffmpeg"
        rm -rf "$OUTPUT_DIR/$FFMPEG_TAR" "$OUTPUT_DIR/"ffmpeg-*

    elif [[ "$PLATFORM" == "mac" ]]; then
        wget -q --show-progress -O "$OUTPUT_DIR/$FFMPEG_ZIP" "$FFMPEG_URL"
        unzip -q "$OUTPUT_DIR/$FFMPEG_ZIP" -d "$OUTPUT_DIR"
        mv "$OUTPUT_DIR/ffmpeg" "$OUTPUT_DIR/ffmpeg"
        rm -rf "$OUTPUT_DIR/$FFMPEG_ZIP"

    elif [[ "$PLATFORM" == "win" ]]; then
        wget -q --show-progress -O "$OUTPUT_DIR/$FFMPEG_ZIP" "$FFMPEG_URL"
        unzip -q "$OUTPUT_DIR/$FFMPEG_ZIP" -d "$OUTPUT_DIR"
        
        # Find the ffmpeg executable dynamically in the extracted folder
        FF_EXEC=$(find "$OUTPUT_DIR" -type f -name "ffmpeg.exe" | head -n 1)
        if [[ -z "$FF_EXEC" ]]; then
            echo "Error: ffmpeg.exe not found in the extracted files."
            exit 1
        fi

        # Move the executable to the destination path
        mv "$FF_EXEC" "$OUTPUT_DIR/ffmpeg.exe"
        rm -rf "$OUTPUT_DIR/$FFMPEG_ZIP" "$OUTPUT_DIR/ffmpeg-*"
    fi

    echo "FFmpeg binary downloaded and placed in $OUTPUT_DIR."
}

# Run the function
download_ffmpeg "$PLATFORM" "$DEST_PATH"

# Verify the binary
echo "Verifying FFmpeg binary..."
if [[ -f "$DEST_PATH/ffmpeg" ]]; then
    echo "FFmpeg binary successfully downloaded to $DEST_PATH."
else
    echo "Error: FFmpeg binary not found in $DEST_PATH."
    exit 1
fi

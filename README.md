# VidSage

AI powered video editing tool that helps you create engaging videos in minutes.

## Development

0. Install dependencies:
```bash
$ apt-get update
$ apt-get install -y python3 python3-pip ffmpeg
```

Or bundle static binaries:

```bash
mkdir assets/bin
bash scripts/bundle-ffmpeg.sh [linux|mac|win] assets/bin
```

1. Bundle VidSage's Python runtime:
```bash
$ cd vidSage
$ pip install -r requirements.txt
$ pip install -U pyinstaller
$ pyinstaller --onefile --noconsole vidSage/main.py
$ mv dist/main assets/bin/
```

2. Start the Electron app:
```bash
$ npm install
$ npm start
```

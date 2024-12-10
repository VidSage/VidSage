# VidSage

AI powered video editing tool that helps you create engaging videos in minutes.

## Development

0. Install dependencies:
```bash
$ apt-get update
$ apt-get install -y python3 python3-pip ffmpeg
```

1. Bundle VidSage's Python runtime:
```bash
$ cd vidSage
$ pip install -r requirements.txt
$ pip install -U pyinstaller
$ pyinstaller --onefile --noconsole main.py
$ cp dist/main ../release/app/vidSage/
```

2. Start the Electron app:
```bash
$ npm install
$ npm start
```

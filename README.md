# VidSage

AI powered video editing tool that helps you create engaging videos in minutes.

## Development

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

# Bundling Instructions

To properly bundle the python code into Electron, follow the steps below:

1. Install dependencies using `pip install -r requirements.txt`
2. Install pyinstaller using `pip install -U pyinstaller`
3. Package the python code using `pyinstaller --onefile --noconsole main.py`

Now the binary will be accessible to Electron and can be run from the Electron app.

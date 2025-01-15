/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import { app, BrowserWindow, shell, ipcMain, dialog } from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import * as fs from 'fs';
import { OpenAI, AzureOpenAI } from 'openai';
import MenuBuilder from './menu';
import { resolveHtmlPath, injectBundleExecutablePath } from './util';
import {
  generateSummaries,
  generateStoryline,
  generateVideo,
  cleanup,
  getDebugInfo,
} from './vidSage';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

function generateTimestampedUUID(): string {
  // Get the current date and time
  const now = new Date();

  // Format the timestamp as 'yyyyMMddHHmmss'
  const timestamp = format(now, 'yyyyMMddHHmmss');

  // Generate a UUID
  const uuid = uuidv4();

  // Combine the timestamp and UUID
  return `${timestamp}-${uuid}`;
}

let mainWindow: BrowserWindow | null = null;

let storedApiKey: string | null = null;

let storedAzureCredentials: {
  endpoint: string;
  deploymentName: string;
  key: string;
} | null = null;

let useAzure: boolean = false;

async function validateOpenAiKey(apiKey: string): Promise<boolean> {
  try {
    // Example: set the API key and try a minimal call
    const openai = new OpenAI({ apiKey });

    // Minimal call to check validity, e.g. list models
    await openai.models.list();
    return true;
  } catch (error: any) {
    console.error('API key validation failed:', error);
    return false;
  }
}

ipcMain.handle('validate-api-key', async (event, apiKey: string) => {
  const isValid = await validateOpenAiKey(apiKey);
  if (isValid) {
    return { valid: true };
  }
  return { valid: false, error: 'Invalid API key or failed to validate' };
});

ipcMain.handle('set-api-key', (event, apiKey: string) => {
  storedApiKey = apiKey;
  useAzure = false;
  return { success: true };
});

ipcMain.handle(
  'validate-azure-credentials',
  async (event, { endpoint, deploymentName, key }) => {
    try {
      const apiVersion = '2024-10-01-preview';
      const azure = new AzureOpenAI({
        endpoint,
        deployment: deploymentName,
        apiKey: key,
        apiVersion,
      });

      // Minimal call to check validity, e.g. list models
      await azure.models.list();
      return { valid: true };
    } catch (error: any) {
      console.error('Azure credentials validation failed:', error);
      return {
        valid: false,
        error: 'Invalid Azure credentials or failed to validate',
      };
    }
  },
);

ipcMain.handle(
  'set-azure-credentials',
  (event, { endpoint, deploymentName, key }) => {
    // Store the Azure credentials...
    storedAzureCredentials = { endpoint, deploymentName, key };
    useAzure = true;
    return { success: true };
  },
);

ipcMain.on('ipc-example', async (event, arg) => {
  const msgTemplate = (pingPong: string) => `IPC test: ${pingPong}`;
  console.log(msgTemplate(arg));
  event.reply('ipc-example', msgTemplate('pong'));
});

ipcMain.handle('gen-summary', async (event, args) => {
  try {
    const summaries = await generateSummaries(
      {
        taskId: generateTimestampedUUID(),
        files: args,
      },
      storedApiKey!,
      storedAzureCredentials,
      useAzure,
    );
    return { success: true, data: summaries };
  } catch (error: any) {
    console.error('Failed to generate summaries:', error);
    return { success: false, error: error.message || 'unknown error' };
  }
});

ipcMain.handle('gen-storyline', async (event, args) => {
  try {
    const segments = await generateStoryline(
      {
        taskId: generateTimestampedUUID(),
        summaries: args.summaries,
        prompt: args.prompt,
        duration: args.duration,
      },
      storedApiKey!,
      storedAzureCredentials,
      useAzure,
    );
    return { success: true, data: segments };
  } catch (error: any) {
    console.error('Failed to generate storyline:', error);
    return { success: false, error: error.message || 'unknown error' };
  }
});

ipcMain.handle('gen-video', async (event, args) => {
  const preview = await generateVideo(
    {
      taskId: generateTimestampedUUID(),
      segments: args.storyline,
    },
    storedApiKey!,
  );
  return preview;
});

ipcMain.handle('select-videos', async () => {
  const result = await dialog.showOpenDialog({
    title: 'Select Video Files',
    buttonLabel: 'Add Videos',
    properties: ['openFile', 'multiSelections'],
    filters: [
      { name: 'Videos', extensions: ['mp4', 'mkv', 'avi', 'mov'] }, // Filter for video files
    ],
  });

  // Return the file paths if files are selected
  if (!result.canceled) {
    return result.filePaths;
  }
  return [];
});

ipcMain.handle('save-video', async (_, originalFilePath: string) => {
  const { canceled, filePath } = await dialog.showSaveDialog(mainWindow!, {
    title: 'Save Video',
    defaultPath: 'video.mp4',
    filters: [{ name: 'Video Files', extensions: ['mp4'] }],
  });

  if (canceled || !filePath) {
    return { success: false, filePath: null };
  }

  try {
    fs.copyFileSync(originalFilePath, filePath); // Copy the video to the chosen destination
    return { success: true, filePath };
  } catch (error) {
    console.error('Failed to save video:', error);
    return { success: false, error };
  }
});

ipcMain.handle('get-debug-info', async () => {
  return getDebugInfo();
});

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload,
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728,
    icon: getAssetPath('icon.png'),
    webPreferences: {
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
      contextIsolation: true, // Keeps context isolation for security
      webSecurity: false, // Disable web security to allow local file loading
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('will-quit', () => {
  const tempDataPath: string = path.join(app.getPath('userData'), 'vidSage');
  // remove temp data directory
  fs.rmSync(tempDataPath, { recursive: true });
  cleanup();
});

app
  .whenReady()
  .then(() => {
    injectBundleExecutablePath();
    createWindow();
    app.on('activate', () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);

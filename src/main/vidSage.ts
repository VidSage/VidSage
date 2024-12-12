/* eslint-disable no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { execFile, spawnSync } from 'child_process';
import path from 'path';
import { app } from 'electron';
import * as fs from 'fs';
import type { VideoFile, VideoSummary, Segment } from './types';
import { readJSONFile, writeJSONFile } from './util';
import webpackPaths from '../../.erb/configs/webpack.paths';

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

const vidSage = isDebug
  ? path.join(webpackPaths.appPath, 'vidSage')
  : path.join(__dirname, '../../vidSage');

const mainPath = process.platform === 'win32' ? 'main.exe' : 'main';

const vidSageBinary = path.join(vidSage, mainPath);

const userDataPath: string = app.getPath('userData');
const tempDataPath: string = path.join(userDataPath, 'vidSage');

const ensureDirectoryExists = (dir: string): void => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

ensureDirectoryExists(tempDataPath);

/**
 * generate video summaries given a list of video files and a task ID
 * @param args - taskId: string, files: VideoFile[]
 * @returns a list of VideoSummary objects
 */
async function generateSummaries(
  args: {
    taskId: string;
    files: VideoFile[];
  },
  storedApiKey: string,
): Promise<VideoSummary[]> {
  ensureDirectoryExists(path.join(tempDataPath, args.taskId));
  const inputJSONAbsPath = path.join(tempDataPath, args.taskId, 'input.json');
  const outputJSONAbsPath = path.join(tempDataPath, args.taskId, 'output.json');
  await writeJSONFile(inputJSONAbsPath, args);

  await new Promise<void>((resolve, reject) => {
    execFile(
      vidSageBinary,
      ['generateSummaries', inputJSONAbsPath, outputJSONAbsPath, storedApiKey],
      (error, stdout, stderr) => {
        if (error) {
          return reject(error);
        }
        return resolve();
      },
    );
  });

  // const result = spawnSync(
  //   'C:\\Users\\wch93\\anaconda3\\envs\\llm\\python.exe',
  //   [
  //     'vidSage/main.py',
  //     'generateSummaries',
  //     inputJSONAbsPath,
  //     outputJSONAbsPath,
  //   ],
  //   { encoding: 'utf-8' },
  // );
  // console.log(result.stdout);
  // console.log(result.stderr);
  const data = await readJSONFile(outputJSONAbsPath);
  return data as VideoSummary[];
}

/**
 * generate a storyline based on provided video summaries and a user prompt
 * @param args - taskId: string, summaries: VideoSummary[], prompt: string, duration: number
 * @returns a list of Segment objects
 */
async function generateStoryline(
  args: {
    taskId: string;
    summaries: VideoSummary[];
    prompt: string;
    duration: number;
  },
  storedApiKey: string,
): Promise<Segment[]> {
  ensureDirectoryExists(path.join(tempDataPath, args.taskId));
  const inputJSONAbsPath = path.join(tempDataPath, args.taskId, 'input.json');
  const outputJSONAbsPath = path.join(tempDataPath, args.taskId, 'output.json');
  await writeJSONFile(inputJSONAbsPath, args);

  await new Promise<void>((resolve, reject) => {
    execFile(
      vidSageBinary,
      ['generateStoryline', inputJSONAbsPath, outputJSONAbsPath, storedApiKey],
      (error, stdout, stderr) => {
        if (error) {
          return reject(error);
        }
        return resolve();
      },
    );
  });

  // const result = spawnSync(
  //   'C:\\Users\\wch93\\anaconda3\\envs\\llm\\python.exe',
  //   [
  //     'vidSage/main.py',
  //     'generateStoryline',
  //     inputJSONAbsPath,
  //     outputJSONAbsPath,
  //   ],
  //   { encoding: 'utf-8' },
  // );
  // console.log(result.stdout);
  // console.log(result.stderr);
  const data = await readJSONFile(outputJSONAbsPath);
  return data as Segment[];
}

/**
 * generate a final video using a list of segments
 * @param args - taskId: string, segments: Segment[]
 * @returns the absolute file path to the generated video
 */
async function generateVideo(
  args: {
    taskId: string;
    segments: Segment[];
  },
  storedApiKey: string,
): Promise<string> {
  ensureDirectoryExists(path.join(tempDataPath, args.taskId));
  const inputJSONAbsPath = path.join(tempDataPath, args.taskId, 'input.json');
  const outputVideoAbsPath = path.join(tempDataPath, args.taskId, 'output.mp4');
  await writeJSONFile(inputJSONAbsPath, args);

  await new Promise<void>((resolve, reject) => {
    execFile(
      vidSageBinary,
      ['generateVideo', inputJSONAbsPath, outputVideoAbsPath, storedApiKey],
      (error, stdout, stderr) => {
        if (error) {
          return reject(error);
        }
        return resolve();
      },
    );
  });

  // const result = spawnSync(
  //   'C:\\Users\\wch93\\anaconda3\\envs\\llm\\python.exe',
  //   ['vidSage/main.py', 'generateVideo', inputJSONAbsPath, outputVideoAbsPath],
  //   { encoding: 'utf-8' },
  // );
  // console.log(result.stdout);
  // console.log(result.stderr);
  return outputVideoAbsPath;
}

/**
 * cleanup temporary resources
 */
async function cleanup(): Promise<void> {
  await new Promise<void>((resolve, reject) => {
    execFile(vidSageBinary, ['cleanUp'], (error, stdout, stderr) => {
      if (error) {
        return reject(error);
      }
      return resolve();
    });
  });
}

export { generateSummaries, generateStoryline, generateVideo, cleanup };

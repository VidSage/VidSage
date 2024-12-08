/* eslint-disable no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { execFileSync } from 'child_process';
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

// temp data directory
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
 * saves args object in inputJSONAbsPath file and invokes the Python script
 * reads the result from outputJSONAbsPath file and returns it
 * @param args - taskId: string, files: VideoFile[]
 * @returns a list of VideoSummary objects
 */
async function generateSummaries(args: {
  taskId: string;
  files: VideoFile[];
}): Promise<VideoSummary[]> {
  ensureDirectoryExists(path.join(tempDataPath, args.taskId));
  const inputJSONAbsPath = path.join(tempDataPath, args.taskId, 'input.json');
  const outputJSONAbsPath = path.join(tempDataPath, args.taskId, 'output.json');
  await writeJSONFile(inputJSONAbsPath, args);
  const result = execFileSync(vidSageBinary, [
    'generateSummaries',
    inputJSONAbsPath,
    outputJSONAbsPath,
  ]);
  const data = await readJSONFile(outputJSONAbsPath);
  return data as VideoSummary[];
}

/**
 * generate a storyline based on provided video summaries and a user prompt
 * saves args object in inputJSONAbsPath file and invokes the Python script
 * reads the result from outputJSONAbsPath file and returns it
 * @param args - taskId: string, summaries: VideoSummary[], prompt: string, duration: number
 * @returns a list of Segment objects representing the storyline
 */
async function generateStoryline(args: {
  taskId: string;
  summaries: VideoSummary[];
  prompt: string;
  duration: number;
}): Promise<Segment[]> {
  ensureDirectoryExists(path.join(tempDataPath, args.taskId));
  const inputJSONAbsPath = path.join(tempDataPath, args.taskId, 'input.json');
  const outputJSONAbsPath = path.join(tempDataPath, args.taskId, 'output.json');
  await writeJSONFile(inputJSONAbsPath, args);
  const result = execFileSync(vidSageBinary, [
    'generateStoryline',
    inputJSONAbsPath,
    outputJSONAbsPath,
  ]);
  const data = await readJSONFile(outputJSONAbsPath);
  return data as Segment[];
}

/**
 * generate a final video using a list of segments
 * saves args object in inputJSONAbsPath file and invokes the Python script
 * returns the absolute path to the generated video file
 * Note: the python script should generate the video file in the designated output path
 * and should not produce a JSON file
 * @param args - taskId: string, segments: Segment[]
 * @returns the absolute file path to the generated video
 */
async function generateVideo(args: {
  taskId: string;
  segments: Segment[];
}): Promise<string> {
  ensureDirectoryExists(path.join(tempDataPath, args.taskId));
  const inputJSONAbsPath = path.join(tempDataPath, args.taskId, 'input.json');
  const outputVideoAbsPath = path.join(tempDataPath, args.taskId, 'output.mp4');
  await writeJSONFile(inputJSONAbsPath, args);
  const result = execFileSync(vidSageBinary, [
    'generateVideo',
    inputJSONAbsPath,
    outputVideoAbsPath,
  ]);
  return outputVideoAbsPath;
}

export { generateSummaries, generateStoryline, generateVideo };

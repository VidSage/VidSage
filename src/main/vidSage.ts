/* eslint-disable no-empty-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import type { VideoFile, VideoSummary, Segment } from './types';
import { readJSONFile, writeJSONFile } from './util';

async function generateSummaries(args: {
  files: VideoFile[];
}): Promise<VideoSummary[]> {
  // const inputJSONAbsPath = 'TODO';
  // const outputJSONAbsPath = 'TODO';
  // await writeJSONFile(inputJSONAbsPath, args);
  // TODO: invoke the Python script to generate summaries synchronously
  // const result = await readJSONFile(outputJSONAbsPath);
  // return result as VideoSummary[];

  // temp mock data
  return [
    {
      file: {
        absolutePath: '/path/to/clip1.mp4',
        name: 'Clip1',
      },
      summary: 'Summary of clip1',
      astheticRating: 4,
      segments: [
        {
          startTimeSec: 0,
          endTimeSec: 20,
          description: '展示户外秋天的场景',
          srcFile: null,
        },
        {
          startTimeSec: 20,
          endTimeSec: 90,
          description: '5个人在打篮球',
          srcFile: null,
        },
        {
          startTimeSec: 90,
          endTimeSec: 130,
          description: '展示有绿色植物的校园环境',
          srcFile: null,
        },
        {
          startTimeSec: 130,
          endTimeSec: 170,
          description: '展示蓝色天空和大面积湖水',
          srcFile: null,
        },
        {
          startTimeSec: 170,
          endTimeSec: 200,
          description: '展示校园和大量行人',
          srcFile: null,
        },
      ],
    },
    {
      file: {
        absolutePath: '/path/to/clip2.mp4',
        name: 'Clip2',
      },
      summary: 'Summary of clip2',
      astheticRating: 3,
      segments: [
        {
          startTimeSec: 0,
          endTimeSec: 30,
          description: 'Scene with morning light',
          srcFile: null,
        },
        {
          startTimeSec: 30,
          endTimeSec: 60,
          description: 'Overview of the campus library',
          srcFile: null,
        },
        {
          startTimeSec: 60,
          endTimeSec: 90,
          description: 'Students walking through corridors',
          srcFile: null,
        },
      ],
    },
    {
      file: {
        absolutePath: '/path/to/clip3.mp4',
        name: 'Clip3',
      },
      summary: 'Summary of clip3',
      astheticRating: 5,
      segments: [
        {
          startTimeSec: 0,
          endTimeSec: 60,
          description: 'A panoramic view of the city',
          srcFile: null,
        },
      ],
    },
    {
      file: {
        absolutePath: '/path/to/clip4.mp4',
        name: 'Clip4',
      },
      summary: 'Summary of clip4',
      astheticRating: 4,
      segments: [
        {
          startTimeSec: 0,
          endTimeSec: 30,
          description: 'Intro scene with music',
          srcFile: null,
        },
        {
          startTimeSec: 30,
          endTimeSec: 60,
          description: 'Main content',
          srcFile: null,
        },
      ],
    },
    {
      file: {
        absolutePath: '/path/to/clip5.mp4',
        name: 'Clip5',
      },
      summary: 'Summary of clip5',
      astheticRating: 2,
      segments: [
        {
          startTimeSec: 0,
          endTimeSec: 50,
          description: 'Experimental footage',
          srcFile: null,
        },
      ],
    },
  ];
}

async function generateStoryline(args: {
  summaries: VideoSummary[];
  prompt: string;
  duration: number;
}): Promise<Segment[]> {
  // const inputJSONAbsPath = 'TODO';
  // const outputJSONAbsPath = 'TODO';
  // await writeJSONFile(inputJSONAbsPath, args);
  // TODO: invoke the Python script to generate summaries synchronously
  // const result = await readJSONFile(outputJSONAbsPath);
  // return result as Segment[];

  // temp mock data
  return [
    {
      startTimeSec: 0,
      endTimeSec: 20,
      description: '展示户外秋天的场景',
      srcFile: { absolutePath: '/path/to/clip1.mp4', name: 'Clip 1' },
    },
    {
      startTimeSec: 20,
      endTimeSec: 90,
      description: '5个人在打篮球',
      srcFile: { absolutePath: '/path/to/clip2.mp4', name: 'Clip 2' },
    },
    {
      startTimeSec: 90,
      endTimeSec: 130,
      description: '展示有绿色植物的校园环境',
      srcFile: { absolutePath: '/path/to/clip1.mp4', name: 'Clip 1' },
    },
    {
      startTimeSec: 130,
      endTimeSec: 170,
      description: '展示蓝色天空和大面积湖水',
      srcFile: { absolutePath: '/path/to/clip3.mp4', name: 'Clip 3' },
    },
    {
      startTimeSec: 170,
      endTimeSec: 200,
      description: '展示校园和大量行人',
      srcFile: { absolutePath: '/path/to/clip2.mp4', name: 'Clip 2' },
    },
  ];
}

async function generateVideo(args: { segments: Segment[] }): Promise<string> {
  const inputJSONAbsPath = 'TODO';
  const outputVideoAbsPath = '/Users/bob/Downloads/output.mp4';
  await writeJSONFile(inputJSONAbsPath, args);
  // TODO: invoke the Python script to generate summaries synchronously
  return outputVideoAbsPath;
}

export { generateSummaries, generateStoryline, generateVideo };

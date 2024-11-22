type VideoFile = {
  absolutePath: string;
  name: string;
};

type Segment = {
  startTimeSec: number;
  endTimeSec: number;
  description: string;
  srcFile: VideoFile | null; // null if in VideoSummary
};

type VideoSummary = {
  file: VideoFile;
  summary: string;
  astheticRating: number | null;
  segments: Segment[];
};

export { VideoFile, Segment, VideoSummary };

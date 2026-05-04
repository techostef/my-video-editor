export interface Segment {
  id: number;
  start: number;
  end: number;
  text: string;
}

export interface UploadResponse {
  filePath: string;
  segments: Segment[];
  srt: string;
}

export type RootStackParamList = {
  Home: undefined;
  Upload: undefined;
  Trim: {
    videoUri: string;
    duration: number; // seconds
  };
  SubtitleEditor: {
    filePath: string;
    segments: Segment[];
    srt: string;
    videoUri: string;
  };
  Export: {
    filePath: string;
    srt: string;
  };
};

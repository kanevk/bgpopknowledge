
export type TranscriptLine = {
  text: string;
  duration: number;
  offset: number;
  translatedText: string;
};

export type PlayerState =
  | {
      playing: true;
      fromTime: number;
      target: any;
    }
  | {
      playing: false;
      fromTime?: null;
      target?: null;
    };

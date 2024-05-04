import { useCallback, useEffect, useState } from "react";
import { PlayerState, TranscriptLine } from "./[id]";

type CurrentLines = {
  prevLine?: string;
  currLine: string;
  nextLine?: string;
};

export const FindCurrentTranscript = ({
  transcript,
  player,
  children,
}: {
  transcript: TranscriptLine[];
  player: PlayerState;
  children: ({
    currentLines,
  }: {
    currentLines: CurrentLines;
  }) => React.ReactNode;
}) => {
  const [intervalId, setIntervalId] = useState<NodeJS.Timer | null>(null);
  const [currentLines, setCurrentLines] = useState<CurrentLines | null>();
  const findCurrentTranscript = useCallback(
    (currentTime: number) => {
      if (!player.playing) return null;

      const currIndex = transcript.findIndex((transcriptChunk) => {
        return (
          transcriptChunk.offset <= currentTime &&
          currentTime <= transcriptChunk.offset + transcriptChunk.duration
        );
      });

      return {
        prevLine: transcript[currIndex - 1],
        currentLine: transcript[currIndex],
        nextLine: transcript[currIndex + 1],
      };
    },
    [player.playing, transcript],
  );

  // TODO: Show the current line of the transcript
  useEffect(() => {
    intervalId && clearInterval(intervalId);

    if (player.playing) {
      setIntervalId(
        setInterval(() => {
          const time = player.target.getCurrentTime();
          const line = findCurrentTranscript(time);
          console.log("tick", line?.currentLine, time);
          setCurrentLines(
            line
              ? {
                  prevLine: line.prevLine?.translatedText,
                  currLine: line.currentLine?.translatedText,
                  nextLine: line.nextLine?.translatedText,
                }
              : null,
          );
        }, 100),
      );
    }

    return () => {
      intervalId && clearInterval(intervalId);
    };
    // eslint-disable-next-line
  }, [player.playing, findCurrentTranscript]);

  if (!currentLines) {
    return null;
  }

  return <>{children({ currentLines })}</>;
};

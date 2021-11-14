import { useRouter } from "next/router";

import { Typography, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import YouTube from "react-youtube";
import ReactGA from "react-ga";
import { NextPage } from "next";

import styles from "../../styles/Video.module.css";

type Props = {};

const VideoDetails: NextPage<Props> = () => {
  const router = useRouter();
  const { id } = router.query;

  const [transcript, setTranscript] = useState<Array<{
    text: string;
    duration: number;
    offset: number;
    translatedText: string;
  }> | null>(null);
  const [displayedSubtitle, setDisplayedSubtitle] = useState("");

  const handlePlayerStateChange = (event: { target: any; data: number }) => {
    if (!transcript) return null;

    if (event.data === YouTube.PlayerState.PLAYING) {
      const currentTime = event.target.getCurrentTime();
      setTimeout(() => {
        const transcripts = transcript.filter(
          (transcriptChunk) => transcriptChunk.offset > currentTime * 1000,
        );

        var i = 0;
        setInterval(() => {
          const currentTime = event.target.getCurrentTime();
          if (currentTime * 1000 >= transcripts[i].offset) {
            console.log(transcripts[i].translatedText);
            setDisplayedSubtitle(transcripts[i].translatedText);
            i += 1;
          }
        }, 10);
      }, 0);
    } else if (event.data === YouTube.PlayerState.PAUSED) {
    }
  };

  useEffect(() => {
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, []);

  useEffect(() => {
    (async () => {
      if (!id) return;

      const resp = await fetch(`/api/video-transcripts/${id}`);
      const { transcript } = await resp.json();
      setTranscript(transcript);
      console.log(transcript);
    })();
  }, [id]);

  if (!transcript)
    return (
      <main className={styles.main}>
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress />
        </div>
      </main>
    );

  return (
    <main className={styles.main}>
      <div style={{ height: "100%" }}>
        <YouTube
          opts={{ width: "100%", height: "100%", playerVars: { autoplay: 1 } }}
          containerClassName={styles["video-embedded-video-container"]}
          onStateChange={handlePlayerStateChange}
          videoId={id}
        />
        <div style={{ textAlign: "center" }}>
          <Typography variant="h3">{displayedSubtitle}</Typography>
        </div>
      </div>
    </main>
  );
};

export default VideoDetails;

import { useRouter } from "next/router";

import { Typography, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import YouTube from "react-youtube";
import ReactGA from "react-ga";
import { NextPage } from "next";
import Head from "next/head";

import styles from "../../styles/Video.module.css";

type Props = {};

const VideoHead = ({ videoData }: { videoData: VideoData | null }) => {
  const tags = videoData && (
    <>
      <meta property="og:title" content={videoData.title} />
      <meta property="og:image" content={videoData.thumbnails.high.url} />
      <meta property="og:image:width" content="400" />
      <meta property="og:image:height" content="400" />
    </>
  )
  return (
      <Head>
        <title>Учи.се.бе</title>
        <link rel="icon" href="/favicon.jpeg" />
        {tags}
      </Head>
  )
}

type VideoData = {
    title: string;
    thumbnails: {
      default: { url: string };
      medium: { url: string };
      high: { url: string };
    };
};

const VideoDetails: NextPage<Props> = () => {
  const router = useRouter();
  const id = router.query.id as string | undefined;

  const [videoData, setVideoData] = useState<VideoData | null>(null);

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

      const resp = await fetch(`/api/videos/${id}/transcript`);
      const { transcript } = await resp.json();
      setTranscript(transcript);
      console.log(transcript);
    })();
  }, [id]);

  useEffect(() => {
    (async () => {
      if (!id) return;

      const resp = await fetch(`/api/videos/${id}`);
      const videoData = await resp.json();

      setVideoData(videoData);
    })();
  }, [id]);

  if (!transcript)
    return (
    <div className={styles.container}>
      <VideoHead videoData={videoData} />

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
      </div>
    );

  return (
    <div className={styles.container}>
      <VideoHead videoData={videoData} />

      <main className={styles.main}>
        <div style={{ height: "100%" }}>
          <YouTube
            opts={{
              width: "100%",
              height: "100%",
              playerVars: { autoplay: 1 },
            }}
            containerClassName={styles["video-embedded-video-container"]}
            onStateChange={handlePlayerStateChange}
            videoId={id}
          />
          <div style={{ textAlign: "center" }}>
            <Typography variant="h3">{displayedSubtitle}</Typography>
          </div>
        </div>
      </main>
    </div>
  );
};

export default VideoDetails;

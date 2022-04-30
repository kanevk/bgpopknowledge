import { useRouter } from "next/router";

import {
  Typography,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { ReactNode, useEffect, useState } from "react";
import YouTube from "react-youtube";
import ReactGA from "react-ga";
import { GetServerSideProps, NextPage } from "next";

import styles from "../../styles/Video.module.css";
import Layout from "../../components/layout";
import axios from "axios";

type Props = {
  videoData: VideoData;
};

type VideoData = {
  title: string;
  thumbnails: {
    default: { url: string };
    medium: { url: string };
    high: { url: string };
  };
};
let loadSubtitlesIntervalId: NodeJS.Timer;

const VideoDetails: NextPage<Props> = ({ videoData }) => {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const id = router.query.id as string | undefined;

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
      console.log("Playing.");
      const transcripts = transcript.filter(
        (transcriptChunk) => transcriptChunk.offset > currentTime * 1000,
      );

      var i = 0;
      loadSubtitlesIntervalId = setInterval(() => {
        const currentTime = event.target.getCurrentTime();
        if (!transcripts[i]) return console.log("No transcript.");

        setDisplayedSubtitle(transcripts[i].translatedText);

        if (
          currentTime * 1000 >=
          transcripts[i].offset + transcripts[i].duration
        ) {
          console.log(
            currentTime * 1000,
            transcripts[i].offset + transcripts[i].duration,
          );

          i += 1;
          console.log(transcripts[i].text, transcripts[i].translatedText);
        }
      }, 50);
    } else if (event.data === YouTube.PlayerState.PAUSED) {
      console.log("Paused.");
      clearInterval(loadSubtitlesIntervalId);
    } else if (event.data === YouTube.PlayerState.ENDED) {
      console.log("Ended.");
      clearInterval(loadSubtitlesIntervalId);
    }
  };

  useEffect(() => {
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, []);

  useEffect(() => {
    (async () => {
      if (!id) return;

      const resp = await fetch(`/api/video-transcript/${id}`);
      const { transcript } = await resp.json();
      setTranscript(transcript);
      console.log(transcript);
    })();
  }, [id]);

  if (!transcript) {
    return (
      <VideoDetailsLayout
        pageTitle={videoData.title}
        previewImageUrl={videoData.thumbnails.default.url}
      >
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
      </VideoDetailsLayout>
    );
  }

  return (
    <VideoDetailsLayout
      pageTitle={videoData.title}
      previewImageUrl={videoData.thumbnails.default.url}
    >
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
          {isMobile ? (
            <Typography variant="h5">{displayedSubtitle}</Typography>
          ) : (
            <Typography variant="h3">{displayedSubtitle}</Typography>
          )}
        </div>
      </div>
    </VideoDetailsLayout>
  );
};

const VideoDetailsLayout = ({
  previewImageUrl,
  pageTitle,
  children,
}: {
  previewImageUrl?: string;
  pageTitle: string | undefined;
  children: ReactNode;
}) => {
  return (
    <Layout
      pageTitle={pageTitle}
      description="Зеления Vbox"
      previewImageUrl={previewImageUrl}
    >
      <div className={styles.container}>
        <main className={styles.main}>{children}</main>
      </div>
    </Layout>
  );
};

export const getServerSideProps: GetServerSideProps<
  { videoData: VideoData },
  { id: string }
> = async ({ params }) => {
  if (!params?.id)
    throw Error(`Missing videoId in params ${JSON.stringify(params)}`);

  const resp = await axios.get(
    `https://www.googleapis.com/youtube/v3/videos?id=${params.id}&key=AIzaSyDLlmnYxncM9E5pCday8wlFY72bfu7u_Bw&part=snippet&fields=items(id,snippet(title,thumbnails))&i18nLanguage=bg`,
  );

  if (resp.status !== 200)
    throw Error(`Couldn't fetch data for video ${params.id}`);

  const { items } = await resp.data;
  console.log(items);

  const videoData: VideoData = items[0].snippet;

  return {
    props: {
      videoData,
    },
  };
};

export default VideoDetails;

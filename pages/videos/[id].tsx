import { useRouter } from "next/router";

import {
  Typography,
  CircularProgress,
  useTheme,
  Stack,
  Link,
  Box,
} from "@mui/material";
import { ReactNode, useEffect, useState } from "react";
import YouTube from "react-youtube";
import ReactGA from "react-ga";
import { GetServerSideProps, NextPage } from "next";

import styles from "../../styles/Video.module.css";
import Layout from "../../components/layout";
import getVideoData, { VideoData } from "../../lib/getVideoData";
import dynamic from "next/dynamic";
import { PlayerState, TranscriptLine } from "../../components/types";
import SubtitleRevealer from "../../components/subtitleRevealer";

const FindCurrentTranscript = dynamic(
  () => import("../../components/FindCurrentTranscript"),
  {
    ssr: false,
  },
);

type Props = {
  videoData: VideoData;
};

let loadSubtitlesIntervalId: NodeJS.Timer;

const VideoDetails: NextPage<Props> = ({ videoData }) => {
  const router = useRouter();
  const theme = useTheme();

  const id = router.query.id as string | undefined;

  console.log("videoData", videoData);

  const [transcript, setTranscript] = useState<Array<TranscriptLine> | null>(
    null,
  );
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const [currentPlayer, setCurrentPlayer] = useState<PlayerState>({
    playing: false,
  });
  const handlePlayerStateChange = (event: { target: any; data: number }) => {
    if (!transcript) return null;

    if (event.data === YouTube.PlayerState.PLAYING) {
      setCurrentPlayer({
        playing: true,
        fromTime: event.target.getCurrentTime(),
        target: event.target,
      });
    } else if (event.data === YouTube.PlayerState.PAUSED) {
      console.log("Paused.");
      setCurrentPlayer({
        playing: false,
      });
    } else if (event.data === YouTube.PlayerState.ENDED) {
      setCurrentPlayer({
        playing: false,
      });
      console.log("Ended.");
    }
  };

  useEffect(() => {
    ReactGA.pageview(window.location.pathname + window.location.search);
  }, []);

  useEffect(() => {
    (async () => {
      if (!id) return;

      const resp = await fetch(`/api/video-transcript/${id}?sourceLang=en`);

      const { transcript, error } = await resp.json();
      if (error) {
        console.error("useEffect video-transcript", error);
        setLoadingError(error);
        return;
      }

      setTranscript(transcript);
      console.log(transcript);
    })();
  }, [id]);

  if (loadingError) {
    return (
      <VideoDetailsLayout
        pageTitle={videoData.title}
        previewImageUrl={
          videoData.thumbnails?.maxres?.url ||
          videoData.thumbnails?.standard?.url ||
          videoData.thumbnails?.high?.url ||
          videoData.thumbnails?.medium?.url
        }
      >
        <Stack
          width="100%"
          height="300px"
          alignItems="center"
          justifyContent="center"
        >
          <Typography variant="h6">Видеото не е преведено</Typography>
          <Typography variant="subtitle1">
            Опитайте с друго видео <Link href="/">тук</Link>
          </Typography>
        </Stack>
      </VideoDetailsLayout>
    );
  }

  if (!transcript) {
    return (
      <VideoDetailsLayout
        pageTitle={videoData.title}
        previewImageUrl={
          videoData.thumbnails?.maxres?.url ||
          videoData.thumbnails?.standard?.url ||
          videoData.thumbnails?.high?.url ||
          videoData.thumbnails?.medium?.url
        }
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
      previewImageUrl={
        videoData.thumbnails?.maxres?.url ||
        videoData.thumbnails?.standard?.url ||
        videoData.thumbnails?.high?.url ||
        videoData.thumbnails?.medium?.url
      }
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
        <Box
          sx={{
            backgroundColor: theme.palette.common.black,
          }}
          width={"100%"}
          height={"100%"}
        >
          {currentPlayer && (
            <FindCurrentTranscript
              transcript={transcript}
              player={currentPlayer}
            >
              {({ currentLines }) => (
                <div style={{ textAlign: "center" }}>
                  <SubtitleRevealer text={currentLines.currLine} />
                </div>
              )}
            </FindCurrentTranscript>
          )}
        </Box>
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
      description="Преведено YouTubе видео"
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

  const videoData = await getVideoData({ videoId: params.id });

  return {
    props: {
      videoData,
    },
  };
};

export default VideoDetails;

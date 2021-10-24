import { Spin, Typography } from "antd";
import { useEffect, useState } from "react";
import { useParams, useRoutes } from "react-router";
import YouTube from "react-youtube";
import "antd/dist/antd.css";
import "./App.css";

const API_BASE = process.env.REACT_APP_API_BASE;

if (!API_BASE) throw Error("Provide value for API_BASE");

const App = () => {
  return useRoutes([
    {
      path: "/video/:id",
      element: <VideoDetails />,
    },
    {
      path: "*",
      element: <div>404</div>,
    },
  ]);
};

const VideoDetails = () => {
  const { id } = useParams();
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
    (async () => {
      const resp = await fetch(`${API_BASE}/yt/transcript/v/${id}`);
      const { transcript } = await resp.json();
      setTranscript(transcript);
      console.log(transcript);
    })();
  }, [id]);

  if (!id) throw Error("Missing video ID");
  if (!transcript)
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin size="large" tip="Зарежда се..." />
      </div>
    );

  return (
    <div style={{ height: "100%" }}>
      <YouTube
        opts={{ width: "100%", height: "100%", playerVars: { autoplay: 1 } }}
        containerClassName="video-embedded-video-container"
        onStateChange={handlePlayerStateChange}
        videoId={id}
      />
      <div style={{ textAlign: "center" }}>
        <Typography.Title level={2}>{displayedSubtitle}</Typography.Title>
      </div>
    </div>
  );
};

export default App;

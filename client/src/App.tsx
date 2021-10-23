import { useEffect, useState } from "react";
import { useParams, useRoutes } from "react-router";
import YouTube from "react-youtube";
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
}

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
  if (!transcript) return <div>Loading...</div>;

  return (
    <div>
      <YouTube
        opts={{ width: "100%", height: "500px", playerVars: { autoplay: 0 } }}
        onStateChange={handlePlayerStateChange}
        videoId={id}
      />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <h1 style={{ alignContent: "center" }}>{displayedSubtitle}</h1>
      </div>
    </div>
  );
};

export default App;

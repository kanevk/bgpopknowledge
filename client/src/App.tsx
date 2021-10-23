import { useEffect, useState } from "react";
import { useParams, useRoutes } from "react-router";
import YouTube from "react-youtube";
import YoutubeTranscript from "youtube-transcript";
import "./App.css";

function App() {
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

  // return (
  // <YouTube
  // videoId={string} // defaults -> null
  // id={string} // defaults -> null
  // className={string} // defaults -> null
  // containerClassName={string} // defaults -> ''
  // opts={obj} // defaults -> {}
  // onReady={func} // defaults -> noop
  // onPlay={func} // defaults -> noop
  // onPause={func} // defaults -> noop
  // onEnd={func} // defaults -> noop
  // onError={func} // defaults -> noop
  // onStateChange={func} // defaults -> noop
  // onPlaybackRateChange={func} // defaults -> noop
  // onPlaybackQualityChange={func} // defaults -> noop
  // />
  // );
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

    console.log(event.target, event.data);

    if (event.data === YouTube.PlayerState.PLAYING) {
      const currentTime = event.target.getCurrentTime();
      setTimeout(() => {
        // console.log(currentTime);
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

  // useEffect(() => {
  //   (async () => {
  //     const resp = await fetch(`http://localhost:4300/yt/transcript/v/${id}`);
  //     const { transcript } = await resp.json();
  //     setTranscript(
  //       transcript
  //     );
  //     console.log(transcript);
  //   })();
  // }, [id]);

  if (!id) throw Error("Missing video ID");
  if (!transcript) return <div>Loading...</div>;

  return (
    <div>
      <YouTube
        opts={{ width: '100%', height: '600px', playerVars: { autoplay: 1 } }}
        onStateChange={handlePlayerStateChange}
        videoId={id}
      />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <h1 style={{ alignContent: "center" }}>{displayedSubtitle}</h1>
      </div>
    </div>
  );

  // <div>
  //   <YouTube onStateChange={handlePlayerStateChange} videoId={id} />
  //   <div></div>
  // </div>
  // </div>;
};

export default App;

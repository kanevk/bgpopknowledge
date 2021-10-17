import { useEffect } from "react";
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
  // const [transcript, setTranscript] = useState("");

  if (!id) throw Error("Missing video ID");

  useEffect(() => {
    (async () => {
      // const fetch(`https://www.googleapis.com/youtube/v3/captions/${id}`)
      const tr = await YoutubeTranscript.fetchTranscript(id, { lang: 'bg', country: 'buglaria' });
      console.log(tr);
    })();
  }, [id]);

  return <YouTube videoId={id} />;
};

export default App;

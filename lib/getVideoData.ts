import axios from "axios";

type Thumbnail = {
url: string; width: number; height: number
}

export type VideoData = {
  title: string;
  thumbnails: Record<'default' | 'medium' | 'high' | 'standard' | 'maxres', Thumbnail>;
};

const getVideoData = async ({ videoId }: { videoId: string }) => {
  const resp = await axios.get(
    `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=AIzaSyDLlmnYxncM9E5pCday8wlFY72bfu7u_Bw&part=snippet&fields=items(id,snippet(title,thumbnails))&i18nLanguage=bg`,
  );

  if (resp.status !== 200)
    throw Error(`Couldn't fetch data for video ${videoId}`);

  const { items } = await resp.data;
  console.log(items);

  return items[0].snippet as VideoData
};

export default getVideoData;

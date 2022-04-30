// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import _ from "lodash";

import { cacheSet, cacheGet } from "../../../../lib/hasuraCache";

type ResponseData = {
  title: string;
  thumbnails: {
    default: { url: string };
    medium: { url: string };
    high: { url: string };
  };
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  const videoId = req.query.id as string;
  const cachedValue = await cacheGet(`video-data:${videoId}`);
  if (cachedValue) {
    // @ts-ignore
    res.json(cachedValue);
    return;
  }

  const resp = await axios.get(`https://www.googleapis.com/youtube/v3/videos?id=${videoId}&key=AIzaSyDLlmnYxncM9E5pCday8wlFY72bfu7u_Bw&part=snippet&fields=items(id,snippet(title,thumbnails))&i18nLanguage=bg`);
  const { items } = resp.data;

  res.json(
    await cacheSet<ResponseData>(`video-data:${videoId}`, items[0].snippet),
  );
}

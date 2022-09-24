// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

import { cacheSet, cacheGet } from "../../lib/hasuraCache";

type ResponseData = {
  html: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  const url = req.query.url as string;
  const invalidate = req.query.invalidate as string;
  const cachedValue = await cacheGet(`scraped:${url}`);

  if (cachedValue && !invalidate) {
    res.json(cachedValue as ResponseData);
    return;
  }

  const response = await axios.get(
    `http://api.scraperapi.com?api_key=04a20690a2b1bc68ccc84767344b5a4e&url=${url}`,
  );

  if (response.status !== 200) {
    console.log("Error", JSON.stringify(response.data));
  }

  const htmlContent = response.data;
  if (!htmlContent) {
    console.error("Empty content at", url);
    return;
  }
  console.log("html", htmlContent);

  res.json(
    await cacheSet<ResponseData>(`scraped:${url}`, {
      html: htmlContent,
    }),
  );
}

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

import { cacheSet, cacheGet } from "../../../lib/hasuraCache";
import { DEEPL_API_KEY } from "../../../lib/config";
import { URLSearchParams } from "url";

type ResponseData = {
  translatedContent: string
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  const key = req.query.key as string;
  const cachedValue = await cacheGet(`translation:${key}`);
  if (cachedValue) {
    res.json(cachedValue as ResponseData);
    return;
  }

  const content = req.body.content as string;
  console.log(key, content)

  const formData = new URLSearchParams(
    content.split("\n").map((ch) => ['text', ch] as [string, string]),
  );
  const translateResp = await axios.post(
    `https://api.deepl.com/v2/translate`,
    formData,
    {
      params: {
        target_lang: "BG",
      },
      headers: {
        Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );

  if (translateResp.status !== 200) {
    console.log("Error", JSON.stringify(translateResp.data));
  }

  console.log(
    `[Translate Response] translations: ${translateResp.data.translations.length}`,
  );

  const translatedChunks = (
    translateResp.data.translations as { text: string }[]
  ).map((translation) => translation.text);

  const translatedContent = translatedChunks.join('\n')


  console.log(
    "translated",
    translatedContent.length,
    translatedContent.slice(0, 10),
  );

  res.json(
    await cacheSet<ResponseData>(`translation:${key}`, {
      translatedContent,
    }),
  );
}

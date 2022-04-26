// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import YoutubeTranscript from "youtube-transcript";
import _, { chunk, flatMap } from "lodash";

import * as querystring from "querystring";

import { cacheSet, cacheGet } from "../../../../lib/hasuraCache";
import { DEEPL_API_KEY } from "../../../../lib/config";
import { URLSearchParams } from "url";

type ResponseData = {
  transcript: {
    text: string;
    translatedText: string;
    duration: number;
    offset: number;
  }[];
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  const videoId = req.query.id as string;
  const cachedValue = await cacheGet(`video:${videoId}`);
  if (cachedValue) {
    res.json(cachedValue as ResponseData);
    return;
  }

  const fullTranscript = await YoutubeTranscript.fetchTranscript(videoId, {
    lang: "en",
    country: "uk",
  });

  const translatedChunks = await Promise.all(
    chunk(fullTranscript, 300).map(async (transcript) => {
      const transcriptTextInEnglish = transcript.map((ch) => ch.text);

      const translateResp = await axios.post(
        `https://api.deepl.com/v2/translate`,
        new URLSearchParams({
          text: transcriptTextInEnglish.join(' \n\n ')
        }),
        {
          params: {
            target_lang: "BG",
            preserve_formatting: '1',
          },
          headers: {
            Authorization: `DeepL-Auth-Key ${DEEPL_API_KEY}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
        },
      );

      if (translateResp.status !== 200) {
        console.log('Error', JSON.stringify(translateResp.data))
      }

      const translatedChunk = (translateResp.data.translations[0].text as String).split('\n\n')
      console.log("translatedChunk.length", translatedChunk.length);

      return translatedChunk;
    }),
  );
  console.log("fullTranscript", translatedChunks.length);

  const translatedWords = flatMap(translatedChunks);

  console.log("fullTranscript", fullTranscript.length);
  console.log("translatedWords", translatedWords.length);

  const translatedTranscript = _.zip(
    fullTranscript.slice(0, translatedWords.length),
    translatedWords,
  ).map(([transcriptFrame, translatedText]) => {
    if (!transcriptFrame || !translatedText)
      throw "Not fully translated transcript";

    return {
      ...transcriptFrame,
      translatedText,
    };
  });

  console.log(
    "translatedTranscript",
    translatedTranscript.length,
    translatedTranscript.slice(0, 5),
  );

  res.json(
    await cacheSet<ResponseData>(`video:${videoId}`, {
      transcript: translatedTranscript,
    }),
  );
}

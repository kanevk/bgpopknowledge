// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import YoutubeTranscript from "youtube-transcript";
import _, { chunk, flatMap } from "lodash";

import { cacheSet, cacheGet } from "../../../lib/hasuraCache";
import { DEEPL_API_KEY } from "../../../lib/config";
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

  const translatedTuplesInChunks = await Promise.all(
    chunk(fullTranscript, 250).map(async (transcript) => {
      console.log("transcript.length", transcript.length);
      const transcriptTextInEnglish = transcript.map((ch) => ch.text);
      const formData = new URLSearchParams(
        transcriptTextInEnglish.map((t) => ["text", t] as [string, string]),
      );
      console.log(formData.toString().slice(0, 20));

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

      const translatedChunk = (
        translateResp.data.translations as { text: string }[]
      ).map((translation) => translation.text);
      console.log("translatedChunk.length", translatedChunk.length);

      return _.zip(transcriptTextInEnglish, translatedChunk);
    }),
  );
  console.log("fullTranscript chunks", translatedTuplesInChunks.length);

  const translatedPairs = flatMap(translatedTuplesInChunks);

  console.log("fullTranscript", fullTranscript.length);
  console.log("translatedWords", translatedPairs.length);
  if (fullTranscript.length !== translatedPairs.length)
    throw Error("Missing translations");

  const translatedTranscript = _.zip(
    fullTranscript.slice(0, translatedPairs.length),
    translatedPairs,
  ).map(([transcriptFrame, translatedPair]) => {
    if (!transcriptFrame || !translatedPair)
      throw Error("Not fully translated transcript");

    if (translatedPair[0] !== transcriptFrame.text)
      throw Error(
        `Translation mismatch, expected: ${transcriptFrame}, got: ${translatedPair[0]}`,
      );

    return {
      ...transcriptFrame,
      translatedText: translatedPair[1]!,
    };
  });

  console.log(
    "translatedTranscript",
    translatedTranscript.length,
    translatedTranscript.slice(0, 2),
  );

  res.json(
    await cacheSet<ResponseData>(`video:${videoId}`, {
      transcript: translatedTranscript,
    }),
  );
}

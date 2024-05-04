// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import { TranscriptResponse, YoutubeTranscript } from "youtube-transcript";
import _, { chunk, flatMap } from "lodash";

import { cacheSet, cacheGet } from "../../../lib/hasuraCache";
import { DEEPL_API_KEY } from "../../../lib/config";
import { URLSearchParams } from "url";

type SuccessResponseData = {
  transcript: {
    text: string;
    translatedText: string;
    duration: number;
    offset: number;
  }[];
};

type ErrorResponseData = {
  error: string;
};

// Build a function that can console log any object
const log = (...msgs: any[]) =>
  console.log(
    "[Video Transcript]",
    ...msgs.map((msg) =>
      typeof msg === "object" ? JSON.stringify(msg, null, 2) : msg,
    ),
  );

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<SuccessResponseData | ErrorResponseData>,
) {
  log("query", `${req.query}`);
  const videoId = req.query.id as string;
  const sourceLang = (req.query.sourceLang as string) || "en";
  const cachedValue = await cacheGet(`video:${videoId}`);
  console.log("cachedValue", cachedValue);
  if (cachedValue) {
    res.json(cachedValue as SuccessResponseData);
    return;
  }

  let fullTranscript: TranscriptResponse[] = [];

  try {
    fullTranscript = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: sourceLang,
    });
    console.log(
      "fullTranscript",
      fullTranscript.length,
      fullTranscript.slice(0, 2),
    );
  } catch (e: any) {
    console.error("Error", e);
    res.status(400).json({ error: e.message });
    return;
  }
  console.log("fullTranscript", fullTranscript.length, fullTranscript);

  const translatedTuplesInChunks = await Promise.all(
    chunk(fullTranscript, 250).map(async (transcript) => {
      console.log("transcript.length", transcript.length);
      const transcriptTextInEnglish = transcript.map((ch) => ch.text);
      const formData = new URLSearchParams(
        transcriptTextInEnglish.map((t) => ["text", t] as [string, string]),
      );
      console.log("formData slice", formData.toString().slice(0, 20));

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
      console.log("translateResp", translateResp.status);

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
    await cacheSet<SuccessResponseData>(`video:${videoId}`, {
      transcript: translatedTranscript,
    }),
  );
}

// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next'
import axios from "axios";
import YoutubeTranscript from "youtube-transcript";
import _ from "lodash";

import * as querystring from "querystring";

import { cacheSet, cacheGet } from '../../../lib/airtable';
import { DEEPL_API_KEY } from '../../../lib/config';

type ResponseData = {
  transcript: {
    text: string;
    translatedText: string;
    duration: number;
    offset: number;
  }[];
  textTotalSize: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
    const videoId = req.query.id as string;
    const cachedValue = await cacheGet(`video:${videoId}`);
    if (cachedValue) {
      res.json(cachedValue);
      return;
    }

    const transcript = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en', country: 'uk' });
    const transcriptTextInEnglish = transcript
      .map((ch) => ch.text)
      .join(" $##$ ");

    const translateResp = await axios.post(
      `https://api.deepl.com/v2/translate`,
      querystring.stringify({
        text: transcriptTextInEnglish,
      }),
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

    const translatedChunks = (
      translateResp.data.translations[0].text as string
    ).split("$##$");

    const translatedTranscript = _.zip(
      transcript.slice(0, translatedChunks.length),
      translatedChunks,
    ).map(([transcriptFrame, translatedText]) => {
      if (!transcriptFrame || !translatedText) throw "Not fully translated transcript"

      return {
        ...transcriptFrame,
        translatedText,
      };
    });

    res.json(await cacheSet<ResponseData>(`video:${videoId}`, {
      transcript: translatedTranscript,
      textTotalSize: transcriptTextInEnglish.length,
    }));
}

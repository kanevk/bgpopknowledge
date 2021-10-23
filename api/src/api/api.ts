import * as express from "express";
import { Response, Request, NextFunction } from "express"
import axios from "axios";
import * as _ from "lodash";

import * as asyncHandler from "express-async-handler"
import YoutubeTranscript from "youtube-transcript";

const DEEPL_API_KEY = process.env.DEEPL_API_KEY

const app = express();

app.get(
  "/yt/transcript/v/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const videoId = req.params.id;

    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    const transcriptTextInEnglish = transcript.map((ch) => ch.text).join(" #$# ");

    const translateResp = await axios.post(
      `https://api-free.deepl.com/v2/translate?auth_key=${DEEPL_API_KEY}`,
      {},
      {
        params: {
          text: transcriptTextInEnglish.slice(0, 500),
          source_lang: "EN",
          target_lang: "BG",
        },
      },
    );

    const translatedChunks = (translateResp.data.translations[0].text as string).split(' #$# ')

    const translatedTranscript = _.zip(transcript.slice(0, translatedChunks.length), translatedChunks).map(([transcriptFrame, translatedText]) => {
      return {
        ...transcriptFrame,
        translatedText
      }
    })

    const quotaCheck = await axios.get(`https://api-free.deepl.com/v2/usage?auth_key=${DEEPL_API_KEY}`)
    const quotaData = {
      character_count: quotaCheck.data.character_count,
      utilizationPct: (quotaCheck.data.character_count * 100 / quotaCheck.data.character_limit).toFixed(2),
    }
    res.json({ transcript: translatedTranscript, textTotalSize: transcriptTextInEnglish.length, ...quotaData});
  }),
);

app.use((req: Request, res: Response, next: NextFunction) => {
  console.log("Request URL: " + req.url);
  console.log("Request Params: " + JSON.stringify(req.params));
  console.log("Request date: " + new Date());
  next();
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  res.status(500);
  res.send(err.message || "Internal server error");
});

export default app;

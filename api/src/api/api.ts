import * as express from "express";
import { Response, Request, NextFunction } from "express";
import axios from "axios";
import * as _ from "lodash";
import * as querystring from "querystring";

import * as asyncHandler from "express-async-handler";
import YoutubeTranscript from "youtube-transcript";
import Airtable = require("airtable");

const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
if (!DEEPL_API_KEY) throw Error(`DEEPL_API_KEY not set - ${DEEPL_API_KEY}`);

const AIRTABLE_KEY = process.env.AIRTABLE_KEY;
if (!AIRTABLE_KEY) throw Error(`AIRTABLE_KEY not set - ${AIRTABLE_KEY}`);

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
if (!AIRTABLE_BASE_ID)
  throw Error(`AIRTABLE_BASE_ID not set - ${AIRTABLE_BASE_ID}`);

const app = express();

app.get(
  "/yt/transcript/v/:id",
  asyncHandler(async (req: Request, res: Response) => {
    const videoId = req.params.id;
    const cachedValue = await cacheGet(`video:${videoId}`);
    if (cachedValue) {
      res.json(cachedValue);
      return;
    }

    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    const transcriptTextInEnglish = transcript
      .map((ch) => ch.text)
      .join(" #$# ");

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
    ).split(" #$# ");

    const translatedTranscript = _.zip(
      transcript.slice(0, translatedChunks.length),
      translatedChunks,
    ).map(([transcriptFrame, translatedText]) => {
      return {
        ...transcriptFrame,
        translatedText,
      };
    });

    res.json(await cacheSet(`video:${videoId}`, {
      transcript: translatedTranscript,
      textTotalSize: transcriptTextInEnglish.length,
    }));
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

const cacheGet = async (key: string) => {
  const airbase = new Airtable({ apiKey: AIRTABLE_KEY }).base(AIRTABLE_BASE_ID);
  const Cache = airbase<{ key: string; value: string }>("cache");
  const [cacheRow] = await Cache.select({
    filterByFormula: `{key} = '${key}'`,
    fields: ["value"],
  }).all();

  return cacheRow ? JSON.parse(cacheRow.fields["value"]) : null;
};

const cacheSet = async (key: string, value: Record<string, any>) => {
  const airbase = new Airtable({ apiKey: AIRTABLE_KEY }).base(AIRTABLE_BASE_ID);
  const Cache = airbase("cache");
  await createAirRecord(Cache, { key, value: JSON.stringify(value) })

  return value;
};

const createAirRecord = async (
  table: {
    create: (
      records: any[],
      clb: (err: Error | null, records: any[]) => any,
    ) => any;
  },
  fields: Record<string, any>,
) => {
  return new Promise((resolve, reject) => {
    table.create(
      [
        {
          fields,
        },
      ],
      (err, _records) => {
        if (err) {
          console.error(err);
          reject(false);
          return;
        }

        resolve(true);
      },
    );
  });
};

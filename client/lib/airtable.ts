import Airtable from "airtable";
import { AIRTABLE_BASE_ID, AIRTABLE_KEY } from "./config";

const cacheGet = async (key: string) => {
  const airbase = new Airtable({ apiKey: AIRTABLE_KEY }).base(
    AIRTABLE_BASE_ID!,
  );
  const Cache = airbase<{ key: string; value: string }>("cache");
  const [cacheRow] = await Cache.select({
    filterByFormula: `{key} = '${key}'`,
    fields: ["value"],
  }).all();

  return cacheRow ? JSON.parse(cacheRow.fields["value"]) : null;
};

type CacheFields = {
  key: string;
  value: string;
};
const cacheSet = async<T> (key: string, value: T) => {
  const airbase = new Airtable({ apiKey: AIRTABLE_KEY }).base(
    AIRTABLE_BASE_ID!,
  );
  const Cache = airbase<CacheFields>("cache");
  await Cache.create({ key, value: JSON.stringify(value) });

  return value;
};

export { cacheGet, cacheSet };

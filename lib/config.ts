const DEEPL_API_KEY = process.env.DEEPL_API_KEY;
if (!DEEPL_API_KEY) throw Error(`DEEPL_API_KEY not set - ${DEEPL_API_KEY}`);

const AIRTABLE_KEY = process.env.AIRTABLE_KEY;
if (!AIRTABLE_KEY) throw Error(`AIRTABLE_KEY not set - ${AIRTABLE_KEY}`);

const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
if (!AIRTABLE_BASE_ID)
  throw Error(`AIRTABLE_BASE_ID not set - ${AIRTABLE_BASE_ID}`);

export { DEEPL_API_KEY, AIRTABLE_KEY, AIRTABLE_BASE_ID };

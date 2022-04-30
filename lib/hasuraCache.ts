import { NhostClient } from "@nhost/nhost-js";

const nhost = new NhostClient({
  backendUrl: "https://jeosnbwsaxhkwehlcxqj.nhost.run",
});

const cacheGet = async (key: string) => {
  const response = await nhost.graphql.request(
    `query getCache($key: String!) {
    hit: cache_by_pk(key: $key) {
      value
    }
  }`,
    { key },
  );

  const cachedValue = (response.data as { hit?: { value: Record<string, any> } }).hit?.value;

  return cachedValue ? cachedValue : null;
};

const cacheSet = async <T>(key: string, value: T) => {
  const response = await nhost.graphql.request(
    `mutation upsertCache($key: String!, $value: json) {
      insert_cache_one(
        object: {key: $key, value: $value}
        on_conflict: {
          constraint: general_cache_pkey
          update_columns: [value]
        }
      ) {
        key
      }
  }`,
    { key, value },
  );

  if (response.error) {
    throw Error(JSON.stringify(response.error))
  }

  return value;
};

export { cacheGet, cacheSet };

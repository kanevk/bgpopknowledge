const ADMIN_SECRET =
  "9LFbSeGYY2kHIc1gtDGJ4bqNdbyVTT0aEe3bavA2tTUX2JIhHy1eIL6EMr2gw3cV";

const runApiOperation = async (
  operation: string,
  variables: Record<string, any>,
) => {
  const response = await fetch(
    "https://bgpopknowleadge.hasura.app/v1/graphql",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-hasura-admin-secret": ADMIN_SECRET,
      },
      body: JSON.stringify({
        query: operation,
        variables,
      }),
    },
  );

  const data = await response.json();
  return data as { data: Record<string, any>; error?: any };
};

const cacheGet = async (key: string) => {
  const response = await runApiOperation(
    `query getCache($key: String!) {
    hit: cache_by_pk(key: $key) {
      value
    }
  }`,
    { key },
  );
  console.log(response);

  const cachedValue = (
    response.data as { hit?: { value: Record<string, any> } }
  ).hit?.value;

  if (cachedValue) console.log(`[Cache] cache hit for key: "${key}"`);

  return cachedValue ? cachedValue : null;
};

const cacheSet = async <T>(key: string, value: T) => {
  const response = await runApiOperation(
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
    throw Error(JSON.stringify(response.error));
  }

  return value;
};

export { cacheGet, cacheSet };

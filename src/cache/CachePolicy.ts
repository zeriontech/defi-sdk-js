export type CachePolicy =
  // if data found in cache, use it, if not, subscribe
  | "cache-first"

  // if data found in cache, use it, then create a subscription if there isn't one
  | "cache-and-network"

  // do not take data from cache, always create a new subscription
  | "network-only"

  // if data found in cache, use it, if not, do nothing
  | "cache-only";
// 'no-cache', // TODO: do not use cache and don't save to cache

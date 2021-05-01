import type { CachePolicy } from "./CachePolicy";

export function shouldReturnCachedData(cachePolicy: CachePolicy): boolean {
  switch (cachePolicy) {
    case "cache-and-network":
    case "cache-first":
    case "cache-only": {
      return true;
    }
    case "network-only": {
      return false;
    }
    default:
      throw new Error(`Unsupported cache policy: ${cachePolicy}`);
  }
}

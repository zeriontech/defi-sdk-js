import type { Entry } from "./Entry";
import type { CachePolicy } from "./CachePolicy";
import { DataStatus } from "./DataStatus";

export function isRequestNeeded(
  cachePolicy: CachePolicy,
  entry: Entry<any>,
  hasActiveSubscription: boolean
): boolean {
  switch (cachePolicy) {
    case "cache-and-network": {
      return (
        entry.status === DataStatus.noRequests ||
        (entry.status !== DataStatus.requested && !hasActiveSubscription)
      );
    }
    case "cache-first": {
      return entry.status === DataStatus.noRequests;
    }
    case "network-only": {
      return entry.status !== DataStatus.requested;
    }
    case "cache-only": {
      return false;
    }
    default:
      throw new Error(`Unsupported cache policy: ${cachePolicy}`);
  }
}

import type { Entry } from "./Entry";
import type { CachePolicy } from "./CachePolicy";
import { DataStatus } from "./DataStatus";

export function isRequestNeeded(
  cachePolicy: CachePolicy,
  entry: null | Entry<any>
): boolean {
  switch (cachePolicy) {
    case "cache-and-network": {
      return (
        !entry ||
        entry.status === DataStatus.noRequests ||
        (entry.status !== DataStatus.requested && !entry.apiSubscription)
      );
    }
    case "cache-first": {
      return !entry || entry.status === DataStatus.noRequests;
    }
    case "network-only": {
      return !entry || entry.status !== DataStatus.requested;
    }
    case "cache-only": {
      return false;
    }
    default:
      throw new Error(`Unsupported cache policy: ${cachePolicy}`);
  }
}

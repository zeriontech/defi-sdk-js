import "regenerator-runtime/runtime.js";
import {
  set as idbSet,
  del as idbDel,
  entries as idbEntries,
} from "idb-keyval";
import LRUCache from "lru-cache";
import { Store } from "store-unit";
import { CachePolicy } from "./CachePolicy";
import { DataStatus } from "./DataStatus";
import { EntryStore } from "./Entry";
import type { RequestCache } from "./RequestCache";

type Key = string | number;

export class PersistentCache
  extends Store<{ usesStaleEntries: boolean }>
  implements RequestCache<EntryStore> {
  map: Map<Key, EntryStore>;
  lruCache: LRUCache<Key, any>;
  private staleEntries: Set<EntryStore>;

  constructor({ max = 50 }: { max?: number } = {}) {
    super({ usesStaleEntries: false });
    this.map = new Map();
    this.lruCache = new LRUCache<Key, any>({
      max,
      dispose: (_value, key, reason) => {
        if (reason === "evict") {
          idbDel(key);
        }
      },
    });
    this.staleEntries = new Set();
  }

  getChangeHandler(key: Key, entryStore: EntryStore) {
    return (): void => {
      this.staleEntries.delete(entryStore);
      setTimeout(() => {
        if (this.state.usesStaleEntries && this.staleEntries.size === 0) {
          this.setState({ usesStaleEntries: false });
        }
      });
      this.safeWriteEntry(key, entryStore);
    };
  }

  safeWriteEntry(key: Key, entryStore: EntryStore): Promise<void> {
    if (entryStore.getState().status === DataStatus.ok) {
      const value = entryStore.getState();
      this.lruCache.set(key, value);
      return idbSet(key, value);
    }
    return Promise.resolve();
  }

  async load(): Promise<void> {
    return idbEntries().then(entries => {
      entries
        .filter(([, value]) => {
          return value.data != null && value.status === DataStatus.ok;
        })
        .forEach(([key, value]) => {
          value.isStale = true;
          value.hasSubscribers = false;
          const entryStore = new EntryStore(value);
          entryStore.on(
            "change",
            this.getChangeHandler(key as string, entryStore)
          );
          this.lruCache.set(key as string, entryStore);
          this.map.set(key as string, entryStore);
        });
    });
  }

  get(key: Key, cachePolicy: CachePolicy | null): EntryStore | null {
    const entry = this.map.get(key) || null;
    if (
      (cachePolicy === "cache-first" || cachePolicy === "cache-only") &&
      entry?.state.isStale
    ) {
      // for these cache policies we do NOT want to return entries found in persistent cache
      // because they will not get re-downloaded and therefore will be _too_ stale
      return null;
    }
    if (entry?.state.isStale) {
      if (
        cachePolicy === "network-only" ||
        cachePolicy === "cache-and-network"
      ) {
        // only for these cache policies we consider the entry to be stale
        this.staleEntries.add(entry);
        setTimeout(() => {
          if (!this.state.usesStaleEntries) {
            this.setState({ usesStaleEntries: true });
          }
        });
      }
    }
    return entry;
  }

  set(key: Key, entryStore: EntryStore): void {
    this.map.set(key, entryStore);
    entryStore.on("change", this.getChangeHandler(key, entryStore));
    this.safeWriteEntry(key, entryStore);
  }

  remove(key: Key): void {
    this.map.delete(key);
  }
}

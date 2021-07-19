import type { Entry } from "./Entry";
import { EntryStore } from "./Entry";

export class RequestCache {
  map: Map<string | number, EntryStore>;

  constructor() {
    this.map = new Map();
  }

  get(key: string | number): EntryStore | null {
    return this.map.get(key) || null;
  }

  set(key: string | number, entry: EntryStore): void {
    this.map.set(key, entry);
  }

  remove(key: string | number): void {
    this.map.delete(key);
  }

  getOrCreateEntry(
    key: string | number,
    initialParams?: Partial<Entry<any>>
  ): EntryStore {
    if (!this.get(key)) {
      this.set(key, new EntryStore(initialParams));
    }
    const entry = this.get(key);
    if (entry) {
      return entry;
    }
    throw new Error("Unexpected internal error: newly created entry not found");
  }
}

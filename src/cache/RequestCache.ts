import { CachePolicy } from "./CachePolicy";

type Key = string | number;

export class RequestCache<Value> {
  map: Map<Key, Value>;

  constructor() {
    this.map = new Map();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  get(key: Key, _cachePolicy: CachePolicy | null): Value | null {
    return this.map.get(key) || null;
  }

  set(key: Key, entry: Value): void {
    this.map.set(key, entry);
  }

  remove(key: Key): void {
    this.map.delete(key);
  }

  clear(): void {
    this.map.clear();
  }
}

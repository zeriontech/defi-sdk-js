import { Store } from "store-unit";
import { Unsubscribe } from "../shared/Unsubscribe";
import { DataStatus } from "./DataStatus";

export interface Entry<T, ScopeName extends string> {
  data: Record<ScopeName, T> | null;
  value: T | null;
  status: DataStatus;
  timestamp: number;
  meta: Record<string, any>;
  hasSubscribers: boolean;
  isStale: boolean;
  loading: boolean;
  done: boolean;
}

export function isIdleStatus(status: DataStatus): boolean {
  return status === DataStatus.error || status === DataStatus.ok;
}

function isLoadingStatus(status: DataStatus) {
  return status === DataStatus.requested || status === DataStatus.updating;
}

export const getInitialState = <T, ScopeName extends string>(
  initialStatus?: DataStatus
): Entry<T, ScopeName> => ({
  status: initialStatus ?? DataStatus.noRequests,
  value: null,
  data: null,
  timestamp: 0,
  meta: {},
  hasSubscribers: false,
  isStale: false,
  loading: isLoadingStatus(initialStatus ?? DataStatus.noRequests),
  done: false,
});

interface Subscription {
  unsubscribe: Unsubscribe;
}

export class EntryStore<T = any, ScopeName extends string = any> extends Store<
  Entry<T, ScopeName>
> {
  apiSubscription: null | Subscription;
  private listenersCount: number;

  constructor(entry: Entry<T, ScopeName>) {
    super(entry);
    this.apiSubscription = null;
    this.listenersCount = 0;
  }

  static fromStatus(status?: Entry<any, any>["status"]): EntryStore {
    return new EntryStore(getInitialState(status));
  }

  setData(
    scopeName: ScopeName,
    value: T | null,
    meta: Record<string, any> = {},
    status: DataStatus,
    done: boolean
  ): void {
    const data = { [scopeName]: value } as Record<ScopeName, T>;
    this.setState(state => ({
      ...state,
      data,
      meta,
      value,
      timestamp: Date.now(),
      status,
      isStale: false,
      loading: isLoadingStatus(status),
      done,
    }));
  }

  makeSubscription({ unsubscribe }: { unsubscribe: Unsubscribe }): void {
    // NOTE:
    // it's ok to mutate here because no listeners should've been added
    // at this point
    this.state.status = isIdleStatus(this.state.status)
      ? DataStatus.updating
      : DataStatus.requested;
    this.state.hasSubscribers = true;
    this.apiSubscription = { unsubscribe };
  }

  removeSubscription(): void {
    if (this.apiSubscription) {
      this.apiSubscription.unsubscribe();
      this.apiSubscription = null;
      this.state.hasSubscribers = false;
    }
    if (this.state.status === DataStatus.requested) {
      // NOTE:
      // it's ok to mutate here because there are no more listeners attached
      this.state.status = DataStatus.noRequests;
    }
  }

  addClientListener(
    cb: Parameters<Store<Entry<T, ScopeName>>["on"]>[1]
  ): () => void {
    const unlisten = super.on("change", cb);
    // return unlisten;
    this.listenersCount += 1;
    return () => {
      unlisten();

      this.listenersCount -= 1;
      if (this.listenersCount === 0) {
        // no more subscribers left, unsub from socket
        this.removeSubscription();
      }
    };
  }
}

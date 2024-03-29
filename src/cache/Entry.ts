import { Store } from "store-unit";
import { Unsubscribe } from "../shared/Unsubscribe";
import { DataStatus } from "./DataStatus";
import type { ErrorPayload } from "../requests/Response";

export interface Entry<T, ScopeName extends string> {
  data: Record<ScopeName, T> | null;
  value: T | null;
  status: DataStatus;
  timestamp: number;
  meta: Record<string, any>;
  hasSubscribers: boolean;
  isStale: boolean;
  isLoading: boolean;
  isFetching: boolean;
  isDone: boolean;
  isError: boolean;
  error: ErrorPayload | null;
  hasNext?: boolean; // for paginated requests only
}

export function isIdleStatus(status: DataStatus): boolean {
  return status === DataStatus.error || status === DataStatus.ok;
}

function isLoadingStatus(status: DataStatus) {
  return status === DataStatus.requested;
}

export function isFetchingStatus(status: DataStatus): boolean {
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
  isLoading: isLoadingStatus(initialStatus ?? DataStatus.noRequests),
  isFetching: isFetchingStatus(initialStatus ?? DataStatus.noRequests),
  isDone: false,
  isError: false,
  error: null,
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

  setData({
    scopeName,
    value,
    meta = {},
    status,
    isDone,
    error,
    hasNext,
  }: {
    scopeName: ScopeName;
    value: T | null;
    error: ErrorPayload | null;
    meta?: Record<string, any>;
    status: DataStatus;
    isDone: boolean;
    hasNext?: boolean;
  }): void {
    const data = { [scopeName]: value } as Record<ScopeName, T>;
    this.setState(state => ({
      ...state,
      data,
      meta,
      value,
      timestamp: Date.now(),
      status,
      isStale: false,
      isLoading: isLoadingStatus(status),
      isFetching: isFetchingStatus(status),
      isError: Boolean(error),
      error,
      isDone,
      hasNext,
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
    if (isFetchingStatus(this.state.status)) {
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

import { Store } from "../shared/Store";
import { Unsubscribe } from "../shared/Unsubscribe";
import { DataStatus } from "./DataStatus";

export interface Entry<T, ScopeName extends string> {
  data: Record<ScopeName, T> | null;
  value: T | null;
  status: DataStatus;
  timestamp: number;
  meta: Record<string, any>;
  apiSubscription: null | Subscription;
}

export const getInitialState = <T, ScopeName extends string>(
  initialStatus?: DataStatus
): Entry<T, ScopeName> => ({
  status: initialStatus ?? DataStatus.noRequests,
  value: null,
  data: null,
  timestamp: 0,
  meta: {},
  apiSubscription: null,
});

interface Subscription {
  unsubscribe: Unsubscribe;
}

function isIdleStatus(status: DataStatus) {
  return status === DataStatus.error || status === DataStatus.ok;
}

export class EntryStore<T = any, ScopeName extends string = any> extends Store<
  Entry<T, ScopeName>
> {
  constructor({ status }: Partial<Entry<T, ScopeName>> = {}) {
    super(getInitialState(status));
  }

  setData(
    scopeName: ScopeName,
    value: T | null,
    meta: Record<string, any> = {}
  ): void {
    const data = { [scopeName]: value } as Record<ScopeName, T>;
    this.setState(state => ({
      ...state,
      data,
      meta,
      value,
      timestamp: Date.now(),
      status: DataStatus.ok,
    }));
  }

  makeSubscription({ unsubscribe }: { unsubscribe: Unsubscribe }): void {
    // NOTE:
    // it's ok to mutate here because no listeners should've been added
    // at this point
    this.state.status = isIdleStatus(this.state.status)
      ? DataStatus.updating
      : DataStatus.requested;
    this.state.apiSubscription = {
      unsubscribe,
    };
  }

  removeSubscription(): void {
    if (this.state.apiSubscription) {
      this.state.apiSubscription.unsubscribe();
      this.state.apiSubscription = null;
    }
    if (this.state.status === DataStatus.requested) {
      // NOTE:
      // it's ok to mutate here because there are no more listeners attached
      this.state.status = DataStatus.noRequests;
    }
  }

  removeListener(cb: (state: Entry<T, ScopeName>) => void): void {
    super.removeListener(cb);

    if (this.listeners.size === 0) {
      // no more subscribers left, unsub from socket
      this.removeSubscription();
    }
  }
}

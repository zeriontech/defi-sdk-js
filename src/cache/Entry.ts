import { Store } from "../shared/Store";
import { Unsubscribe } from "../shared/Unsubscribe";
import { DataStatus } from "./DataStatus";

export interface Entry<T> {
  data: T | null;
  status: DataStatus;
  timestamp: number;
  apiSubscription: null | Subscription;
}

export const getInitialState = <T>(initialStatus?: DataStatus): Entry<T> => ({
  status: initialStatus ?? DataStatus.noRequests,
  data: null,
  timestamp: 0,
  apiSubscription: null,
});

interface Subscription {
  unsubscribe: Unsubscribe;
}

function isIdleStatus(status: DataStatus) {
  return status === DataStatus.error || status === DataStatus.ok;
}

export class EntryStore<T = any> extends Store<Entry<T>> {
  constructor({ status }: Partial<Entry<T>> = {}) {
    super(getInitialState(status));
  }

  setData(data: Entry<T>["data"]): void {
    this.setState(state => ({
      ...state,
      data,
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

  removeListener(cb: (state: Entry<T>) => void): void {
    super.removeListener(cb);

    if (this.listeners.size === 0) {
      // no more subscribers left, unsub from socket
      this.removeSubscription();
    }
  }
}

import { Store } from "../shared/Store";
import { Unsubscribe } from "../shared/Unsubscribe";
import { DataStatus } from "./DataStatus";

export interface Entry<T> {
  data: T | null;
  status: DataStatus;
  timestamp: number;
}

export const getInitialState = <T>(): Entry<T> => ({
  status: DataStatus.noRequests,
  data: null,
  timestamp: 0,
});

interface Subscription {
  unsubscribe: Unsubscribe;
}

export class EntryStore<T = any> extends Store<Entry<T>> {
  apiSubscription: null | Subscription;

  constructor() {
    super(getInitialState());
    this.apiSubscription = null;
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
    this.state.status =
      this.state.status === DataStatus.noRequests
        ? DataStatus.requested
        : DataStatus.updating;
    this.apiSubscription = {
      unsubscribe,
    };
  }

  removeSubscription(): void {
    if (this.apiSubscription) {
      this.apiSubscription.unsubscribe();
      this.apiSubscription = null;
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

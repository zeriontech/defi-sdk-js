import { Unsubscribe } from "./Unsubscribe";

interface SetStateAction<S> {
  (state: S): S;
}
function isSetStateAction<S>(x: S | SetStateAction<S>): x is SetStateAction<S> {
  return typeof x === "function";
}

interface Listener<T> {
  (state: T): void;
}

export class Store<S> {
  state: S;
  listeners: Set<Listener<S>>;

  constructor(initialState: S) {
    this.state = initialState;
    this.listeners = new Set();
  }

  addListener(cb: (state: S) => void): Unsubscribe {
    this.listeners.add(cb);
    return () => {
      this.listeners.delete(cb);
    };
  }

  removeListener(cb: (state: S) => void): void {
    this.listeners.delete(cb);
  }

  getState(): S {
    return this.state;
  }

  setState(stateOrStateSetter: S | SetStateAction<S>): void {
    let newState: S;
    if (isSetStateAction(stateOrStateSetter)) {
      newState = stateOrStateSetter(this.state);
    } else {
      newState = stateOrStateSetter;
    }
    if (newState === this.state) {
      return;
    }

    this.state = newState;

    for (const l of this.listeners) {
      l(this.state);
    }
  }
}

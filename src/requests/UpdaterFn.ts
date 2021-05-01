export type UpdaterFn<T> = (cb: (prevState: T) => T) => void;

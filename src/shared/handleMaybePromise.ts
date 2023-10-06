import { isPromise } from "./isPromise";

export function handleMaybePromise<T>(
  maybePromise: T | Promise<T>,
  cb: (data: T) => void
): void {
  if (isPromise(maybePromise)) {
    maybePromise.then(cb);
  } else {
    cb(maybePromise);
  }
}

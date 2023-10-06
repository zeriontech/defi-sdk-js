import { isObject } from "./isObject";

export function isPromise<T>(value: T | Promise<T>): value is Promise<T> {
  return isObject(value) && typeof value.then === "function";
}

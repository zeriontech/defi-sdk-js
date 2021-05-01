export interface Request<T, ScopeName extends string> {
  scope: ScopeName[];
  payload: T;
}

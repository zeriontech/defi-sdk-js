export type ResponsePayload<T, Key extends string> = {
  [K in Key]: T;
};

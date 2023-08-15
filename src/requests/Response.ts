export interface Response<T> {
  meta: any;
  payload: T;
}

export type ErrorPayload = {
  errors: {
    message: string;
    type: string;
  }[];
} & Record<string, any>;

export interface ErrorResponse {
  meta: { status: "error" };
  payload: ErrorPayload;
}

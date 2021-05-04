import { Response } from "./Response";
import { Request } from "./Request";

export function verifyByRequestId(
  request: Request<any, any>,
  response: Response<any>
): boolean {
  return (
    "request_id" in response.meta &&
    request.payload.request_id === response.meta.request_id
  );
}

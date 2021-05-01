import { Response } from "./Response";
import { Request } from "./Request";

export function verify(
  request: Request<any, any>,
  response: Response<any>
): boolean {
  // each value in request payload must be found in response meta
  return Object.keys(request.payload).every(key => {
    const requestValue = request.payload[key];
    const responseMetaValue = response.meta[key];
    if (typeof requestValue === "object") {
      return JSON.stringify(requestValue) === JSON.stringify(responseMetaValue);
    }
    return responseMetaValue === requestValue;
  });
}

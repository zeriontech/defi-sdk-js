import type {
  RequestPayload,
  ResponseData,
} from "../../domains/addressNftPosition";
import { namespace, scope } from "../../domains/addressNftPosition";
import { createDomainHook } from "./createDomainHook";

export const useAddressNftPosition = createDomainHook<
  RequestPayload,
  ResponseData,
  typeof namespace,
  typeof scope
>({
  namespace,
  scope,
});

import type {
  RequestPayload,
  ResponseData,
} from "../../domains/addressMembership";
import { namespace, scope } from "../../domains/addressMembership";
import { createDomainHook } from "./createDomainHook";

export const useAddressMembership = createDomainHook<
  RequestPayload,
  ResponseData,
  typeof namespace,
  typeof scope
>({
  namespace,
  scope,
});

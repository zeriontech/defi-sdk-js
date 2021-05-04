import type { RequestPayload, ResponseData } from "../../domains/addressLoans";
import { namespace, scope, mergeStrategy } from "../../domains/addressLoans";
import { createDomainHook } from "./createDomainHook";

export const useAddressLoans = createDomainHook<
  RequestPayload,
  ResponseData,
  typeof namespace,
  typeof scope
>({
  namespace,
  scope,
  mergeStrategy,
});

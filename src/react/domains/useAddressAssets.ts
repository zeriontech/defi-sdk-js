import type { RequestPayload, ResponseData } from "../../domains/addressAssets";
import { namespace, scope, getId } from "../../domains/addressAssets";
import { createDomainHook } from "./createDomainHook";

export const useAddressAssets = createDomainHook<
  RequestPayload,
  ResponseData,
  typeof namespace,
  typeof scope
>({
  namespace,
  scope,
  getId,
});

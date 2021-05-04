import type { RequestPayload, ResponseData } from "../../domains/assetsPrices";
import { namespace, scope, getId } from "../../domains/assetsPrices";
import { createDomainHook } from "./createDomainHook";

export const useAssetsPrices = createDomainHook<
  RequestPayload,
  ResponseData,
  typeof namespace,
  typeof scope
>({
  namespace,
  scope,
  getId,
});

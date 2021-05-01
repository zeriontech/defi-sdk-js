import type { RequestPayload, ResponseData } from "../../domains/assetsPrices";
import { Asset } from "../../entities/Asset";
import { createDomainHook } from "./createDomainHook";

export const useAssetsPrices = createDomainHook<
  RequestPayload,
  ResponseData,
  "assets",
  "prices"
>({
  namespace: "assets",
  scopeName: "prices",
  getId: (item: Asset) => item.asset_code,
});

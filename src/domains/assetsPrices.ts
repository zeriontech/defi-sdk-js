import type { Asset } from "../entities/Asset";
import { createDomainRequest } from "./createDomainRequest";

export interface RequestPayload {
  currency: string;
  asset_codes: string[];
}

export interface ResponseData {
  [key: string]: Asset;
}

export const assetsPrices = createDomainRequest<
  RequestPayload,
  ResponseData,
  "assets",
  "prices"
>({
  namespace: "assets",
  scopeName: "prices",
  getId: (item: Asset) => item.asset_code,
});

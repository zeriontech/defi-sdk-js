import type { Asset } from "../entities/Asset";
import { createDomainRequest } from "./createDomainRequest";

export interface RequestPayload {
  currency: string;
  asset_codes: string[];
}

export interface ResponseData {
  [key: string]: Asset;
}

export const namespace = "assets";
export const scope = "prices";
export const getId = (item: Asset): string => item.asset_code;

export const assetsPrices = createDomainRequest<
  RequestPayload,
  ResponseData,
  typeof namespace,
  typeof scope
>({
  namespace,
  scope,
  getId,
});

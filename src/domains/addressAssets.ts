import type { AddressAsset } from "../entities/AddressAsset";
import type { AddressParams } from "./AddressParams";
import { createDomainRequest } from "./createDomainRequest";

export type RequestPayload = AddressParams & {
  currency: string;
  asset_codes?: string[];
};

export interface ResponseData {
  [key: string]: AddressAsset;
}
export const namespace = "address";
export const scope = "assets";
export const getId = (item: AddressAsset): string => item.asset.asset_code;

export const addressAssets = createDomainRequest<
  RequestPayload,
  ResponseData,
  typeof namespace,
  typeof scope
>({
  namespace,
  scope,
  getId,
});

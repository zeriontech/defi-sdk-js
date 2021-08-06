import type { Asset } from "../entities/Asset";
import type { Response } from "../requests/Response";
import type { Request } from "../requests/Request";
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

export function verifyFn(
  request: Request<any, any>,
  response: Response<any>
): boolean {
  const { asset_codes, asset_code, currency } = response.meta;
  const {
    currency: requestCurrency,
    asset_codes: requestAssetCodes,
  } = request.payload;
  if (requestCurrency !== currency) {
    return false;
  }
  /**
   * Here we assume that "received" event always has "asset_codes" array in meta
   * and "changed" event always has "asset_code" string in meta
   */
  if (asset_code) {
    return requestAssetCodes.includes(asset_code);
  }
  if (requestAssetCodes.length > asset_codes.length) {
    return false;
  }
  const assetCodesSet = new Set(asset_codes);
  return requestAssetCodes.every((assetCode: string) =>
    assetCodesSet.has(assetCode)
  );
}

export const assetsPrices = createDomainRequest<
  RequestPayload,
  ResponseData,
  typeof namespace,
  typeof scope
>({
  namespace,
  scope,
  getId,
  verifyFn,
});

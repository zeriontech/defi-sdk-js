import type { AssetFullInfo } from "../entities/AssetFullInfo";
import { mergeSingleEntity } from "../shared/mergeStrategies";
import { createDomainRequest } from "./createDomainRequest";

export interface RequestPayload {
  currency: string;
  asset_code: string;
}

export type ResponseData = null | AssetFullInfo;

export const assetsFullInfo = createDomainRequest<
  RequestPayload,
  ResponseData,
  "assets",
  "full-info"
>({
  namespace: "assets",
  scopeName: "full-info",
  mergeStrategy: mergeSingleEntity,
});

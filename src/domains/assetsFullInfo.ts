import type { AssetFullInfo } from "../entities/AssetFullInfo";
import { mergeSingleEntity } from "../shared/mergeStrategies";
import { createDomainRequest } from "./createDomainRequest";

export interface RequestPayload {
  currency: string;
  asset_code: string;
}

export type ResponseData = null | AssetFullInfo;

export const namespace = "assets";
export const scope = "full-info";
export const mergeStrategy = mergeSingleEntity;

export const assetsFullInfo = createDomainRequest<
  RequestPayload,
  ResponseData,
  typeof namespace,
  typeof scope
>({
  namespace,
  scope,
  mergeStrategy,
});

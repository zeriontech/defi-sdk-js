import { AssetInfo } from "../entities/AssetInfo";
import { mergeList } from "../shared/mergeStrategies";
import { createDomainRequest } from "./createDomainRequest";

export interface RequestPayload {
  currency: string;
  asset_codes?: string[];
  limit?: number;
  offset?: number;
  explore_section?: number | string;
  category_id?: string;
  search_query?: string;
}

export type ResponseData = AssetInfo[];

export const namespace = "assets";
export const scope = "info";
export const getId = (item: AssetInfo): string => item.asset.asset_code;
export const mergeStrategy = mergeList;

export const assetsInfo = createDomainRequest<
  RequestPayload,
  ResponseData,
  typeof namespace,
  typeof scope
>({
  namespace,
  scope,
  getId,
  mergeStrategy,
});

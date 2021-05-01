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

export const assetsInfo = createDomainRequest<
  RequestPayload,
  ResponseData,
  "assets",
  "info"
>({
  namespace: "assets",
  scopeName: "info",
  getId: (item: AssetInfo) => item.asset.asset_code,
  mergeStrategy: mergeList,
});

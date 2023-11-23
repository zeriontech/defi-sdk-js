import { AssetInfo } from "../entities/AssetInfo";
import { mergeList } from "../shared/mergeStrategies";
import { createDomainRequest } from "./createDomainRequest";

export type SortKey =
  | "asset.price.value"
  | "relative_changes.1d"
  | "relative_changes.1m"
  | "relative_changes.3m"
  | "market_cap";

export interface Sorting {
  orderBy: SortKey;
  direction: "asc" | "desc";
}

export interface RequestPayload {
  currency: string;
  asset_codes?: string[];
  limit?: number;
  offset?: number;
  explore_section?: number | string;
  category_id?: string;
  search_query?: string;
  order_by: Partial<{ [key in SortKey]: Sorting["direction"] }>;
  chain?: string | null;
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

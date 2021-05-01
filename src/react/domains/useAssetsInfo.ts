import type { RequestPayload, ResponseData } from "../../domains/assetsInfo";
import type { AssetInfo } from "../../entities/AssetInfo";
import { mergeList } from "../../shared/mergeStrategies";
import { createDomainHook } from "./createDomainHook";

export const useAssetsInfo = createDomainHook<
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

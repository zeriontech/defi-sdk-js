import type {
  RequestPayload,
  ResponseData,
} from "../../domains/assetsFullInfo";
import { mergeSingleEntity } from "../../shared/mergeStrategies";
import { createDomainHook } from "./createDomainHook";

export const useAssetsFullInfo = createDomainHook<
  RequestPayload,
  ResponseData | null,
  "assets",
  "full-info"
>({
  namespace: "assets",
  scopeName: "full-info",
  mergeStrategy: mergeSingleEntity,
});

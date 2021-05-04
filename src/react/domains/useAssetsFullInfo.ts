import type {
  RequestPayload,
  ResponseData,
} from "../../domains/assetsFullInfo";
import { namespace, scope, mergeStrategy } from "../../domains/assetsFullInfo";
import { createDomainHook } from "./createDomainHook";

export const useAssetsFullInfo = createDomainHook<
  RequestPayload,
  ResponseData,
  typeof namespace,
  typeof scope
>({
  namespace,
  scope,
  mergeStrategy,
});

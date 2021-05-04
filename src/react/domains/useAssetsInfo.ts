import type { RequestPayload, ResponseData } from "../../domains/assetsInfo";
import {
  namespace,
  scope,
  mergeStrategy,
  getId,
} from "../../domains/assetsInfo";
import { createDomainHook } from "./createDomainHook";

export const useAssetsInfo = createDomainHook<
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

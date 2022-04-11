import { createDomainHook } from "./createDomainHook";
import {
  RequestPayload,
  ResponseData,
  namespace,
  scope,
} from "../../domains/assetsCharts";

export const useAssetsCharts = createDomainHook<
  RequestPayload,
  ResponseData,
  typeof namespace,
  typeof scope
>({
  namespace,
  scope,
});

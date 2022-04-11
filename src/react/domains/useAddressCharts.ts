import { createDomainHook } from "./createDomainHook";
import {
  RequestPayload,
  ResponseData,
  namespace,
  scope,
} from "../../domains/addressCharts";

export const useAddressCharts = createDomainHook<
  RequestPayload,
  ResponseData,
  typeof namespace,
  typeof scope
>({
  namespace,
  scope,
});

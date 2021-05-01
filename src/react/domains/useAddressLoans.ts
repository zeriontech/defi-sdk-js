import { RequestPayload, ResponseData } from "../../domains/addressLoans";
import { mergeList } from "../../shared/mergeStrategies";
import { createDomainHook } from "./createDomainHook";

export const useAddressLoans = createDomainHook<
  RequestPayload,
  ResponseData,
  "address",
  "loans"
>({
  namespace: "address",
  scopeName: "loans",
  mergeStrategy: mergeList,
});

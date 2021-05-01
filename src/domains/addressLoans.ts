import type { Loan } from "../entities/ProtocolInfo/Loan";
import type { AddressParams } from "./AddressParams";
import { mergeList } from "../shared/mergeStrategies";
import { createDomainRequest } from "./createDomainRequest";

export type RequestPayload = AddressParams & {
  currency: string;
};
export type ResponseData = Loan[];

export const addressLoans = createDomainRequest<
  RequestPayload,
  ResponseData,
  "address",
  "loans"
>({
  namespace: "address",
  scopeName: "loans",
  mergeStrategy: mergeList,
});

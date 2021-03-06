import type { Loan } from "../entities/ProtocolInfo/Loan";
import type { AddressParams } from "./AddressParams";
import { mergeList } from "../shared/mergeStrategies";
import { createDomainRequest } from "./createDomainRequest";

export type RequestPayload = AddressParams & {
  currency: string;
};
export type ResponseData = Loan[];

export const namespace = "address";
export const scope = "loans";
export const mergeStrategy = mergeList;

export const addressLoans = createDomainRequest<
  RequestPayload,
  ResponseData,
  typeof namespace,
  typeof scope
>({
  namespace,
  scope,
  mergeStrategy,
});

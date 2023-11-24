import type { AddressMembership } from "../entities/AddressMembership";
import type { AddressParams } from "./AddressParams";
import { createDomainRequest } from "./createDomainRequest";

export type RequestPayload = AddressParams;
export type ResponseData = AddressMembership;

export const namespace = "address";
export const scope = "membership";

export const addressMembership = createDomainRequest<
  RequestPayload,
  ResponseData,
  typeof namespace,
  typeof scope
>({
  namespace,
  scope,
});

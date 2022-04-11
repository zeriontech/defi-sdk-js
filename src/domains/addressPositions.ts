import { AddressPosition } from "../entities/AddressPosition";
import { AddressParams } from "./AddressParams";
import { createDomainRequest } from "./createDomainRequest";

export type RequestPayload = AddressParams & {
  currency: string;
  assets?: string[];
};
export interface ResponseData {
  aggregation_in_progress: boolean;
  positions: AddressPosition[];
}
export const namespace = "address";
export const scope = "positions";

export const addressPositions = createDomainRequest<
  RequestPayload,
  ResponseData,
  typeof namespace,
  typeof scope
>({
  namespace,
  scope,
});

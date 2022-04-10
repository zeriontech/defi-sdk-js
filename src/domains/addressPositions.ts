import { AddressPosition } from "../entities/AddressPosition";
import { mergeList } from "../shared/mergeStrategies";
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
export const mergeStrategy = mergeList;

export const assetsInfo = createDomainRequest<
  RequestPayload,
  ResponseData,
  typeof namespace,
  typeof scope
>({
  namespace,
  scope,
  mergeStrategy,
});

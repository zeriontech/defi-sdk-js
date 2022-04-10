import { AddressParams } from "../../domains/AddressParams";
import { createDomainHook } from "./createDomainHook";

type Payload = AddressParams & {
  currency: string;
  assets?: string[];
};
interface Response {
  aggregation_in_progress: boolean;
  positions: any; // AddressPosition[];
}
const namespace = "address";
const scope = "positions";

export const useAddressPositions = createDomainHook<
  Payload,
  Response,
  typeof namespace,
  typeof scope
>({
  namespace,
  scope,
});

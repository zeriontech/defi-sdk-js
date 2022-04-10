import { createDomainHook } from "./createDomainHook";
import {
  RequestPayload,
  ResponseData,
  namespace,
  scope,
  mergeStrategy,
} from "../../domains/addressPositions";

export const useAddressPositions = createDomainHook<
  RequestPayload,
  ResponseData,
  typeof namespace,
  typeof scope
>({
  namespace,
  scope,
  mergeStrategy,
});

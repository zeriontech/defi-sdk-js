import type { AddressNFT } from "../entities";
import type { AddressParams } from "./AddressParams";
import { createDomainRequest } from "./createDomainRequest";

export type RequestPayload = AddressParams & {
  currency: string;
  chain: string;
  contract_address: string;
  token_id: string;
};

export type ResponseData = AddressNFT;

export const namespace = "address";
export const scope = "nft-position";

export const addressNftPosition = createDomainRequest<
  RequestPayload,
  ResponseData,
  typeof namespace,
  typeof scope
>({
  namespace,
  scope,
});

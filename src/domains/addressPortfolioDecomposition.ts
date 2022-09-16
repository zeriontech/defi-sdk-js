import { PortfolioDecomposition } from "../entities";
import { AddressParams } from "./AddressParams";
import { createDomainRequest } from "./createDomainRequest";

export type Payload = AddressParams & {
  currency: string;
  nft_price_type?: "floor_price" | "buy_now_price" | "not_included";
};

export const namespace = "address";
export const scope = "portfolio-decomposition";

export const addressPortfolioDecomposition = createDomainRequest<
  Payload,
  PortfolioDecomposition,
  typeof namespace,
  typeof scope
>({
  namespace,
  scope,
});

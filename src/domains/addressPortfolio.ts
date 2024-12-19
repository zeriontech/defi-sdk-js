import type { AddressParams } from "./AddressParams";
import type { NFTValuePreferenceType } from "../entities/NFTInfo";
import type { Portfolio } from "../entities/Portfolio";
import { createDomainRequest } from "./createDomainRequest";

export type Payload = AddressParams & {
  currency: string;
  nft_price_type?: NFTValuePreferenceType | "not_included";
  portfolio_fields: "all";
  use_portfolio_service: true;
};

export const namespace = "address";
export const scope = "portfolio";

/** @deprecated Use `addressPortfolioDecomposition` instead */
export const addressPortfolio = createDomainRequest<
  Payload,
  Portfolio,
  typeof namespace,
  typeof scope
>({
  namespace,
  scope,
});

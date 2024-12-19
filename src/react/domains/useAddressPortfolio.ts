import { Payload, namespace, scope } from "../../domains/addressPortfolio";
import type { Portfolio } from "../../entities/Portfolio";
import { createDomainHook } from "./createDomainHook";

/** @deprecated Use `useAddressPortfolioDecomposition` instead */
export const useAddressPortfolio = createDomainHook<
  Payload,
  Portfolio,
  typeof namespace,
  typeof scope
>({
  namespace,
  scope,
});

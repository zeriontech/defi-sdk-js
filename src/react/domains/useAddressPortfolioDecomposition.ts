import { namespace, scope } from "../../domains/addressPortfolioDecomposition";
import type { Payload } from "../../domains/addressPortfolioDecomposition";
import { PortfolioDecomposition } from "../../entities/Portfolio";
import { createDomainHook } from "./createDomainHook";

export const useAddressPortfolioDecomposition = createDomainHook<
  Payload,
  PortfolioDecomposition,
  typeof namespace,
  typeof scope
>({
  namespace,
  scope,
});

import type {
  AddressAction,
  TransactionAssetFilter,
  TransactionTypeFilter,
} from "./../../entities/AddressAction";
import type { AddressParams } from "../../domains/AddressParams";
import { createPaginatedDomainHook } from "./createDomainHook";

type RequestPayload = AddressParams & {
  currency: string;
  actions_action_types?: TransactionTypeFilter[];
  actions_asset_types?: TransactionAssetFilter[];
  actions_search_query?: string;
  actions_fungible_ids?: string[];
  actions_chains?: string[];
};

export const namespace = "address";
export const scope = "actions";

export const useAddressActions = createPaginatedDomainHook<
  RequestPayload,
  AddressAction,
  typeof namespace,
  typeof scope
>({ namespace, scope, limitKey: "actions_limit" });

import { Asset } from "./Asset";
import { NFTAsset } from "./NFTAsset";
import { TransactionStatus } from "./TransactionStatus";

export type TransactionAssetFilter = "fungible" | "nft" | "all";
export type TransactionTypeFilter =
  | "mint"
  | "send"
  | "receive"
  | "trade"
  | "others";

export type ActionType =
  | "send"
  | "receive"
  | "trade"
  | "approve"
  | "execute"
  | "deployment"
  | "cancel"
  | "deposit"
  | "withdraw"
  | "borrow"
  | "repay"
  | "stake"
  | "unstake"
  | "claim"
  | "mint"
  | "burn";

export type ActionAsset =
  | {
      fungible: Asset | Record<string, never>;
    }
  | {
      nft: NFTAsset | Record<string, never>;
    };

export interface ActionTransfer {
  asset: ActionAsset;
  quantity: number;
  price: number | null;
  recipient?: string | null;
  sender?: string | null;
}

export interface ActionTransfers {
  outgoing?: ActionTransfer[];
  incoming?: ActionTransfer[];
}

export interface AddressAction {
  id: string;
  datetime: string;
  type: { value: ActionType; display_value: string };
  transaction: {
    chain: string;
    hash: string;
    status: TransactionStatus;
    nonce: number;
    fee: {
      asset: ActionAsset;
      quantity: number;
      price: number | null;
    } | null;
  };
  label: {
    type: "to" | "from" | "application" | "contract";
    value: string;
    icon_url?: string;
    display_value: {
      wallet_address?: string;
      contract_address?: string;
      text?: string;
    };
  } | null;
  content: {
    transfers?: ActionTransfers;
    single_asset?: {
      asset: ActionAsset;
    };
  } | null;
}

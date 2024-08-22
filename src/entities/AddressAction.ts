import { Asset } from "./Asset";
import { NFTCollection } from "./NFT";
import { NFTAsset } from "./NFTAsset";
import { TransactionStatus } from "./TransactionStatus";

export type ActionAssetFilter = "fungible" | "nft" | "all";
export type ActionTypeFilter = "mint" | "send" | "receive" | "trade" | "others";

export type ActionType =
  | "send"
  | "receive"
  | "trade"
  | "approve"
  | "revoke"
  | "execute"
  | "deploy"
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
  quantity: string;
  price: number | null;
  recipient?: string | null;
  sender?: string | null;
}

export interface ActionTransfers {
  outgoing?: ActionTransfer[];
  incoming?: ActionTransfer[];
}

interface ApprovalNFTCollection extends Omit<NFTCollection, "id"> {
  id: string;
}

export interface AddressAction {
  id: string;
  datetime: string;
  address: string;
  type: { value: ActionType; display_value: string };
  transaction: {
    chain: string;
    hash: string;
    status: TransactionStatus;
    nonce: number;
    sponsored: boolean;
    fee: {
      asset: ActionAsset;
      quantity: string;
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
      quantity: string;
    };
    collection?: ApprovalNFTCollection;
  } | null;
}

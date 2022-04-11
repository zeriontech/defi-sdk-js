import type { Asset } from "./Asset";
import type { Direction } from "./Direction";
import type { NFTAsset } from "./NFTAsset";
import type { TransactionStatus } from "./TransactionStatus";

export interface Change {
  asset: Asset;
  value: number | string;
  direction: Direction;
  address_from: string;
  address_to: string;
  price: number | null;
  chain?: string;
  nft_asset?: {
    asset: NFTAsset | null;
    collection: NFTAsset["collection"];
  } | null;
}

interface Meta {
  action?: string;
  application: string;
  spender?: string;
  asset?: Asset;
  amount?: number;
  chainId?: string;
  transaction?: { chainId?: string };
}

type RDBTransactionType =
  | "send"
  | "receive"
  | "trade"
  | "authorize"
  | "execution"
  | "deployment"
  | "cancel"
  | "deposit"
  | "withdraw"
  | "borrow"
  | "repay"
  | "stake"
  | "unstake"
  | "claim"
  | "mint";

export interface AddressTransaction {
  id: string;
  type: RDBTransactionType;
  block_number: number;
  changes: Change[];
  status: TransactionStatus;
  hash: string;
  direction: Direction | null;
  protocol: string | null;
  chainId?: string;
  address_from?: string;
  address_to?: string;
  contract: string | null;
  nonce: number | null;
  mined_at: number;
  meta: Partial<Meta>;
  fee: { value: number | string; price: number } | null;
}

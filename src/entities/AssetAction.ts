import type { Asset } from "./Asset";
import type { AssetActionType } from "./AssetActionType";
import type { Direction } from "./Direction";
import type { TransactionStatus } from "./TransactionStatus";

interface AssetActionFee {
  quantity: string;
  value: number;
}

export interface AssetAction {
  id: string;
  transaction_hash: string;
  type: AssetActionType;
  value: number;
  quantity: string;
  price: number | null;
  datetime: number;
  asset: Asset;
  status: TransactionStatus;
  direction: Direction;
  fee: AssetActionFee | null;
}

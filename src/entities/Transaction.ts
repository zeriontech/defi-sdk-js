import type { Direction } from "./Direction";
import type { RDBTransactionType } from "./RDBTransactionType";
import type { TransactionChange } from "./TransactionChange";
import type { TransactionStatus } from "./TransactionStatus";

interface TransactionFee {
  value: number;
  price: number;
}

export interface Transaction {
  id: string;
  type: RDBTransactionType;
  protocol: string;
  mined_at: number;
  block_number: number;
  status: TransactionStatus;
  hash: string;
  direction: Direction | null;
  address_from: string | null;
  address_to: string | null;
  contract: string | null;
  nonce: number | null;
  changes: TransactionChange | null;
  fee: TransactionFee | null;
  meta: string | null;
}

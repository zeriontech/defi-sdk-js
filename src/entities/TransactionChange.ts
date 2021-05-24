import type { Asset } from "./Asset";
import type { Direction } from "./Direction";

export interface TransactionChange {
  asset: Asset;
  value: number;
  direction: Direction;
  address_from: string;
  address_to: string;
  price: number | null;
}

/**
 * NOTE:
 * Motivation for using Unions instead of enums:
 * https://stackoverflow.com/a/60041791/3523645
 */
export type AssetActionType =
  | "buy"
  | "sell"
  | "send"
  | "receive"
  | "borrow"
  | "deposit"
  | "authorize"
  | "withdraw"
  | "repay"
  | "stake"
  | "unstake"
  | "claim";

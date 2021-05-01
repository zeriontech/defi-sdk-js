import type { ProtocolInfo } from "./ProtocolInfo";

export interface Loan extends ProtocolInfo {
  borrowed: number;
  borrow_rate: number | null;
  accrued_interest: number | null;
}

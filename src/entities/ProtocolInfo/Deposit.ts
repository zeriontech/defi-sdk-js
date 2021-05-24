import type { ProtocolInfo } from "./ProtocolInfo";

export interface Deposit extends ProtocolInfo {
  deposited: number;
  supply_rate: number | null;
}

import type { Asset } from "./Asset";

export type PositionType =
  | "asset"
  | "deposit"
  | "loan"
  | "reward"
  | "staked"
  | "locked";

export interface AddressPositionDappInfo {
  id: string;
  name: string | null;
  url: string | null;
  icon_url: string | null;
}

export interface AddressPosition {
  apy: string | null;
  asset: Asset;
  chain: string;
  id: string;
  included_in_chart: boolean;
  name: string;
  parent_id: string | null;
  protocol: string | null;
  quantity: string | null;
  type: PositionType;
  value: string | null;
  is_displayable: boolean;
  dapp: AddressPositionDappInfo | null;
}

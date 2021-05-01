import type { Asset } from "../Asset";

export interface ProtocolInfo {
  id: string;
  asset: Asset;
  value: number;
  section: string;
  protocol: string;
  displayed_on_chart: boolean;
}

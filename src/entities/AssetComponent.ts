import type { Asset } from "./Asset";

export interface AssetComponent {
  asset: Asset;
  quantity: number;
  share: number;
  allocation: number;
}

import type { NFTAsset } from "./NFTAsset";

export interface AddressNFT {
  id: string;
  asset: NFTAsset;
  amount: string;
  section: string;
  section_tokens_count: number;
  displayed_on_chart: boolean;
  value: number | null;
  standard: string;
}

export interface CovalentAsset {
  asset_code: string;
  name: string;
  symbol: string;
  decimals: number;
  icon_url: string | null;
  value: number | null;
}

export interface Portfolio {
  assets_value: number;
  deposited_value: number;
  borrowed_value: number;
  locked_value: number;
  staked_value: number;
  bsc_assets_value: number;
  polygon_assets_value: number;
  total_value: number;
  absolute_change_24h: number;
  relative_change_24h: number | null;
}

type GasPriceSource = "gas-now" | "eth-gas-station";

export interface GasPriceInfo {
  rapid: number | null;
  fast: number | null;
  standard: number | null;
  slow: number | null;
  source: GasPriceSource;
  datetime: string;
}

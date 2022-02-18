import type { Asset } from "./Asset";

interface PriceStat {
  min: number;
  max: number;
  relative_change: number;
}

export interface PriceStats {
  "1m": PriceStat | null;
  "1w": PriceStat | null;
  "1y": PriceStat | null;
  "3m": PriceStat | null;
  "24h": PriceStat | null;
}

export interface RelativeChanges {
  "1h": number | null;
  "1d": number | null;
  "1m": number | null;
  "1w": number | null;
  "1y": number | null;
  "3m": number | null;
}

interface GradientColor {
  start: string;
  end: string;
}

export interface AssetInfo {
  asset: Asset;
  title: string;
  gradient_color: GradientColor;
  explore_sections: number[];
  subtitle: string | null;
  tagline: string | null;
  market_cap: number | null;
  relative_changes: RelativeChanges | null;
}

import { Asset } from "./Asset";

interface RelativeChanges {
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

interface AssetFullInfoStats {
  asset_code: string;
  year_min: number | null;
  year_max: number | null;
  volume_24h: number | null;
}

interface AssetComponent {
  asset: Asset;
  quantity: number;
  share: number;
  allocation: number;
}

interface AssetRelevantResource {
  name: string;
  url: string;
  displayable_name: string | null;
}

export interface AssetFullInfo {
  asset: Asset;
  title: string;
  stats: AssetFullInfoStats;
  components: { [key: string]: AssetComponent };
  gradient_color: GradientColor;
  explore_sections: number[];
  subtitle: string | null;
  tagline: string | null;
  market_cap: number | null;
  relative_changes: RelativeChanges | null;
  description: string;
  relevant_resources: AssetRelevantResource[];
  tags: string[] | null;
  is_tradable: boolean;
  fully_diluted_valuation: number;
}

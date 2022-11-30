export interface NFTCollection {
  name: string;
  description: string | null;
  icon_url: string | null;
}

export interface NFTCollectionInfo {
  description: string | null;
  icon_url: string | null;
  name: string;
  slug: string;
}

interface NFTRelevantResource {
  name: string;
  url: string;
  displayable_name: string | null;
}

export interface FullNFTCollectionInfo {
  collection_id: string;
  name: string;
  symbol: string | null;
  interface: string;
  icon_url: string;
  description: string;
  floor_price: number;
  nfts_count: number;
  num_owners: number;
  one_day_volume: number;
  seven_day_volume: number;
  thirty_day_volume: number;
  one_day_change: number;
  total_volume: number;
  market_cap: number;
  banner_image_url: string | null;
  relevant_urls: NFTRelevantResource[];
  created_date: string;
}

export type NFTCollectionsSortedByType =
  | "floor_price_high"
  | "floor_price_low"
  | "market_cap_high"
  | "market_cap_low"
  | "total_volume_high"
  | "total_volume_low"
  | "num_owners_high"
  | "num_owners_low"
  | "one_day_change_high"
  | "one_day_change_low"
  | "one_day_volume_high"
  | "one_day_volume_low";

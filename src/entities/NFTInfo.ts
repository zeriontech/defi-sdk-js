import type { NFTCollection } from "./NFT";
import type { NFTAsset } from "./NFTAsset";
import type { NFTCollectionInfo } from "./NFTCollection";

interface NFTAttribute {
  key: string;
  value: string;
}

interface Resource {
  name: string | null;
  url: string;
}

export interface NFTInfo {
  asset: NFTAsset;
  collection: NFTCollection | null; // deprecated - use collection_info instead
  collection_info: NFTCollectionInfo | null;
  description: string | null;
  attributes: NFTAttribute[];
  relevant_urls: null | Resource[];
}

export type NFTValuePreferenceType = "floor_price" | "last_price";

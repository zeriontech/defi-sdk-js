import type { NFTAsset } from "./NFTAsset";
import type { NFTCollection, NFTCollectionInfo } from "./NFTCollection";

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
  collection: NFTCollection | null; // deprecated
  collection_info: NFTCollectionInfo | null;
  description: string | null;
  attributes: NFTAttribute[];
  relevant_urls: null | Resource[];
}

export type NFTValuePreferenceType = "floor_price" | "last_price";

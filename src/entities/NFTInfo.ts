import type { NFTAsset } from "./NFTAsset";
import { NFTCollection } from "./NFTCollection";

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
  collection: NFTCollection;
  description: string | null;
  attributes: NFTAttribute[];
  relevant_urls: null | Resource[];
}

export type NFTValuePreferenceType = "floor_price" | "last_price";

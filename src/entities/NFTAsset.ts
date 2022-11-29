import type { NFTCollection, NFTCollectionInfo } from "./NFTCollection";

interface NFTContent {
  url: string | null;
  meta: null | { [key: string]: string };
}

export interface NFTAsset {
  asset_code: string;
  name: string;
  symbol: string;
  preview: NFTContent;
  detail: NFTContent;
  interface: string;
  contract_address: string;
  token_id: string;
  type: "nft";
  price: null | {
    value: number;
  };
  icon_url: string | null;
  is_verified: boolean;
  collection: NFTCollection | null; // deprecated - use collection_info instead
  collection_info: NFTCollectionInfo | null;
  tags: string | null;
  floor_price: number;
  last_price: number;
}

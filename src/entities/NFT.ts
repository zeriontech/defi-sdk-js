export interface MediaContentValue {
  image_preview_url?: string;
  image_url?: string | null;
  audio_url?: string | null;
  video_url?: string | null;
  type: "video" | "image" | "audio";
}

interface NFTAttribute {
  key: string;
  value?: string;
}

interface NFTMetadata {
  name: string;
  description?: string;
  tags: string[];
  content?: MediaContentValue;
  attributes: NFTAttribute[];
}

interface ConvertedPrices {
  floor_price: number;
  total_floor_price?: number;
  currency: string;
}

interface NativePrices {
  floor_price: number;
  total_floor_price?: number;
  buy_now_price?: number;
  payment_token: {
    symbol: string;
  };
}

interface NFTPrice {
  native?: NativePrices;
  converted?: ConvertedPrices;
}

export interface NFTCollection {
  id: number;
  name?: string;
  description?: string;
  icon_url?: string;
  payment_token_symbol?: string;
  slug?: string;
}

export interface NFT {
  contract_address: string;
  contract_standard: "ERC721" | "ERC1155" | "CRYPTOPUNKS";
  token_id: string;
  chain: string;
  metadata: NFTMetadata;
  collection: NFTCollection;
  prices: NFTPrice;
  relevant_urls?: { name: string; url: string }[];
}

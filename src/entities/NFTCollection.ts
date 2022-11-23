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

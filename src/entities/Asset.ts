interface Price {
  value: number;
  relative_change_24h: number;
  changed_at: number;
}

export interface Asset {
  id: string;
  asset_code: string;
  decimals: number;
  icon_url: string | null;
  name: string;
  price: Price | null;
  symbol: string;
  type: string | null;
  is_displayable: boolean;
  is_verified: boolean;
  addresses?: { [key: string]: string };
  implementations?: {
    [key: string]: { address: string | null; decimals: number };
  };
}

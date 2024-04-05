export interface Portfolio {
  assets_value: number;
  deposited_value: number;
  borrowed_value: number;
  locked_value: number;
  staked_value: number;
  bsc_assets_value: number;
  polygon_assets_value: number;
  total_value: number;
  optimism_assets_value: number;
  arbitrum_assets_value: number;
  absolute_change_24h: number;
  relative_change_24h?: number;
  nft_floor_price_value: number;
  nft_last_price_value: number;
}

export interface PortfolioDecomposition {
  positions_types_distribution: {
    assets: number;
    deposited: number;
    borrowed: number;
    locked: number;
    staked: number;
  };
  positions_chains_distribution: Record<string, number>; // keys are chain names
  nfts: {
    last_price: number;
    floor_price: number;
  };
  change_24h: {
    absolute: number;
    relative: number;
  };
  total_value: number;
  chains: Record<
    string,
    {
      id: string;
      explorer_tx_url: string | null;
      icon_url: string | null;
      is_testnet: boolean;
      name: string;
    }
  >;
}

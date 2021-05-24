export interface AddressInfo {
  address: string;
  type: string;
  proxies: string | null;
  cdps: number | null;
  vaults: number | null;
  aggregated_at: number | null;
}

import { NFT } from "./NFT";

export interface AddressNFT extends NFT {
  changed_at?: number;
  amount?: number;
}

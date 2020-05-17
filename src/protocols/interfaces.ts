import { Address } from './types';

export interface ContractAddresses {
  adapterRegistry: Address;
}

export interface DeFiSDKInterface {
  getProtocolNames(): string[];
  getProtocolMetaData(protocol: string): ProtocolMetaDataInterface;
}

export interface ProtocolMetaDataInterface {
  name: string;
  description: string;
  website: URL;
  logo: URL;
  version: BigInt;
}

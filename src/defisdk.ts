import { Contract, ethers } from 'ethers';
import adapterRegistryABI from './configs/adapterRegistryABI.json';
import { getContractAddresses } from './addresses';
import {
  DeFiSDKInterface,
  ProtocolMetaDataInterface,
} from './protocols/interfaces';
import { BigNumber } from 'ethers/utils';

export class DeFiSDK implements DeFiSDKInterface {
  protected adapterRegistry: Contract;

  constructor(nodeUrl: string) {
    this.adapterRegistry = new ethers.Contract(
      getContractAddresses().adapterRegistry,
      adapterRegistryABI,
      new ethers.providers.JsonRpcProvider(new URL(nodeUrl).toString())
    );
  }

  getProtocolNames(): string[] {
    return this.adapterRegistry.getProtocolNames().then(protocols => {
      return protocols;
    });
  }

  getProtocolMetaData(protocol: string): ProtocolMetaData {
    return this.adapterRegistry.getProtocolMetadata(protocol).then(protocol => {
      return new ProtocolMetaData(
        protocol.name,
        protocol.description,
        protocol.websiteURL,
        protocol.iconURL,
        protocol.version
      );
    });
  }
}

class ProtocolMetaData implements ProtocolMetaDataInterface {
  description: string;
  logo: URL;
  name: string;
  version: BigInt;
  website: URL;

  constructor(
    name: string,
    description: string,
    website: string,
    logo: string,
    version: BigNumber
  ) {
    this.name = name;
    this.description = description;
    this.website = new URL('https://' + website);
    this.logo = new URL('https://' + logo);
    this.version = BigInt(version.toNumber());
  }
}

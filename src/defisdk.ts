import { Contract, ethers } from 'ethers';
import adapterRegistryABI from './configs/adapterRegistryABI.json';
import {addresses} from './configs/addresses';
import {
  DeFiSDKInterface,
} from './protocols/interfaces';
import { Address } from './protocols/types';
import { Builder } from './entities/builder';
import { ProtocolDoesNotExistError } from './errors/protocolDoesNotExist';

export class DeFiSDK implements DeFiSDKInterface {

  protected adapterRegistry: Contract;
  private builder: Builder;

  constructor(nodeUrl: string) {
    this.adapterRegistry = new ethers.Contract(
      addresses.adapterRegistry,
      adapterRegistryABI,
      new ethers.providers.JsonRpcProvider(new URL(nodeUrl).toString())
    );
    this.builder = new Builder();
  }

  getProtocolNames() {
    return this.adapterRegistry.getProtocolNames() as Promise<string[]>
  }

  getProtocolMetaData(protocol: string) {
    return this.adapterRegistry.getProtocolMetadata(protocol).then(protocol => {
      return this.builder.protocolMetadata(protocol)
    });
  }

  getTokenAdapterNames() {
    return this.adapterRegistry.getTokenAdapterNames() as Promise<string[]>
  }

  getProtocolBalance(account: Address, protocol: string) {
    return this.getProtocolBalances(account, [protocol]).then(
      protocolBalances => {
        if(protocolBalances.length === 0) {
          throw new ProtocolDoesNotExistError(protocol)
        } else if(protocolBalances.length > 1) {
          throw new RangeError("More than 1 protocol found.")
        }
        return protocolBalances[0];
      }
    )
  }

  getProtocolBalances(account: Address, protocols: string[]) {
    return this.adapterRegistry.getProtocolBalances(account, protocols).then(protocolBalances => {
      return protocolBalances.map(protocolBalance => {
        return this.builder.protocolBalance(protocolBalance);
      })
    });
  }

  getAccountBalances(account: Address) {
    return this.adapterRegistry.getBalances(account).then(accountBalances => {
      return accountBalances.map(protocolBalance => {
        return this.builder.protocolBalance(protocolBalance);
      })
    });
  }

  getTokenComponents(type: string, token: Address) {
    return this.adapterRegistry.getFinalFullTokenBalance(type, token).then(asset => {
      return this.builder.assetBalance(asset)
    })
  }
}

import {
  AdapterBalanceInterface,
  AdapterMetadataInterface,
  AssetBalanceInterface,
  ProtocolBalanceInterface,
  ProtocolMetadataInterface,
  TokenBalanceInterface,
  TokenMetadataInterface,
} from '../protocols/interfaces';
import { Address } from '../protocols/types';
import BigNumber from 'bignumber.js';

export class ProtocolBalance implements ProtocolBalanceInterface {
  balances: [AdapterBalanceInterface];
  metadata: ProtocolMetadataInterface;

  constructor(balances: [AdapterBalance], metadata: ProtocolMetadata) {
    this.metadata = metadata;
    this.balances = balances;
  }
}

export class ProtocolMetadata implements ProtocolMetadataInterface {
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
    //TODO: Check int
    this.version = BigInt(version.toNumber());
  }
}

export class AdapterBalance implements AdapterBalanceInterface {
  balances: [AssetBalanceInterface];
  metadata: AdapterMetadataInterface;

  constructor(balances: [AssetBalance], metadata: AdapterMetadata) {
    this.metadata = metadata;
    this.balances = balances;
  }
}

export class AdapterMetadata implements AdapterMetadataInterface {
  address: Address;
  type: string;

  constructor(address: Address, type: string) {
    this.address = address;
    this.type = type;
  }
}

export class AssetBalance implements AssetBalanceInterface {
  base: TokenBalanceInterface;
  underlying: [TokenBalanceInterface];

  constructor(base: TokenBalance, underlying: [TokenBalance]) {
    this.base = base;
    this.underlying = underlying;
  }
}

export class TokenBalance implements TokenBalanceInterface {
  balance: BigInt;
  metadata: TokenMetadataInterface;

  constructor(balance: BigInt, metadata: TokenMetadata) {
    this.balance = balance;
    this.metadata = metadata;
  }

  getAmount(): BigNumber {
    return new BigNumber(this.balance.toString()).dividedBy(
      new BigNumber(10).pow(this.metadata.decimals.toString())
    );
  }
}

export class TokenMetadata implements TokenMetadataInterface {
  address: Address;
  decimals: number;
  name: string;
  symbol: string;

  constructor(
    address: Address,
    decimals: number,
    name: string,
    symbol: string
  ) {
    this.address = address;
    this.decimals = decimals;
    this.name = name;
    this.symbol = symbol;
  }
}

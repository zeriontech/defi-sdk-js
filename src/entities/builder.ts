import {
  AdapterBalance,
  AdapterMetadata,
  AssetBalance,
  ProtocolBalance,
  ProtocolMetadata,
  TokenBalance,
  TokenMetadata,
} from './entities';

export class Builder {
  protocolBalance(protocolBalance): ProtocolBalance {
    return new ProtocolBalance(
      protocolBalance.adapterBalances.map(adapterBalance => {
        return this.adapterBalance(adapterBalance);
      }),
      this.protocolMetadata(protocolBalance.metadata)
    );
  }

  adapterBalance(protocolAdapter): AdapterBalance {
    return new AdapterBalance(
      protocolAdapter.balances.map(adapterBalance => {
        return this.assetBalance(adapterBalance);
      }),
      this.adapterMetadata(protocolAdapter.metadata)
    );
  }

  protocolMetadata(protocol): ProtocolMetadata {
    return new ProtocolMetadata(
      protocol.name,
      protocol.description,
      protocol.websiteURL,
      protocol.iconURL,
      protocol.version
    );
  }

  adapterMetadata(adapterMetadata): AdapterMetadata {
    return new AdapterMetadata(
      adapterMetadata.adapterAddress,
      adapterMetadata.adapterType
    );
  }

  assetBalance(assetBalance): AssetBalance {
    return new AssetBalance(
      this.tokenBalance(assetBalance.base),
      assetBalance.underlying.map(underlying => {
        return this.tokenBalance(underlying);
      })
    );
  }

  tokenBalance(tokenBalance): TokenBalance {
    return new TokenBalance(
      tokenBalance.amount.toString(),
      this.tokenMetadata(tokenBalance.metadata)
    );
  }

  tokenMetadata(metadata): TokenMetadata {
    return new TokenMetadata(
      metadata.token,
      metadata.decimals,
      metadata.name,
      metadata.symbol
    );
  }
}

import { DeFiSDK } from '../src/defisdk';
import { Address } from '../src/protocols/types';
import { AssetBalance, ProtocolBalance } from '../src/entities/entities';
import { ProtocolDoesNotExistError } from '../src/errors/protocolDoesNotExist';
import { TokenAdapters } from '../src/configs/tokenAdapters';
import { Protocols } from '../src/configs/protocols';

describe('DeFi SDK', () => {
  const nodeUrl = 'https://eth-mainnet.zerion.io/';
  const account: Address = '0x42b9dF65B219B3dD36FF330A4dD8f327A6Ada990';
  let defiSdk = new DeFiSDK(nodeUrl);

  it('gets protocol names', async () => {
    let protocols: string[] = await defiSdk.getProtocolNames();
    expect(protocols.length).toBeGreaterThan(0);
  });

  it('gets protocol metadata', async () => {
    const protocolName = Protocols.AAVE;
    let protocol = await defiSdk.getProtocolMetaData(protocolName);
    expect(protocol.name).toEqual(protocolName);
  });

  it('gets token adapters', async () => {
    let adapters: string[] = await defiSdk.getTokenAdapterNames();
    expect(adapters.length).toBeGreaterThan(0);
  });

  it('gets protocol balance', async () => {
    let balance = await defiSdk.getProtocolBalance(account, Protocols.COMPOUND);
    expect(balance).toBeInstanceOf(ProtocolBalance);
  });

  it('gets wrong protocol balance', async () => {
    const protocol = 'FED';
    try {
      await defiSdk.getProtocolBalance(account, protocol);
    } catch (e) {
      expect(e).toEqual(new ProtocolDoesNotExistError(protocol));
    }
  });

  it('gets protocol balances', async () => {
    const protocols: string[] = [Protocols.AAVE, Protocols.COMPOUND];
    let balances = await defiSdk.getProtocolBalances(account, protocols);
    expect(balances.length).toEqual(2);
  });

  it('gets token components', async () => {
    const tokenType = TokenAdapters.UNISWAP_V2;
    const tokenAddress: Address = '0xa478c2975ab1ea89e8196811f51a7b7ade33eb11';
    let components = await defiSdk.getTokenComponents(tokenType, tokenAddress);
    expect(components).toBeInstanceOf(AssetBalance);
  });

  it('gets token component amount', async () => {
    const tokenType = TokenAdapters.UNISWAP_V2;
    const tokenAddress: Address = '0xa478c2975ab1ea89e8196811f51a7b7ade33eb11';
    let components = await defiSdk.getTokenComponents(tokenType, tokenAddress);
    expect(components.base.getAmount().toString()).toEqual('1');
  });

  it('gets account balance', async () => {
    let balances = await defiSdk.getAccountBalances(account);
    expect(balances.length).toBeGreaterThan(0);
  });
});

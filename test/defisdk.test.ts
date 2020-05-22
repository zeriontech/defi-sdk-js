import { DeFiSDK } from '../src/defisdk';
import { Address } from '../src/protocols/types';
import { AssetBalance, ProtocolBalance } from '../src/entities/entities';
import { ProtocolDoesNotExistError } from '../src/errors/protocolDoesNotExist';
//import { ProtocolDoesNotExistError } from '../src/errors/protocolDoesNotExist';

describe('DeFi SDK', () => {
  const nodeUrl = 'https://eth-mainnet.zerion.io/';
  const account: Address = '0x42b9dF65B219B3dD36FF330A4dD8f327A6Ada990';
  let defiSdk = new DeFiSDK(nodeUrl);

  it('gets protocol names', async () => {
    let protocols: string[] = await defiSdk.getProtocolNames();
    expect(protocols.length).toBeGreaterThan(0);
  });

  it('gets protocol metadata', async () => {
    const protocolName = 'Aave';
    let protocol = await defiSdk.getProtocolMetaData(protocolName);
    expect(protocol.name).toEqual(protocolName);
  });

  it('gets token adapters', async () => {
    let adapters: string[] = await defiSdk.getTokenAdapterNames();
    expect(adapters.length).toBeGreaterThan(0);
  });

  it('gets protocol balance', async () => {
    let balance = await defiSdk.getProtocolBalance(account, 'Compound');
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
    const protocols: string[] = ['Aave', 'Compound'];
    let balances = await defiSdk.getProtocolBalances(account, protocols);
    expect(balances.length).toEqual(2);
  });

  it('gets token components', async () => {
    const tokenType = 'Uniswap V2 pool token';
    const tokenAddress: Address = '0xa478c2975ab1ea89e8196811f51a7b7ade33eb11';
    let components = await defiSdk.getTokenComponents(tokenType, tokenAddress);
    expect(components).toBeInstanceOf(AssetBalance);
  });

  it('gets account balance', async () => {
    let balances = await defiSdk.getAccountBalances(account);
    expect(balances.length).toBeGreaterThan(0);
  });
});

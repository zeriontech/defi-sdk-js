import { DeFiSDK } from '../src/defisdk';

describe('DeFi SDK', () => {
  let nodeUrl = 'https://eth-mainnet.zerion.io/';
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
});

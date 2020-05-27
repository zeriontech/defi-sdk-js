# defi-sdk

A TypeScript/Javascript library for interacting with the [DeFi SDK](https://github.com/zeriontech/defi-sdk).

Visit **[docs.zerion.io](https://docs.zerion.io)** for full documentation.

## Installation

```
npm install defi-sdk
```

defi-sdk uses `ethers` as a peer dependency. If you don't have it in your
project, install it:

```
npm install ethers
```

## Usage

defi-sdk is optimized and bundled with Rollup into multiple formats (CommonJS, UMD, and ES Module).

### Initialize DeFiSDK
DeFi SDK directly connects to the Ethereum blockchain. You are welcome to use an Ethereum node of your choice to start using DeFi SDK.
If you don't have a node, in the example below you can use a node provided by Cloudflare and served through our domain.

```javascript
import { DeFiSDK } from 'defi-sdk';

const nodeUrl = 'https://eth-mainnet.zerion.io/';
const defiSdk = new DeFiSDK(nodeUrl);
```

### Examples

#### Get supported protocols
```javascript
defiSdk.getProtocolNames().then(protocols => console.log(protocols));

// output:
// [
//   'Uniswap V2',           'PieDAO',
//   'Multi-Collateral Dai', 'Bancor',
//   'DeFi Money Market',    'TokenSets',
//   '0x Staking',           'Uniswap V1',
//   'Synthetix',            'PoolTogether',
//   'Dai Savings Rate',     'Chai',
//   'iearn.finance (v3)',   'iearn.finance (v2)',
//   'Idle',                 'dYdX',
//   'Curve',                'Compound',
//   'Balancer',             'Aave'
// ]
```

#### Get supported token adapters
```javascript
defiSdk.getTokenAdapterNames().then(adapters => console.log(adapters));

// output:
// [
//   'Uniswap V2 pool token',
//   'PieDAO Pie Token',
//   'SmartToken',
//   'MToken',
//   'SetToken',
//   'Uniswap V1 pool token',
//   'PoolTogether pool',
//   'Chai token',
//   'YToken',
//   'IdleToken',
//   'Curve pool token',
//   'CToken',
//   'Balancer pool token',
//   'AToken',
//   'ERC20'
// ]
```

### Get account balance locked in a protocol
```javascript
const account  = "0x42b9dF65B219B3dD36FF330A4dD8f327A6Ada990";
const protocol = "Compound";
defiSdk.getProtocolBalance(
  account,
  protocol
).then(balance => console.log(balance));

// output:
// ProtocolBalance {
//   metadata: ProtocolMetadata {
//     name: 'Compound',
//     description: 'Decentralized lending & borrowing protocol',
//     website: URL {
//       href: 'https://compound.finance/',
//       origin: 'https://compound.finance',
//       protocol: 'https:',
//       username: '',
//       password: '',
//       host: 'compound.finance',
//       hostname: 'compound.finance',
//       port: '',
//       pathname: '/',
//       search: '',
//       searchParams: URLSearchParams {},
//       hash: ''
//     },
//     logo: URL {
//       href: 'https://protocol-icons.s3.amazonaws.com/compound.png',
//       origin: 'https://protocol-icons.s3.amazonaws.com',
//       protocol: 'https:',
//       username: '',
//       password: '',
//       host: 'protocol-icons.s3.amazonaws.com',
//       hostname: 'protocol-icons.s3.amazonaws.com',
//       port: '',
//       pathname: '/compound.png',
//       search: '',
//       searchParams: URLSearchParams {},
//       hash: ''
//     },
//     version: 2n
//   },
//   balances: [
//     AdapterBalance { metadata: [AdapterMetadata], balances: [Array] },
//     AdapterBalance { metadata: [AdapterMetadata], balances: [Array] }
//   ]
// }
```
### Get derivative token underlying components
```javascript
const tokenType = 'Uniswap V2 pool token';
const tokenAddress = '0xa478c2975ab1ea89e8196811f51a7b7ade33eb11';
defiSdk.getTokenComponents(tokenType, tokenAddress).then(components => {
  console.log("Base", components.base);
  console.log("Underlying", components.underlying);
});

// output:
// Base TokenBalance {
//   balance: '1000000000000000000',
//   metadata: TokenMetadata {
//     address: '0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11',
//     decimals: 18,
//     name: 'DAI/WETH Pool',
//     symbol: 'UNI-V2'
//   }
// }
// Underlying [
//   TokenBalance {
//     balance: '14400197657513580020',
//     metadata: TokenMetadata {
//       address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
//       decimals: 18,
//       name: 'Dai Stablecoin',
//       symbol: 'DAI'
//     }
//   },
//   TokenBalance {
//     balance: '70472588741190622',
//     metadata: TokenMetadata {
//       address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
//       decimals: 18,
//       name: 'Wrapped Ether',
//       symbol: 'WETH'
//     }
//   }
// ]
```

Check out the complete API reference [here](src/protocols/interfaces.ts).

## License

defi-sdk-js is available under the MIT. See the LICENSE file for more info.

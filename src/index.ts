import Web3 from 'web3';

const web3 = new Web3();

export async function getBalance(account: string) {
  return web3.eth.getBalance(account);
}

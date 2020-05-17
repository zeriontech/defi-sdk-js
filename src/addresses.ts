import addressesList from './configs/addresses.json';
import { ContractAddresses } from './protocols/interfaces';

export function getContractAddresses(): ContractAddresses {
  return addressesList;
}

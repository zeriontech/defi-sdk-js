import type { AddressAsset } from "../../../lib/entities/AddressAsset";
import { convertNumber } from "./shared/convertNumber";

export function createViewModel(addressAsset: AddressAsset) {
  const { asset, quantity } = addressAsset;
  const price = asset.price ? asset.price.value : null;
  const commonQuantity = convertNumber(quantity, 0 - asset.decimals);
  const value = price ? price * commonQuantity : null;
  return {
    name: asset.name,
    symbol: asset.symbol,
    price: asset.price ? asset.price.value : null,
    quantity: commonQuantity,
    value: value,
  };
}

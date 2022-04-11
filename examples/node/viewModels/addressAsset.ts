import type { AddressPosition } from "../../../lib";
import { convertNumber } from "./shared/convertNumber";

export function createViewModel(addressPosition: AddressPosition) {
  const { asset, quantity } = addressPosition;
  const price = asset.price?.value ?? null;
  const commonQuantity = convertNumber(quantity || 0, 0 - asset.decimals);
  const value = price ? price * commonQuantity : null;
  return {
    name: asset.name,
    symbol: asset.symbol,
    price,
    quantity: commonQuantity,
    value: value,
  };
}

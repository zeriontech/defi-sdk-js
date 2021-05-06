import React from "react";
import type { AddressAsset as TAddressAsset } from "../../../src/entities/AddressAsset";

export function AddressAsset({
  addressAsset,
  currency,
}: {
  addressAsset: TAddressAsset;
  currency: string;
}): React.ReactElement {
  const { quantity, asset } = addressAsset;
  const commonQuantity = (
    Number(quantity) *
    10 ** (0 - asset.decimals)
  ).toFixed(2);
  const price = asset.price
    ? `${new Intl.NumberFormat("en", {
        style: "currency",
        currency,
      }).format(asset.price.value)}`
    : "—";
  return (
    <div className="stack">
      <img className="token-icon" src={asset.icon_url || ""} />
      <div>
        <div>{asset.name}</div>
        <div style={{ color: "#999" }}>
          {commonQuantity} {asset.symbol} · {price}
        </div>
      </div>
    </div>
  );
}

import React from "react";
import { ResponseData as AssetsPricesResponse } from "../../../../src/domains/assetsPrices";
import { useAssetsPrices } from "../../../../src";
import type { CachePolicy, Client, Entry } from "../../../../src";
import { EntryInfo } from "../EntryInfo";

function PriceEntry({
  entry,
}: {
  entry: Entry<AssetsPricesResponse, "prices">;
}) {
  return (
    <pre>
      {entry.data ? (
        Object.values(entry.data.prices).map(asset => (
          <div key={asset.asset_code}>
            {asset.symbol}price:{" "}
            {asset.price ? asset.price.value : <i>no price</i>}
          </div>
        ))
      ) : (
        <span>no data</span>
      )}
    </pre>
  );
}

export function Prices({
  assetCodes,
  cachePolicy = "cache-and-network",
  client,
}: {
  assetCodes: string[];
  cachePolicy?: CachePolicy;
  client?: Client;
}) {
  const entry = useAssetsPrices(
    { asset_codes: assetCodes, currency: "usd" },
    { cachePolicy, client }
  );
  return (
    <>
      <p>cachePolicy: {cachePolicy}</p>
      <EntryInfo entry={entry} render={entry => <PriceEntry entry={entry} />} />
    </>
  );
}

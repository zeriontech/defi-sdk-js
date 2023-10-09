import React, { useEffect } from "react";
import {
  useAddressPositions,
  useAssetsFullInfo,
  useAssetsPrices,
} from "../../src/react";
import { useAssetsInfo } from "../../src/react";
import { useAddressLoans } from "../../src/react";
import { EntryInfo } from "./components/EntryInfo";
import { VStack } from "./VStack";
import { TEST_ADDRESS } from "../config";
import { client, Entry } from "../../src";
import { ResponseData as AddressPositionsResponse } from "../../src/domains/addressPositions";

const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const UNI = "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984";

function ImperativeAssetsPrices({ currency }: { currency: string }) {
  useEffect(() => {
    const { unsubscribe } = client.assetsPrices(
      { currency, asset_codes: [UNI, USDC] },
      {
        onData: data => {
          // eslint-disable-next-line no-console
          console.log("data received:", data);
        },
      }
    );
    return unsubscribe;
  }, [currency]);
  return <span>client.assetsPrices()</span>;
}

export function Helpers({
  currency,
}: {
  currency: string;
}): React.ReactElement {
  return (
    <VStack gap={20}>
      <EntryInfo
        title="useAssetsPrices"
        entry={useAssetsPrices({ currency, asset_codes: [USDC, UNI] })}
        render={entry => {
          if (!entry.data) {
            return null;
          }
          const price = entry.data.prices[USDC].price?.value;
          return (
            <div>
              UDSC:{" "}
              {price != null
                ? new Intl.NumberFormat("en", {
                    style: "currency",
                    currency,
                  }).format(price)
                : null}
            </div>
          );
        }}
      />
      <EntryInfo
        title="useAssetsInfo"
        entry={useAssetsInfo({ currency, limit: 5 })}
        render={entry => {
          if (!entry.data) {
            return null;
          }
          return (
            <VStack gap={4}>
              {entry.data.info.map(assetInfo => (
                <div key={assetInfo.asset.asset_code}>
                  {assetInfo.asset.name} market cap: {assetInfo.market_cap}
                </div>
              ))}
            </VStack>
          );
        }}
      />
      <EntryInfo
        title="useAddressLoans"
        entry={useAddressLoans({ currency, address: TEST_ADDRESS })}
        render={entry => {
          if (!entry.data) {
            return null;
          }
          return (
            <VStack gap={4}>
              {entry.data.loans.map(loan => (
                <div key={loan.id}>
                  {loan.asset.name} market cap: {loan.protocol}
                </div>
              ))}
            </VStack>
          );
        }}
      />
      <EntryInfo
        title="useAssetsFullInfo [404]"
        entry={useAssetsFullInfo({ currency, asset_code: "lol" })}
        render={entry => {
          if (!entry.data) {
            return null;
          }
          const entity = entry.data["full-info"];
          if (!entity) {
            return <span>Entity not found</span>;
          }
          return <VStack gap={4}>{entity.title}</VStack>;
        }}
      />
      <EntryInfo
        title="useAssetsFullInfo"
        entry={useAssetsFullInfo({ currency, asset_code: UNI })}
        render={entry => {
          if (!entry.data) {
            return null;
          }
          const entity = entry.data["full-info"];
          if (!entity) {
            return <span>Entity not found</span>;
          }
          return <VStack gap={4}>full info: {entity.title}</VStack>;
        }}
      />
      <EntryInfo
        title="useAddressPositions"
        entry={useAddressPositions({ currency, address: TEST_ADDRESS })}
        render={(entry: Entry<AddressPositionsResponse, "positions">) => {
          if (!entry.data) {
            return null;
          }
          const { positions } = entry.data;
          if (!positions) {
            return <span>Entity not found</span>;
          }
          return positions.positions.slice(0, 5).map(addressAsset => (
            <div key={addressAsset.asset.asset_code}>
              {addressAsset.asset.name} {addressAsset.quantity}
            </div>
          ));
        }}
      />
      <ImperativeAssetsPrices currency={currency} />
    </VStack>
  );
}

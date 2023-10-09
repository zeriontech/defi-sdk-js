import React, { useEffect, useState } from "react";
import {
  PersistentCache,
  useAddressPositions,
  useAssetsPrices,
} from "../../../src";
import { Client } from "../../../src";
import { endpoint, API_TOKEN, TEST_ADDRESS } from "../../config";
import "./styles.css";

const client = new Client(null);
const cache = new PersistentCache({ max: 4 });

let didLoad = false;

/**
 * Test flow:
 * 1. Open page to load data
 * 2. Leave page
 * 3. Return to page
 * 4. Data must be loaded from cache AND a new request MUST be made over the network
 */
async function configure() {
  if (didLoad) {
    return Promise.resolve();
  }
  return cache.load().then(() => {
    didLoad = true;
    client.configure({
      url: endpoint,
      apiToken: API_TOKEN,
      cache,
      hooks: {
        willSendRequest: async request => {
          await new Promise(r => setTimeout(r, 1000));
          (request.payload as any).lol = "delayed hook";
          return request;
        },
      },
    });
  });
}

function StaleIndicator({
  isStale,
  children,
}: React.PropsWithChildren<{ isStale: boolean }>) {
  return (
    <span style={{ fontStyle: isStale ? "italic" : "normal" }}>{children}</span>
  );
}

function PositionsCount() {
  const { value, isStale } = useAddressPositions(
    { address: TEST_ADDRESS, currency: "usd" },
    { client }
  );
  if (!value) {
    return null;
  }
  return (
    <StaleIndicator isStale={isStale}>{value.positions.length}</StaleIndicator>
  );
}
function AddressPositions() {
  const { value, isStale } = useAddressPositions(
    { address: TEST_ADDRESS, currency: "usd" },
    { client }
  );
  if (!value) {
    return <h2>Loading...</h2>;
  }
  return (
    <StaleIndicator isStale={isStale}>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {value.positions.map(position => (
          <div key={position.id} style={{ display: "flex", gap: 8 }}>
            <img
              src={position.asset.icon_url || ""}
              style={{ width: 32, height: 32 }}
              alt=""
            />
            <div>{position.asset.symbol}</div>
          </div>
        ))}
      </div>
    </StaleIndicator>
  );
}

function AssetPrice({ id }: { id: string }) {
  const { value, isStale } = useAssetsPrices(
    { currency: "usd", asset_codes: [id] },
    { client }
  );
  if (!value) {
    return null;
  }
  return (
    <h2>
      <StaleIndicator isStale={isStale}>
        {value[id].symbol} Price: {value[id].price?.value}{" "}
      </StaleIndicator>
    </h2>
  );
}

function StaleLoader() {
  const [hasStale, setHasStale] = useState(false);
  useEffect(() => {
    setHasStale(cache.getState().usesStaleEntries);
    cache.on("change", () => {
      setHasStale(cache.getState().usesStaleEntries);
    });
  }, []);
  return hasStale ? (
    <span
      style={{
        display: "inline-block",
        borderRadius: "50%",
        width: 28,
        height: 28,
        border: "2px solid",
        borderRightColor: "transparent",
      }}
      className="spin"
    ></span>
  ) : null;
}

function Positions() {
  const [on, setOn] = useState(false);
  return (
    <div>
      <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
        <h1>
          Positions (<PositionsCount />)
        </h1>
        <StaleLoader></StaleLoader>
      </div>

      <AssetPrice id="eth" />
      <button onClick={() => setOn(!on)}>More asset prices</button>
      <br />
      <br />
      {on ? (
        <>
          <AssetPrice id="0x514910771af9ca656af840dff83e8264ecf986ca" />
          <AssetPrice id="0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48" />
          <AssetPrice id="0x2260fac5e5542a773aa44fbcfedf7c193bc2c599" />
        </>
      ) : null}
      <AddressPositions />
    </div>
  );
}

export function CustomCache() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    configure().then(() => setReady(true));
  }, []);

  if (!ready) {
    return null;
  }
  return (
    <div>
      <Positions />
    </div>
  );
}

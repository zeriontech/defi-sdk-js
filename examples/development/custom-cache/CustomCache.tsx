import React, { useEffect, useState } from "react";
import {
  PersistentCache,
  useAddressPositions,
  useAssetsPrices,
} from "../../../src";
import { Client } from "../../../src";
import { endpoint, API_TOKEN, TEST_ADDRESS } from "../../config";

const client = new Client(null);
const cache = new PersistentCache();

let didLoad = false;

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
    });
  });
}

function PositionsCount() {
  const { value } = useAddressPositions(
    {
      address: TEST_ADDRESS,
      currency: "usd",
    },
    {
      client,
    }
  );
  if (!value) {
    return null;
  }
  return <span>{value.positions.length}</span>;
}
function AddressPositions() {
  const { value } = useAddressPositions(
    {
      address: TEST_ADDRESS,
      currency: "usd",
    },
    {
      client,
    }
  );
  if (!value) {
    return <h2>Loading...</h2>;
  }
  return (
    <div>
      <div>
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
    </div>
  );
}

function EthPrice() {
  const { value } = useAssetsPrices(
    {
      currency: "usd",
      asset_codes: ["eth"],
    },
    { client }
  );
  if (!value) {
    return null;
  }
  return <h2>ETH Price: {value.eth.price?.value}</h2>;
}

function StaleLoader() {
  const [hasStale, setHasStale] = useState(false);
  useEffect(() => {
    setHasStale(cache.getState().usesStaleEntries);
    cache.on("change", () => {
      setHasStale(cache.getState().usesStaleEntries);
    });
  }, []);
  return <span>{hasStale ? "..." : ""}</span>;
}

function Positions() {
  return (
    <div>
      <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
        <h1>
          Positions (<PositionsCount />)
        </h1>
        <StaleLoader></StaleLoader>
      </div>

      <EthPrice />
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

import React, { useCallback, useMemo, useReducer, useState } from "react";
import ReactDOM from "react-dom";
import type { CachePolicy, Entry } from "../src";
import { client } from "../src";
import { DataStatus } from "../src/cache/DataStatus";
// import { createNamespaceFactory } from "../src/createSocketNamespace";
import { useSubscription } from "../src/react/useSubscription";
import { endpoint, API_TOKEN } from "./config";
import { Helpers } from "./Helpers";
import { VStack } from "./VStack";

client.configure({ url: endpoint, apiToken: API_TOKEN });

// const endpoint = "wss://api-staging.zerion.io";
// const namespace = createNamespaceFactory(endpoint);

const ETH = "eth";
const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const UNI = "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984";

interface Asset {
  asset_code: string;
  symbol: string;
  price: { value: number };
}

function Prices({
  assetCodes,
  cachePolicy = "cache-and-network",
}: {
  assetCodes: string[];
  cachePolicy?: CachePolicy;
}) {
  const entry = useSubscription<{ [key: string]: Asset }, "assets", "prices">({
    namespace: "assets",
    cachePolicy,
    body: useMemo(
      () => ({
        scope: ["prices"],
        payload: { asset_codes: assetCodes },
      }),
      [assetCodes]
    ),
    getId: useCallback((item: any) => item.asset_code, []),
  });
  return (
    <>
      <p>cachePolicy: {cachePolicy}</p>
      <EntryInfo entry={entry} />
    </>
  );
}

function EntryInfo({
  entry,
}: {
  entry: Entry<{ prices: { [key: string]: Asset } }>;
}) {
  if (!entry) {
    return <span>no entry</span>;
  }
  return (
    <>
      <pre>
        {Object.keys(entry)
          .filter(key => key !== "data")
          .map(key => (
            <div key={key}>
              {key}: {(entry as any)[key]}
            </div>
          ))}
        {entry.data ? (
          Object.values(entry.data.prices).map(asset => (
            <div key={asset.asset_code}>
              {asset.symbol}price: {asset.price.value}
            </div>
          ))
        ) : (
          <span>no data</span>
        )}
      </pre>
    </>
  );
}

function Market() {
  const [query, setQuery] = useState("");
  const { data, status } = useSubscription<
    { [key: string]: Asset },
    "assets",
    "info"
  >({
    namespace: "assets",
    body: useMemo(
      () => ({
        scope: ["info"],
        payload: { search_query: query, limit: 25 },
      }),
      [query]
    ),
    getId: useCallback((item: any) => item.asset.asset_code, []),
    keepStaleData: true,
  });
  return (
    <div style={{ opacity: status === DataStatus.requested ? 0.5 : 1 }}>
      <input
        type="text"
        name="query"
        placeholder="seach query"
        value={query}
        onChange={event => setQuery(event.target.value)}
      />
      {data ? data.info.length : "no data"}
    </div>
  );
}

const currencies = ["usd", "eur", "rub"];

function App() {
  const assetCodes = useMemo(() => [ETH, USDC, UNI], []);
  const [show1, toggle1] = useReducer(x => !x, false);
  const [show2, toggle2] = useReducer(x => !x, false);
  const [show3, toggle3] = useReducer(x => !x, false);
  const [show4, toggle4] = useReducer(x => !x, false);
  const [show5, toggle5] = useReducer(x => !x, false);
  const [show6, toggle6] = useReducer(x => !x, false);
  const [currency, setCurrency] = useState("usd");
  return (
    <VStack gap={20}>
      <div>
        <button onClick={toggle1}>toggle</button>
        <br />
        {show1 ? <Prices assetCodes={assetCodes} /> : null}
      </div>
      <div>
        <button onClick={toggle2}>toggle</button>
        <br />
        {show2 ? <Prices assetCodes={assetCodes} /> : null}
      </div>
      <div>
        <button onClick={toggle3}>toggle</button>
        <br />
        {show3 ? (
          <Prices assetCodes={assetCodes} cachePolicy="cache-first" />
        ) : null}
      </div>
      <div>
        <button onClick={toggle4}>toggle</button>
        <br />
        {show4 ? (
          <Prices assetCodes={assetCodes} cachePolicy="network-only" />
        ) : null}
      </div>
      <div>
        <button onClick={toggle5}>toggle</button>
        <br />
        {show5 ? (
          <Prices assetCodes={assetCodes} cachePolicy="cache-only" />
        ) : null}
      </div>
      <div>
        <button onClick={toggle6}>toggle</button>
        <br />
        {show6 ? <Market /> : null}
      </div>

      <h3>Helpers:</h3>
      <div>
        {currencies.map(c => (
          <button key={c} onClick={() => setCurrency(c)}>
            {c}
          </button>
        ))}
      </div>
      <Helpers currency={currency} />
    </VStack>
  );
}
function render() {
  ReactDOM.render(
    <div>
      <App />
    </div>,
    document.getElementById("root")
  );
}

render();

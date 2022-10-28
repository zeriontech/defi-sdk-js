import React, { useCallback, useMemo, useReducer, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  LinkProps,
} from "react-router-dom";
import ReactDOM from "react-dom";
import { CachePolicy, Entry } from "../../src";
import { client } from "../../src";
import { DataStatus } from "../../src/cache/DataStatus";
import { ResponseData as AssetsPricesResponse } from "../../src/domains/assetsPrices";
import { useAssetsFullInfo, useAssetsPrices } from "../../src/react";
import { useSubscription } from "../../src/react/useSubscription";
import { endpoint, API_TOKEN } from "../config";
import { EntryInfo } from "./EntryInfo";
import { Helpers } from "./Helpers";
import { VStack } from "./VStack";
import { CustomCache } from "./custom-cache/CustomCache";
import "./global.module.css";
import { Actions, ActionsPaginated } from "./Actions";

function getQueryForBackendEnv() {
  const params = new URLSearchParams(window.location.search);
  const value = params.get("backend_env");
  if (value) {
    return { backend_env: value };
  }
}

const query = getQueryForBackendEnv();

client.configure({
  url: endpoint,
  apiToken: API_TOKEN,
  hooks: {
    willSendRequest: request => {
      (request.payload as any).lol = "lol";
      return request;
    },
  },
  ioOptions: {
    query: { ...(query || {}), testQueryOption: "hello" },
  },
});
Object.assign(window, { client });

client.subscribe<any[], "chains", "info">({
  namespace: "chains",
  body: {
    scope: ["info"],
    payload: {},
  },
  onMessage: (_event, data) => {
    // eslint-disable-next-line no-console
    console.log("got chains", data.payload.info);
  },
});

const ETH = "eth";
const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const UNI = "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984";

interface Asset {
  asset_code: string;
  symbol: string;
  price: { value: number };
}

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

function Prices({
  assetCodes,
  cachePolicy = "cache-and-network",
}: {
  assetCodes: string[];
  cachePolicy?: CachePolicy;
}) {
  const entry = useAssetsPrices(
    { asset_codes: assetCodes, currency: "usd" },
    { cachePolicy }
  );
  return (
    <>
      <p>cachePolicy: {cachePolicy}</p>
      <EntryInfo entry={entry} render={entry => <PriceEntry entry={entry} />} />
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

function EnabledTest({ currency }: { currency: string }) {
  const [enabled, toggleEnabled] = useReducer(x => !x, false);
  return (
    <div>
      <div>enabled: {String(enabled)}</div>
      <button onClick={toggleEnabled}>toggle enabled</button>
      <EntryInfo
        entry={useAssetsFullInfo({ asset_code: USDC, currency }, { enabled })}
        render={entry => {
          const fullInfo = entry.data && entry.data["full-info"];
          return fullInfo ? <span>{fullInfo.title}</span> : null;
        }}
      />
    </div>
  );
}

function AnyMessageHandler() {
  const [enabled, toggleEnabled] = useReducer(x => !x, false);
  const [events, logEvent] = useReducer(
    (state: any, payload: any) => [...state, payload],
    []
  );
  const { data } = useAssetsPrices(
    { currency: "usd", asset_codes: [ETH, USDC, UNI] },
    {
      enabled,
      onAnyMessage: useCallback((event, data) => {
        logEvent([event, data]);
      }, []),
    }
  );
  return (
    <div>
      <h3>Any Message handler</h3>
      <button onClick={toggleEnabled}>toggle enabled</button>
      Events:{" "}
      <ul>
        {events.map(([event], index) => (
          <li key={index}>{event}</li>
        ))}
      </ul>
      data: {data ? data.prices[ETH].name : null}
    </div>
  );
}

function App() {
  const assetCodes = useMemo(() => [ETH, USDC, UNI], []);
  const [show1, toggle1] = useReducer(x => !x, false);
  const [show2, toggle2] = useReducer(x => !x, false);
  const [show3, toggle3] = useReducer(x => !x, false);
  const [show4, toggle4] = useReducer(x => !x, false);
  const [show5, toggle5] = useReducer(x => !x, false);
  const [show6, toggle6] = useReducer(x => !x, false);
  const [show7, toggle7] = useReducer(x => !x, false);
  const [show8, toggle8] = useReducer(x => !x, false);
  const [showHelpers, toggleHelpers] = useReducer(x => !x, false);
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
      <div>
        <button onClick={toggle7}>toggle</button>
        <br />
        {show7 ? <Actions /> : null}
      </div>
      <div>
        <button onClick={toggle8}>toggle</button>
        <br />
        {show8 ? <ActionsPaginated /> : null}
      </div>

      <h3>Helpers:</h3>
      <div>
        {currencies.map(c => (
          <button key={c} onClick={() => setCurrency(c)}>
            {c}
          </button>
        ))}
      </div>
      <div>
        <button onClick={toggleHelpers}>toggle helpers</button>
        {showHelpers ? <Helpers currency={currency} /> : null}
      </div>
      <EnabledTest currency={currency} />
      <AnyMessageHandler />
    </VStack>
  );
}

function NavLink(props: LinkProps) {
  // too lazy to write css
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      style={{
        display: "block",
        textDecoration: "none",
        color: "#44444e",
        padding: 16,
        backgroundColor: hovered ? "#e6e7e9" : "transparent",
      }}
      {...props}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    />
  );
}

function render() {
  ReactDOM.render(
    <BrowserRouter>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "20% auto",
          gridGap: 20,
        }}
      >
        <div style={{ backgroundColor: "#f5f5f7", paddingTop: 16 }}>
          <NavLink to="/">Main</NavLink>
          <NavLink to="/custom-cache">CustomCache</NavLink>
        </div>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/custom-cache" element={<CustomCache />} />
        </Routes>
      </div>
    </BrowserRouter>,
    document.getElementById("root")
  );
}

render();

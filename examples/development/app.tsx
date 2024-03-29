import React, { useCallback, useMemo, useReducer, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Link,
  LinkProps,
} from "react-router-dom";
import { createRoot } from "react-dom/client";
import { AssetInfo, client } from "../../src";
import { DataStatus } from "../../src/cache/DataStatus";
import {
  useAddressPositions,
  useAssetsFullInfo,
  useAssetsPrices,
} from "../../src/react";
import { useSubscription } from "../../src/react/useSubscription";
import { endpoint, API_TOKEN } from "../config";
import { EntryInfo } from "./components/EntryInfo";
import { Helpers } from "./Helpers";
import { VStack } from "./VStack";
import { CustomCache } from "./custom-cache/CustomCache";
import "./global.module.css";
import { Actions, ActionsPaginated } from "./Actions";
import { NFTCollections, NFTCollectionsPaginated } from "./NFTCollections";
import { Prices } from "./components/Prices";
import { RequestHooksTest } from "./RequestHooksTest";
import { ETH, UNI, USDC } from "./constants";

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

function Market() {
  const [query, setQuery] = useState("");
  const { data, status } = useSubscription<AssetInfo[], "assets", "info">({
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

function ErrorView() {
  // USDC is not a valid wallet address
  // backend should return validation error for this request
  const entry = useAddressPositions({ address: USDC, currency: "usd" });
  return (
    <div>
      <EntryInfo
        entry={entry}
        render={entry => <div>{JSON.stringify(entry.error)}</div>}
      />
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
  const [show9, toggle9] = useReducer(x => !x, false);
  const [show10, toggle10] = useReducer(x => !x, false);
  const [show11, toggle11] = useReducer(x => !x, false);
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
        <button onClick={toggle6}>toggle Market</button>
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
      <div>
        <button onClick={toggle9}>toggle</button>
        <br />
        {show9 ? <NFTCollections /> : null}
      </div>
      <div>
        <button onClick={toggle10}>toggle</button>
        <br />
        {show10 ? <NFTCollectionsPaginated /> : null}
      </div>
      <div>
        <button onClick={toggle11}>toggle error</button>
        <br />
        {show11 ? <ErrorView /> : null}
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

function Root() {
  return (
    <BrowserRouter>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "20% auto",
          gridGap: 20,
        }}
      >
        <div
          style={{
            backgroundColor: "#f5f5f7",
            paddingTop: 16,
            height: "100vh",
            boxSizing: "border-box",
          }}
        >
          <NavLink to="/">Main</NavLink>
          <NavLink to="/custom-cache">CustomCache</NavLink>
          <NavLink to="/request-hooks">Request Hooks</NavLink>
        </div>
        <main>
          <Routes>
            <Route path="/" element={<App />} />
            <Route path="/custom-cache" element={<CustomCache />} />
            <Route path="/request-hooks" element={<RequestHooksTest />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

function render() {
  createRoot(document.getElementById("root")).render(
    <React.StrictMode>
      <Root />
    </React.StrictMode>
  );
}

render();

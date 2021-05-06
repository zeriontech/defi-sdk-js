import React, { useMemo, useState } from "react";
import ReactDOM from "react-dom";
import { client, DataStatus, useAddressAssets } from "defi-sdk";
import { endpoint, API_TOKEN, TEST_ADDRESS } from "../config";
import { AddressAsset } from "./components/AddressAsset";

client.configure({ url: endpoint, apiToken: API_TOKEN });

function AddressAssets({
  address,
  currency,
}: {
  address: string;
  currency: string;
}) {
  const { data, status } = useAddressAssets({
    payload: useMemo(() => ({ address, currency }), [address, currency]),
  });
  if (status === DataStatus.requested) {
    return <span>Loading...</span>;
  }
  if (!data) {
    return <span>No data</span>;
  }
  return (
    <>
      {Object.values(data.assets).map(addressAsset => (
        <AddressAsset
          key={addressAsset.asset.asset_code}
          addressAsset={addressAsset}
          currency={currency}
        />
      ))}
    </>
  );
}

function App() {
  const [currency, setCurrency] = useState("usd");
  return (
    <>
      <h4>Assets for {TEST_ADDRESS}</h4>
      <p>
        <button onClick={() => setCurrency("usd")}>$</button>
        <button onClick={() => setCurrency("eur")}>€</button>
        <button onClick={() => setCurrency("btc")}>BTC</button>
      </p>
      <AddressAssets address={TEST_ADDRESS} currency={currency} />
    </>
  );
}

ReactDOM.render(<App />, document.getElementById("root"));

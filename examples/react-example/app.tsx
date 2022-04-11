import React, { useState } from "react";
import ReactDOM from "react-dom";
import { client, DataStatus, useAddressPositions } from "defi-sdk";
import { endpoint, API_TOKEN, TEST_ADDRESS } from "../config";
import { AddressPosition } from "./components/AddressPosition";

client.configure({ url: endpoint, apiToken: API_TOKEN });

function AddressAssets({
  address,
  currency,
}: {
  address: string;
  currency: string;
}) {
  const { data, status, value } = useAddressPositions({
    address,
    currency,
  });
  if (status === DataStatus.requested) {
    return <span>Loading...</span>;
  }
  if (!data) {
    return <span>No data</span>;
  }
  return (
    <>
      {value.positions.map(addressPosition => (
        <AddressPosition
          key={addressPosition.id}
          addressPosition={addressPosition}
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

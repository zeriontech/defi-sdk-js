import React, { useEffect, useState } from "react";
import { Client } from "../../../src";
import { API_TOKEN, endpoint } from "../../config";
import { Prices } from "../components/Prices";
import { ETH, UNI, USDC } from "../constants";

const client = new Client(null);

client.configure({
  url: endpoint,
  apiToken: API_TOKEN,
  hooks: {
    willSendRequest: async request => {
      await new Promise(r => setTimeout(r, 5000));
      (request.payload as any).lol = "lol delayed";
      return request;
    },
  },
});

const assetCodes = [ETH, USDC, UNI];

function useRenderDelay({ delay }: { delay: number }) {
  const [render, setRender] = useState(false);
  useEffect(() => {
    const timerId = setTimeout(() => setRender(true), delay);
    return () => {
      clearTimeout(timerId);
    };
  }, [delay]);
  return render;
}

export function RequestHooksTest() {
  const showLater = useRenderDelay({ delay: 2500 });
  return (
    <div>
      <p>Only one network request should occur</p>
      <Prices assetCodes={assetCodes} client={client} />
      <Prices assetCodes={assetCodes} client={client} />
      {showLater ? <Prices assetCodes={assetCodes} client={client} /> : null}
    </div>
  );
}

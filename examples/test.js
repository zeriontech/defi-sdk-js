/* eslint-env node */
/* eslint-disable @typescript-eslint/no-var-requires */
const { client } = require("../lib/defi-sdk.js");

client.configure({
  url: "wss://api-v4.zerion.io/",
  apiToken: "Zerion.0JOY6zZTTw6yl5Cvz9sdmXc7d5AhzVMG",
});
client.addressAssets({
  payload: {
    address: "0x505e20c0Fb8252Ca7aC21d54D5432eccD4f2D076",
    currency: "usd",
  },
  onData: data => {
    console.log(data); // eslint-disable-line no-console
  },
});

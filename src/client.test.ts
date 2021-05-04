import { Client } from "./client";

const endpoint = "wss://api-staging.zerion.io";
const API_TOKEN = "Zerion.0JOY6zZTTw6yl5Cvz9sdmXc7d5AhzVMG";

describe("Client", () => {
  test("instantiates", () => {
    const client = new Client(null);
    expect(client).toBeTruthy();
  });

  test("makes successful request", done => {
    const client = new Client({ url: endpoint, apiToken: API_TOKEN });
    client.subscribe({
      namespace: "assets",
      body: {
        scope: ["prices"],
        payload: { asset_codes: ["eth"] },
      },
      onMessage: (event, data) => {
        expect(event).toEqual("received");
        expect(data).toBeTruthy();
        expect(data.payload.prices).toBeTruthy();
        done();
      },
    });
    // expect(client).toBeTruthy();
  });
});

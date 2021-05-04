import { Client } from "./client";
import { endpoint, API_TOKEN } from "../examples/config";

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

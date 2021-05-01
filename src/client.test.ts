import { Client } from "./client";
import { createSocketNamespace } from "./createSocketNamespace";

describe("Client", () => {
  test("instantiates", () => {
    const client = new Client("ws");
    expect(client).toBeTruthy();
  });

  test("makes successful request", done => {
    const client = new Client("ws");
    client.subscribe({
      socketNamespace: createSocketNamespace("assets"),
      method: "get",
      body: {
        scope: ["prices"],
        payload: { asset_codes: ["eth"] },
      },
      onUpdate: f => {
        const data = f(null);
        expect(data).toBeTruthy();
        done();
      },
    });
    // expect(client).toBeTruthy();
  });
});

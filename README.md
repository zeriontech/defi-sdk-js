# defi-sdk

<div>
  <a href="https://www.npmjs.com/package/defi-sdk">
    <img src="https://img.shields.io/npm/v/defi-sdk" alt="Download on NPM">
  </a>
  <br>
</div>

A JS client for interacting with [Zerion API](https://github.com/zeriontech/zerion-api)

## Install

```sh
npm install defi-sdk
```

## Getting Started

```js
import { client } from "defi-sdk";

client.configure({ url: endpoint, apiToken: API_TOKEN });
```

## API

### General usage

### client.subscribe(options)

```js
import { client } from "defi-sdk";

client.subscribe({
  namespace: "assets",
  body: {
    scope: ["prices"],
    payload: { asset_codes: ["eth"], currency: "usd" }
  },
  onMessage: (event: Event, data: Response) => {
    /* handle data */
  }
});
```

- `namespace`: a [`Namespace`](https://docs.zerion.io/websockets/namespaces) string
- `event`: one of `received | changed | appended | removed`, see [Zerion Docs](https://docs.zerion.io/websockets/websocket-api-overview)
- `body`: a [`Request`](#Request) object
- `data`: a [`Response`](#Response) object

## Domain Helpers

Instead of calling `client.subscribe` and passing type information manually, the SDK provides helpers for most of the existing request [scopes](https://docs.zerion.io/websockets/websocket-api-overview#request)

### `addressAssets`

```js
import { client } from "defi-sdk";

client.addressAssets({
  payload: { asset_codes: ["eth"], currency: "usd" },
  onData: data => {
    /* handle data */
  }
});
```

## Types

### Request

```ts
interface Request<T, ScopeName extends string> {
  scope: ScopeName[];
  payload: T;
}
```

### Response

```ts
interface Response<T> {
  meta: any;
  payload: T;
}
```

See `Response` in [Zerion Docs](https://docs.zerion.io/websockets/websocket-api-overview#response)

## License

MIT License, see the included [LICENSE](LICENSE) file.

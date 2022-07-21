import type io from "socket.io-client";
import type { Response } from "./requests/Response";
import type { Request } from "./requests/Request";
import type { ResponsePayload } from "./requests/ResponsePayload";
import type { Unsubscribe } from "./shared/Unsubscribe";
import { verify } from "./requests/verify";
import type { SocketNamespace } from "./shared/SocketNamespace";
import { EntryStore } from "./cache/Entry";
import type { Entry } from "./cache/Entry";
import { CachePolicy } from "./cache/CachePolicy";
import { isRequestNeeded } from "./cache/isRequestNeeded";
import { SubscriptionEvent } from "./requests/SubscriptionEvent";
import { mergeDict, MergeStrategy } from "./shared/mergeStrategies";
import { verifyByRequestId } from "./requests/verifyByRequestId";
import { shouldReturnCachedData } from "./cache/shouldReturnCachedData";
import { defaultCachePolicy } from "./cache/defaultCachePolicy";
import { RequestCache } from "./cache/RequestCache";
import { DataStatus } from "./cache/DataStatus";
import { createSocketNamespace } from "./socket/createSocketNamespace";
import { assetsPrices } from "./domains/assetsPrices";
import { assetsInfo } from "./domains/assetsInfo";
import { addressLoans } from "./domains/addressLoans";
import { addressAssets } from "./domains/addressAssets";
import { addressPositions } from "./domains/addressPositions";
import { addressCharts } from "./domains/addressCharts";
import { assetsCharts } from "./domains/assetsCharts";
import { assetsFullInfo } from "./domains/assetsFullInfo";
import { addressPortfolio } from "./domains/addressPortfolio";
import { PersistentCache } from "./cache/PersistentCache";

const subsciptionEvents: SubscriptionEvent[] = [
  "received",
  "appended",
  "changed",
  "removed",
];

export type Result<T, ScopeName extends string> = Entry<T, ScopeName>;

export interface BaseOptions<
  Namespace extends string = any,
  ScopeName extends string = any,
  RequestPayload = any
> {
  socketNamespace: SocketNamespace<Namespace>;
  method?: "subscribe" | "get";
  body: Request<RequestPayload, ScopeName>;
}

type MessageHandler<T, ScopeName extends string> = (
  event: SubscriptionEvent,
  data: Response<ResponsePayload<T, ScopeName>>
) => void;

export interface Options<
  T,
  Namespace extends string = any,
  ScopeName extends string = any,
  RequestPayload = any
> extends BaseOptions<Namespace, ScopeName, RequestPayload> {
  onMessage: MessageHandler<T, ScopeName>;
  onAnyMessage?: MessageHandler<T, ScopeName>;
}

export type NamespaceOptions<Namespace extends string> =
  | {
      socketNamespace: SocketNamespace<Namespace>;
    }
  | { namespace: Namespace };

type ConvenienceOptions<
  Namespace extends string,
  ScopeName extends string,
  RequestPayload = any
> = Omit<BaseOptions<Namespace, ScopeName, RequestPayload>, "socketNamespace"> &
  NamespaceOptions<Namespace>;

export type ClientSubscribeOptions<
  T,
  Namespace extends string,
  ScopeName extends string,
  RequestPayload = any
> = ConvenienceOptions<Namespace, ScopeName, RequestPayload> & {
  onMessage: (
    event: SubscriptionEvent,
    data: Response<ResponsePayload<T, ScopeName>>
  ) => void;
};

export type ConvenienceOptionsCached<
  Namespace extends string,
  ScopeName extends string,
  RequestPayload = any
> = ConvenienceOptions<Namespace, ScopeName, RequestPayload> & {
  cachePolicy?: CachePolicy;
  mergeStrategy?: MergeStrategy;
  getId?: (x: any) => string | number;
  onAnyMessage?: MessageHandler<any, ScopeName>;
  verifyFn?: typeof verify;
};

export type CachedRequestOptions<
  T,
  Namespace extends string,
  ScopeName extends string,
  RequestPayload = any
> = ConvenienceOptionsCached<Namespace, ScopeName, RequestPayload> & {
  onData: (data: Result<T, ScopeName>) => void;
};

export function subscribe<
  R,
  Namespace extends string = any,
  ScopeName extends string = any
>({
  socketNamespace,
  method = "subscribe",
  body,
  onMessage,
  onAnyMessage,
  verifyFn = verify,
}: Options<R, Namespace, ScopeName> & {
  verifyFn?: typeof verify;
}): Unsubscribe {
  const { socket, namespace } = socketNamespace;
  if (!body.scope.length) {
    throw new Error("Invalid scope argument: scope cannot be empty");
  }
  const model = body.scope[0];
  const handleMessage = (event: SubscriptionEvent) => (
    response: Response<ResponsePayload<R, ScopeName>>
  ) => {
    if (verifyFn(body, response)) {
      onMessage(event, response);
    }
    if (onAnyMessage) {
      onAnyMessage(event, response);
    }
  };

  const listeners: Array<() => void> = [];

  subsciptionEvents.forEach(event => {
    const handler = handleMessage(event);
    socket.on(`${event} ${namespace} ${model}`, handler);
    listeners.push(() => socket.off(`${event} ${namespace} ${model}`, handler));
  });

  socket.emit(method, body);

  return () => {
    listeners.forEach(l => l());

    if (method === "subscribe") {
      socket.emit("unsubscribe", body);
    }
  };
}

function createKey<T, S extends string, N extends string>(
  request: Pick<Options<T, S, N>, "socketNamespace" | "body">
) {
  return JSON.stringify({
    namespace: request.socketNamespace.namespace,
    body: request.body,
  });
}

let reqId = 0;

const getRequetsId = () => ++reqId;

const memoCache: { [key: string]: number } = {};

const keyToRequestId = (key: string) => {
  if (!memoCache[key]) {
    memoCache[key] = getRequetsId();
  }
  return memoCache[key];
};

function normalizeOptions<T, Namespace extends string>(
  options: T & NamespaceOptions<Namespace>,
  namespaceFactory: (namespace: Namespace) => SocketNamespace<Namespace>
): T & { socketNamespace: SocketNamespace<Namespace> } {
  if ("socketNamespace" in options) {
    return options;
  } else if ("namespace" in options) {
    const { namespace } = options;
    return {
      ...options,
      socketNamespace: namespaceFactory(namespace),
    };
  }
  throw new Error("Either socketNamespace or namespace must be provided");
}

export interface Hooks {
  willSendRequest: <RequestPayload, ScopeName extends string>(
    request: Request<RequestPayload, ScopeName>,
    { namespace }: { namespace: string }
  ) => Request<RequestPayload, ScopeName>;
}

type IOOptions = Parameters<typeof io>[0];

interface ConstructorConfig {
  url: string;
  apiToken: string;
  ioOptions?: IOOptions;
  hooks?: Partial<Hooks>;
  cache?: RequestCache<EntryStore>;
  getCacheKey?: (params: { key: string; requestId: number }) => string | number;
}

const identity = <T>(x: T) => x;

const defaultHooks: Hooks = {
  willSendRequest: identity,
};

function getOrCreateEntry(
  cache: RequestCache<EntryStore>,
  key: string | number,
  cachePolicy: CachePolicy,
  status?: Entry<any, any>["status"]
) {
  if (!cache.get(key, cachePolicy)) {
    cache.set(key, EntryStore.fromStatus(status));
  }
  const entry = cache.get(key, cachePolicy);
  if (entry) {
    return entry;
  }
  throw new Error("Unexpected internal error: newly created entry not found");
}

export class BareClient {
  url: string | null;
  apiToken: string | null;
  ioOptions: IOOptions;
  cache: RequestCache<EntryStore>;
  hooks: Hooks;
  private customGetCacheKey?: ConstructorConfig["getCacheKey"];

  constructor(config: null | ConstructorConfig) {
    this.url = config ? config.url : null;
    this.apiToken = config ? config.apiToken : null;
    this.ioOptions = config?.ioOptions;
    this.cache = config?.cache || new RequestCache();
    this.customGetCacheKey = config?.getCacheKey;
    this.hooks = this.configureHooks(config);
    this.namespaceFactory = this.namespaceFactory.bind(this);
  }

  private configureHooks(config: ConstructorConfig | null) {
    return config
      ? Object.assign({}, defaultHooks, config.hooks)
      : defaultHooks;
  }

  namespaceFactory<Namespace extends string>(
    namespace: Namespace
  ): SocketNamespace<Namespace> {
    if (!this.url || !this.apiToken) {
      throw new Error(
        "Client must be configured with a url and a token. Call client.configure({ url, apiToken }) before calling this method"
      );
    }
    return createSocketNamespace(
      this.url,
      this.apiToken,
      namespace,
      this.ioOptions
    );
  }

  configure(config: ConstructorConfig): this {
    const { url, apiToken, ioOptions } = config;
    this.url = url;
    this.apiToken = apiToken;
    this.ioOptions = ioOptions;
    this.hooks = this.configureHooks(config);
    this.cache = config.cache || this.cache;
    this.customGetCacheKey = config.getCacheKey;
    return this;
  }

  subscribe<
    T,
    Namespace extends string = any,
    ScopeName extends string = any,
    RequestPayload = any
  >(
    rawOptions: ClientSubscribeOptions<T, Namespace, ScopeName, RequestPayload>
  ): ReturnType<typeof subscribe> {
    const options = normalizeOptions(rawOptions, this.namespaceFactory);
    const { namespace } = options.socketNamespace;
    this.hooks.willSendRequest(options.body, { namespace });
    return subscribe(options);
  }

  getFromCache<
    T,
    Namespace extends string,
    ScopeName extends string,
    RequestPayload = any
  >(
    rawOptions: ConvenienceOptionsCached<Namespace, ScopeName, RequestPayload>
  ): Result<T, ScopeName> | null {
    // rawOptions.onData
    if (!shouldReturnCachedData(rawOptions.cachePolicy || defaultCachePolicy)) {
      return null;
    }
    const options = normalizeOptions(rawOptions, this.namespaceFactory);
    const key = createKey(options);
    // const requestId = requestToRequestId(options);
    const requestId = keyToRequestId(key);
    const cacheKey = this.getCacheKey(key, requestId);
    // let cacheKey: string | number;
    const entryStore = this.cache.get(
      cacheKey,
      options.cachePolicy || defaultCachePolicy
    );
    return entryStore ? entryStore.getState() : null;
  }

  getCacheKey(key: string, requestId: number): string | number {
    if (this.customGetCacheKey) {
      return this.customGetCacheKey({ key, requestId });
    }
    if (this.cache instanceof PersistentCache) {
      return key;
    } else {
      return requestId;
    }
  }

  cachedSubscribe<
    T,
    Namespace extends string = any,
    ScopeName extends string = any
  >({
    cachePolicy = defaultCachePolicy,
    onData,
    // mergingFunction,
    getId,
    mergeStrategy = mergeDict,
    verifyFn = verifyByRequestId,
    ...convenienceOptions
  }: CachedRequestOptions<T, Namespace, ScopeName>): {
    entryStore: EntryStore<T>;
    unsubscribe: Unsubscribe;
  } {
    const options = normalizeOptions(convenienceOptions, this.namespaceFactory);
    const key = createKey(options);
    // const requestId = requestToRequestId(options);
    const requestId = keyToRequestId(key);
    const cacheKey = this.getCacheKey(key, requestId);

    const { namespace } = options.socketNamespace;

    // NOTE: don't mutate body to create consistent cache key
    const body = this.hooks.willSendRequest(
      {
        ...options.body,
        payload: { ...options.body.payload, request_id: requestId },
      },
      { namespace }
    );

    const maybeEntryStore = this.cache.get(cacheKey, cachePolicy);

    const shouldMakeRequest = isRequestNeeded(
      cachePolicy,
      maybeEntryStore ? maybeEntryStore.getState() : null
    );
    const entryStore = getOrCreateEntry(
      this.cache,
      cacheKey,
      cachePolicy,
      shouldMakeRequest ? DataStatus.requested : undefined
    );
    const entryState = entryStore.getState();

    const unlisten = entryStore.addClientListener(onData);

    if (shouldMakeRequest) {
      const unsubscribe = subscribe({
        ...options,
        body,
        verifyFn,
        onMessage: (event, data) => {
          const { payload, meta } = data;
          const scope = options.body.scope.find(s => s in payload);
          if (!scope) {
            return;
          }
          const entryState = entryStore.getState();
          const merged = mergeStrategy({
            event,
            prevData: entryState.data
              ? entryState.data[scope]
              : entryState.data,
            newData: payload[scope] as any,
            getId,
          });
          entryStore.setData(scope, merged, meta);
        },
      });
      entryStore.makeSubscription({ unsubscribe });
    }

    if (shouldReturnCachedData(cachePolicy)) {
      onData(entryState);
    }
    return {
      entryStore,
      unsubscribe: () => unlisten(),
    };
  }
}

export class Client extends BareClient {
  addressAssets = addressAssets;
  addressLoans = addressLoans;
  addressPositions = addressPositions;
  addressPortfolio = addressPortfolio;
  addressCharts = addressCharts;
  assetsCharts = assetsCharts;
  assetsPrices = assetsPrices;
  assetsFullInfo = assetsFullInfo;
  assetsInfo = assetsInfo;
}

export const client = new Client(null);

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

const requestToRequestId = (
  request: Pick<Options<any, any, any>, "socketNamespace" | "body">
) => {
  const key = createKey(request);
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

interface ConstructorConfig {
  url: string;
  apiToken: string;
  hooks?: Partial<Hooks>;
}

const identity = <T>(x: T) => x;

const defaultHooks: Hooks = {
  willSendRequest: identity,
};

export class BareClient {
  url: string | null;
  apiToken: string | null;
  cache: RequestCache;
  hooks: Hooks;

  constructor(config: null | ConstructorConfig) {
    this.url = config ? config.url : null;
    this.apiToken = config ? config.apiToken : null;
    this.cache = new RequestCache();
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
    return createSocketNamespace(this.url, this.apiToken, namespace);
  }

  configure(config: ConstructorConfig): this {
    const { url, apiToken } = config;
    this.url = url;
    this.apiToken = apiToken;
    this.hooks = this.configureHooks(config);
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
    const requestId = requestToRequestId(options);
    const entryStore = this.cache.get(requestId);
    return entryStore ? entryStore.getState() : null;
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
    // const key = createKey(options);
    const options = normalizeOptions(convenienceOptions, this.namespaceFactory);
    const requestId = requestToRequestId(options);

    const { socketNamespace } = options;
    const { namespace } = socketNamespace;
    const body = this.hooks.willSendRequest(
      {
        ...options.body,
        payload: { ...options.body.payload, request_id: requestId },
      },
      { namespace }
    );

    const maybeEntryStore = this.cache.get(requestId);

    const shouldMakeRequest = isRequestNeeded(
      cachePolicy,
      maybeEntryStore ? maybeEntryStore.getState() : null
    );
    const entryStore = this.cache.getOrCreateEntry(
      requestId,
      shouldMakeRequest ? { status: DataStatus.requested } : undefined
    );
    const entryState = entryStore.getState();

    entryStore.addListener(onData);

    if (shouldMakeRequest) {
      const unsubscribe = subscribe({
        ...options,
        body,
        verifyFn,
        onMessage: (event, data) => {
          const { payload } = data;
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
          entryStore.setData(scope, merged);
        },
      });
      entryStore.makeSubscription({ unsubscribe });
    }

    if (shouldReturnCachedData(cachePolicy)) {
      onData(entryState);
    }
    return {
      entryStore,
      unsubscribe: () => entryStore.removeListener(onData),
    };
  }
}

export class Client extends BareClient {
  addressAssets = addressAssets;
  addressLoans = addressLoans;
  addressPositions = addressPositions;
  addressCharts = addressCharts;
  assetsCharts = assetsCharts;
  assetsPrices = assetsPrices;
  assetsFullInfo = assetsFullInfo;
  assetsInfo = assetsInfo;
}

export const client = new Client(null);

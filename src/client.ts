import type io from "socket.io-client";
import { nanoid } from "nanoid";
import type { Response } from "./requests/Response";
import type { Request } from "./requests/Request";
import type { ResponsePayload } from "./requests/ResponsePayload";
import type { Unsubscribe } from "./shared/Unsubscribe";
import { verify } from "./requests/verify";
import type { SocketNamespace } from "./shared/SocketNamespace";
import { EntryStore, isIdleStatus } from "./cache/Entry";
import type { Entry } from "./cache/Entry";
import { CachePolicy } from "./cache/CachePolicy";
import { isRequestNeeded } from "./cache/isRequestNeeded";
import { SubscriptionEvent } from "./requests/SubscriptionEvent";
import { mergeDict, mergeList, MergeStrategy } from "./shared/mergeStrategies";
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
import { addressPortfolioDecomposition } from "./domains/addressPortfolioDecomposition";
import { PersistentCache } from "./cache/PersistentCache";

const subsciptionEvents: SubscriptionEvent[] = [
  "received",
  "appended",
  "changed",
  "removed",
  "done",
];

export type Result<T, ScopeName extends string> = Entry<T, ScopeName>;

export type PaginatedCacheMode = "full" | "first-page";

export interface BaseOptions<
  Namespace extends string = any,
  ScopeName extends string = any,
  RequestPayload = any
> {
  socketNamespace: SocketNamespace<Namespace>;
  method?: "subscribe" | "get" | "stream";
  body: Request<RequestPayload, ScopeName>;
  verifyFn?: typeof verify;
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

type SocketNamespaceOptions<Namespace extends string> = {
  socketNamespace: SocketNamespace<Namespace>;
};

export type NamespaceOptions<Namespace extends string> =
  | SocketNamespaceOptions<Namespace>
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

type CachedOptions<ScopeName extends string> = {
  cachePolicy?: CachePolicy;
  mergeStrategy?: MergeStrategy;
  getId?: (x: any) => string | number;
  onAnyMessage?: MessageHandler<any, ScopeName>;
};

export type ConvenienceOptionsCached<
  Namespace extends string,
  ScopeName extends string,
  RequestPayload = any
> = ConvenienceOptions<Namespace, ScopeName, RequestPayload> &
  CachedOptions<ScopeName>;

export type PaginatedOptionsCached<
  Namespace extends string,
  ScopeName extends string,
  RequestPayload = any
> = ConvenienceOptionsCached<Namespace, ScopeName, RequestPayload> & {
  method?: "get" | "stream";
  cursorKey: string;
  limitKey: string;
  limit: number;
};

export type CachedRequestOptions<
  T,
  Namespace extends string,
  ScopeName extends string,
  RequestPayload = any
> = ConvenienceOptionsCached<Namespace, ScopeName, RequestPayload> & {
  onData: (data: Result<T, ScopeName>) => void;
};

export type CachedPaginatedRequestOptions<
  T,
  Namespace extends string,
  ScopeName extends string,
  RequestPayload = any
> = PaginatedOptionsCached<Namespace, ScopeName, RequestPayload> & {
  onData: (data: Result<T[], ScopeName>) => void;
  paginatedCacheMode?: PaginatedCacheMode;
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
}: Options<R, Namespace, ScopeName>): Unsubscribe {
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
  request: Pick<Options<T, S, N>, "socketNamespace" | "body"> & {
    cursorKey?: string;
  }
) {
  return JSON.stringify({
    namespace: request.socketNamespace.namespace,
    body: request.body,
    paginated: Boolean(request.cursorKey),
  });
}

const getRequetsId = () => nanoid();

function normalizeOptions<T, Namespace extends string>(
  options: T & NamespaceOptions<Namespace>,
  namespaceFactory: (namespace: Namespace) => SocketNamespace<Namespace>
): T & SocketNamespaceOptions<Namespace> {
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
  >({
    verifyFn = verifyByRequestId,
    ...rawOptions
  }: ClientSubscribeOptions<
    T,
    Namespace,
    ScopeName,
    RequestPayload
  >): ReturnType<typeof subscribe> {
    const options = normalizeOptions(rawOptions, this.namespaceFactory);
    const { namespace } = options.socketNamespace;
    this.hooks.willSendRequest(options.body, { namespace });
    const requestId = getRequetsId();
    return subscribe({
      ...options,
      verifyFn,
      body: {
        ...options.body,
        payload: { ...options.body.payload, request_id: requestId },
      },
    });
  }

  getCacheStore<
    T,
    Namespace extends string,
    ScopeName extends string,
    RequestPayload = any
  >(
    rawOptions:
      | ConvenienceOptionsCached<Namespace, ScopeName, RequestPayload>
      | PaginatedOptionsCached<Namespace, ScopeName, RequestPayload>
  ): EntryStore<T, ScopeName> | null {
    if (!shouldReturnCachedData(rawOptions.cachePolicy || defaultCachePolicy)) {
      return null;
    }
    const options = normalizeOptions(rawOptions, this.namespaceFactory);
    const cacheKey = createKey(options);

    const entryStore = this.cache.get(
      cacheKey,
      options.cachePolicy || defaultCachePolicy
    );
    return entryStore;
  }

  getFromCache<
    T,
    Namespace extends string,
    ScopeName extends string,
    RequestPayload = any
  >(
    rawOptions: ConvenienceOptionsCached<Namespace, ScopeName, RequestPayload>
  ): Result<T, ScopeName> | null {
    const entryStore = this.getCacheStore<
      T,
      Namespace,
      ScopeName,
      RequestPayload
    >(rawOptions);
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

  slicePaginatedCache<
    T,
    Namespace extends string,
    ScopeName extends string,
    RequestPayload = any
  >({
    cursorKey,
    ...rawOptions
  }: PaginatedOptionsCached<Namespace, ScopeName, RequestPayload>): void {
    const paginatedEntryStore = this.getCacheStore<
      T[],
      Namespace,
      ScopeName,
      RequestPayload
    >({ cursorKey, ...rawOptions });

    const firstPageEntryState = this.getFromCache<
      T[],
      Namespace,
      ScopeName,
      RequestPayload
    >({
      ...rawOptions,
      body: {
        ...rawOptions.body,
        payload: {
          ...rawOptions.body.payload,
          [cursorKey]: undefined,
          [rawOptions.limitKey]: rawOptions.limit,
        },
      },
    });

    const scopeName = rawOptions.body.scope.find(
      s => s in (firstPageEntryState?.data || {})
    );

    if (firstPageEntryState && paginatedEntryStore && scopeName)
      paginatedEntryStore.setData({
        scopeName,
        ...firstPageEntryState,
        hasNext: (firstPageEntryState.value?.length || 0) >= rawOptions.limit,
      });
  }

  cachedSubscribe<
    T,
    Namespace extends string = any,
    ScopeName extends string = any
  >({
    cachePolicy = defaultCachePolicy,
    onData,
    getId,
    mergeStrategy = mergeDict,
    verifyFn = verifyByRequestId,
    ...convenienceOptions
  }: CachedRequestOptions<T, Namespace, ScopeName>): {
    entryStore: EntryStore<T>;
    unsubscribe: Unsubscribe;
  } {
    const options = normalizeOptions(convenienceOptions, this.namespaceFactory);
    const cacheKey = createKey(options);

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
      const { namespace } = options.socketNamespace;
      const requestId = getRequetsId();

      // NOTE: don't mutate body to create consistent cache key
      const body = this.hooks.willSendRequest(
        {
          ...options.body,
          payload: { ...options.body.payload, request_id: requestId },
        },
        { namespace }
      );

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
          if (options.method === "stream" && event === "done") {
            entryStore.setData({
              scopeName: scope,
              value: entryState.value,
              meta: {
                ...meta,
                next_cursor: entryState.meta?.next_cursor,
              },
              status: DataStatus.ok,
              isDone: true,
            });
            return;
          }
          const merged = mergeStrategy({
            event,
            prevData: entryState.data
              ? entryState.data[scope]
              : entryState.data,
            newData: payload[scope] as any,
            getId,
          });
          const status =
            options.method === "stream"
              ? isIdleStatus(entryState.status)
                ? DataStatus.updating
                : entryState.status
              : DataStatus.ok;
          entryStore.setData({
            scopeName: scope,
            value: merged,
            meta,
            status,
            isDone: options.method !== "stream",
          });
          if (
            (event === "done" && options.method === "stream") ||
            options.method === "get"
          ) {
            unsubscribe?.();
          }
        },
      });
      entryStore.makeSubscription({ unsubscribe });
    }

    if (shouldReturnCachedData(cachePolicy)) {
      onData(entryState);
    }

    return {
      entryStore,
      unsubscribe: () => {
        unlisten();
      },
    };
  }

  cachedPaginatedRequest<
    T,
    Namespace extends string = any,
    ScopeName extends string = any
  >({
    cachePolicy = defaultCachePolicy,
    mergeStrategy = mergeList,
    onData,
    cursorKey,
    paginatedCacheMode = "first-page",
    method = "get",
    ...convenienceOptions
  }: CachedPaginatedRequestOptions<T, Namespace, ScopeName>): {
    entryStore: EntryStore<T[]>;
    fetchMore(): void;
    unsubscribe: Unsubscribe;
  } {
    const options = normalizeOptions(convenienceOptions, this.namespaceFactory);
    const unsubscribeArray: (() => void)[] = [];
    const cacheKey = createKey({ ...options, cursorKey });
    const maybeEntryStore = this.cache.get(cacheKey, cachePolicy);

    const shouldMakeRequest = isRequestNeeded(
      cachePolicy,
      maybeEntryStore ? maybeEntryStore.getState() : null
    );
    const paginatedEntryStore = getOrCreateEntry(
      this.cache,
      cacheKey,
      cachePolicy,
      shouldMakeRequest ? DataStatus.requested : undefined
    );

    const initialPaginatedState = paginatedEntryStore.getState();
    const unlisten = paginatedEntryStore.addClientListener(onData);

    // we don't need to get full cached list every time, just on go back action in browser
    if (
      paginatedCacheMode === "first-page" &&
      initialPaginatedState.value?.length
    ) {
      this.slicePaginatedCache({
        ...options,
        cursorKey,
      });
    }

    const makeCachedSubscribe = (mode: "first-page" | "not-first-page") => {
      const paginatedEntryState = paginatedEntryStore.getState();
      const prevData = paginatedEntryState.value;

      const body = {
        ...options.body,
        payload: {
          ...options.body.payload,
          [cursorKey]:
            mode === "first-page"
              ? undefined
              : paginatedEntryState.meta?.next_cursor,
          [options.limitKey]: options.limit,
        },
      };

      const result = this.cachedSubscribe<T[], Namespace, ScopeName>({
        ...options,
        method,
        mergeStrategy,
        onData: data => {
          const scope = options.body.scope.find(s => s in (data.data || {}));
          const isDone =
            method === "get" || (data.isDone && method === "stream");

          const event = mode === "first-page" ? "received" : "appended";

          const merged =
            (mode === "not-first-page" || isDone || !prevData?.length) &&
            data.value
              ? mergeStrategy({
                  event: event as "appended", // looks like a ts bug
                  prevData,
                  newData: data.value,
                  getId: options.getId,
                })
              : paginatedEntryState.value;

          paginatedEntryStore.setData({
            scopeName: scope,
            value: merged,
            meta: data.meta,
            status: data.status,
            isDone,
            hasNext: !data.isDone || (data.value?.length || 0) >= options.limit,
          });
        },
        body,
        cachePolicy,
      });

      paginatedEntryStore.makeSubscription({ unsubscribe: () => null });
      unsubscribeArray.push(result.unsubscribe);

      return result;
    };

    if (
      shouldMakeRequest &&
      (paginatedCacheMode === "first-page" ||
        !initialPaginatedState.value?.length)
    ) {
      makeCachedSubscribe("first-page");
    }

    const fetchMore = () => {
      const paginatedEntryState = paginatedEntryStore.getState();
      if (paginatedEntryState.isLoading || paginatedEntryState.isFetching) {
        return;
      }
      return makeCachedSubscribe("not-first-page");
    };

    if (shouldReturnCachedData(cachePolicy)) {
      onData(initialPaginatedState);
    }

    return {
      entryStore: paginatedEntryStore,
      fetchMore,
      unsubscribe: () => {
        unlisten();
        unsubscribeArray.forEach(unsub => unsub());
      },
    };
  }
}

export class Client extends BareClient {
  addressAssets = addressAssets;
  addressLoans = addressLoans;
  addressPositions = addressPositions;
  addressPortfolio = addressPortfolio;
  addressPortfolioDecomposition = addressPortfolioDecomposition;
  addressCharts = addressCharts;
  assetsCharts = assetsCharts;
  assetsPrices = assetsPrices;
  assetsFullInfo = assetsFullInfo;
  assetsInfo = assetsInfo;
}

export const client = new Client(null);

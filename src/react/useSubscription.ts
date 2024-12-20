import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import equal from "fast-deep-equal";
import { MergeStrategy } from "../shared/mergeStrategies";
import {
  Client,
  ConvenienceOptionsCached,
  PaginatedOptionsCached,
  Result,
  PaginatedCacheMode,
  defaultGetHasNext,
} from "../client";
import { client as defaultClient } from "../client";
import { getInitialState } from "../cache/Entry";
import { hasData } from "../cache/hasData";
import { DataStatus } from "../cache/DataStatus";
import { SocketNamespace } from "../shared/SocketNamespace";
import { shouldReturnCachedData } from "../cache/shouldReturnCachedData";
import { defaultCachePolicy } from "../cache/defaultCachePolicy";
import { useClient } from "./context";

// Фиксированные состояния
const emptyEntryIdle = getInitialState<any, any>();
const emptyEntryLoading = getInitialState<any, any>(DataStatus.requested);

// Типы для хуков
type HookExtraOptions = {
  client?: Client;
  keepStaleData?: boolean;
  enabled?: boolean;
};

export type HookOptions<Namespace extends string = any, ScopeName extends string = any> =
  ConvenienceOptionsCached<Namespace, ScopeName> & HookExtraOptions;

export type PaginatedHookOptions<Namespace extends string = any, ScopeName extends string = any, T = unknown> =
  PaginatedOptionsCached<Namespace, ScopeName> &
  HookExtraOptions & {
    method?: "get" | "stream";
    paginatedCacheMode?: PaginatedCacheMode;
    getHasNext?(data: Result<T[], ScopeName>, options: PaginatedOptionsCached<Namespace, ScopeName>): boolean;
  };

export type PaginatedResult<T, ScopeName extends string = any> = Result<T, ScopeName> & { fetchMore?(): void };

// Функция для получения результата из кеша
const getResultEntry = <T, ScopeName extends string, R extends Result<T, ScopeName>>({
  entry,
  enabled,
  cachePolicy,
}: {
  entry: R | null;
  enabled: HookOptions["enabled"];
  cachePolicy: HookOptions["cachePolicy"];
}) => {
  const shouldLoad = enabled && cachePolicy !== "cache-only";
  const entryIsEmpty = !entry || (shouldLoad && entry.status === DataStatus.noRequests && !entry.data);
  
  return entryIsEmpty ? (shouldLoad ? emptyEntryLoading : emptyEntryIdle) : entry;
};

// Хук для запроса данных
function useRequestData<T, Namespace extends string, ScopeName extends string>({
  keepStaleData,
  client,
  ...hookOptions
}: (ConvenienceOptionsCached<Namespace, ScopeName> | PaginatedOptionsCached<Namespace, ScopeName>) & Required<HookExtraOptions>) {
  const [entry, setEntry] = useState<Result<T, ScopeName> | null>(client.getFromCache(hookOptions));

  const guardedSetEntry = useCallback((entry: Result<T, ScopeName> | null) => {
    setEntry(prev => {
      if (!keepStaleData) return entry;
      if (!prev) return entry;

      const newHasData = entry ? hasData(entry.status) : false;
      const prevHasData = hasData(prev.status);

      if (!newHasData && prevHasData) {
        return { ...prev, ...entry, status: prev.status };
      }

      return entry;
    });
  }, [keepStaleData]);

  const { socketNamespace, namespace } = hookOptions;

  const options = useMemo(() => ({
    ...hookOptions,
    socketNamespace,
    namespace,
    onData: guardedSetEntry,
  }), [hookOptions, socketNamespace, namespace, guardedSetEntry]);

  const newEntry = useMemo(() => client.getFromCache(hookOptions), [client, hookOptions]);
  useEffect(() => {
    if (newEntry !== entry && shouldReturnCachedData(options.cachePolicy || defaultCachePolicy)) {
      if (!keepStaleData) {
        guardedSetEntry(newEntry);
      }
    }
  }, [newEntry, entry, options.cachePolicy, keepStaleData, guardedSetEntry]);

  return { entry, setEntry: guardedSetEntry, options };
}

// Хук для подписки
export function useSubscription<T, Namespace extends string = any, ScopeName extends string = any>({
  keepStaleData = false,
  enabled = true,
  client: clientFromProps,
  ...hookOptions
}: HookOptions<Namespace, ScopeName>): Result<T, ScopeName> {
  const clientFromContext = useClient();
  const client = clientFromProps || clientFromContext || defaultClient;
  const { entry, setEntry, options } = useRequestData<T, Namespace, ScopeName>({
    keepStaleData,
    client,
    enabled,
    ...hookOptions,
  });

  useEffect(() => {
    if (!enabled) return;
    setEntry(client.getFromCache(options));
    const { unsubscribe } = client.cachedSubscribe(options);
    return unsubscribe;
  }, [enabled, options, setEntry, client]);

  return getResultEntry<T, ScopeName, Result<T, ScopeName>>({
    entry,
    enabled,
    cachePolicy: options.cachePolicy,
  });
}

// Хук для пагинации
export function usePaginatedRequest<T, Namespace extends string = any, ScopeName extends string = any>({
  keepStaleData = false,
  enabled = true,
  client: clientFromProps,
  paginatedCacheMode = "first-page",
  body,
  getHasNext = defaultGetHasNext,
  ...restOptions
}: PaginatedHookOptions<Namespace, ScopeName, T>): PaginatedResult<T[], ScopeName> {
  const clientFromContext = useClient();
  const client = clientFromProps || clientFromContext || defaultClient;

  const fetchMoreRef = useRef<() => void>();
  const [fetchMoreId, setFetchMoreId] = useState(0);

  const { entry, setEntry, options } = useRequestData<T[], Namespace, ScopeName>({
    keepStaleData,
    client,
    enabled,
    body,
    ...restOptions,
  });

  useEffect(() => {
    if (!enabled) return;
    setEntry(client.getFromCache(options));
    const { unsubscribe, fetchMore } = client.cachedPaginatedRequest({ ...options, paginatedCacheMode });
    fetchMoreRef.current = fetchMore;
    setFetchMoreId(id => id + 1);
    return unsubscribe;
  }, [enabled, options, setEntry, client, paginatedCacheMode]);

  return useMemo(() => {
    const resultEntry = getResultEntry<T[], ScopeName, PaginatedResult<T[], ScopeName>>({
      entry,
      enabled,
      cachePolicy: options.cachePolicy,
    });

    if (fetchMoreId) {
      return { ...resultEntry, fetchMore: fetchMoreRef.current };
    }

    return resultEntry;
  }, [entry, enabled, options.cachePolicy, fetchMoreId]);
}

// Хук для пагинированной подписки
export function usePaginatedSubscription<T, Namespace extends string = any, ScopeName extends string = any>({
  listenForUpdates = true,
  subscriptionMergeStrategy,
  cursorKey,
  ...hookOptions
}: PaginatedHookOptions<Namespace, ScopeName, T> & {
  listenForUpdates?: boolean;
  subscriptionMergeStrategy?: MergeStrategy;
}): Omit<PaginatedResult<T[], ScopeName>, "data"> {
  const { value: subscriptionValue, ...subscriptionEntry } = useSubscription<T[], Namespace, ScopeName>({
    ...hookOptions,
    body: { ...hookOptions.body, payload: { ...hookOptions.body.payload, [hookOptions.limitKey]: Math.min(5, hookOptions.limit - 1) } },
    mergeStrategy: subscriptionMergeStrategy,
    method: "subscribe",
    enabled: listenForUpdates && hookOptions.enabled,
  });

  const { value: paginatedValue, ...paginatedEntry } = usePaginatedRequest<T, Namespace, ScopeName>({ ...hookOptions, cursorKey });

  const getIdRef = useRef<(item: T) => string | number>(item => hookOptions.getId?.(item) ?? item.id);

  const value = use

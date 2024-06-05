import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import equal from "fast-deep-equal";
import { MergeStrategy } from "./../shared/mergeStrategies";
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

const emptyEntryIdle = getInitialState<any, any>();
const emptyEntryLoading = getInitialState<any, any>(DataStatus.requested);

type HookExtraOptions = {
  client?: Client;
  keepStaleData?: boolean;
  enabled?: boolean;
};

export type HookOptions<
  Namespace extends string = any,
  ScopeName extends string = any
> = ConvenienceOptionsCached<Namespace, ScopeName> & HookExtraOptions;

export type PaginatedHookOptions<
  Namespace extends string = any,
  ScopeName extends string = any,
  T = unknown
> = PaginatedOptionsCached<Namespace, ScopeName> &
  HookExtraOptions & {
    method?: "get" | "stream";
    paginatedCacheMode?: PaginatedCacheMode;
    getHasNext?(
      data: Result<T[], ScopeName>,
      options: PaginatedOptionsCached<Namespace, ScopeName>
    ): boolean;
  };

export type PaginatedResult<T, ScopeName extends string = any> = Result<
  T,
  ScopeName
> & { fetchMore?(): void };

function getResultEntry<
  T,
  ScopeName extends string,
  R extends Result<T, ScopeName>
>({
  entry,
  enabled,
  cachePolicy,
}: {
  entry: R | null;
  enabled: HookOptions["enabled"];
  cachePolicy: HookOptions["cachePolicy"];
}) {
  const entryHasOrWillHaveRequest = enabled && cachePolicy !== "cache-only";
  const entryHasNotYetMadeRequest = entry
    ? entry.status === DataStatus.noRequests && !entry.data
    : true;
  const emptyEntry = entryHasOrWillHaveRequest
    ? emptyEntryLoading
    : emptyEntryIdle;
  if (!entry || (entryHasOrWillHaveRequest && entryHasNotYetMadeRequest)) {
    return emptyEntry;
  }
  return entry;
}

function useRequestData<T, Namespace extends string, ScopeName extends string>({
  keepStaleData,
  client,
  ...hookOptions
}: (
  | ConvenienceOptionsCached<Namespace, ScopeName>
  | PaginatedOptionsCached<Namespace, ScopeName>
) &
  Required<HookExtraOptions>) {
  const unmountedRef = useRef(false);
  const [entry, setEntry] = useState<Result<T, ScopeName> | null>(
    client.getFromCache(hookOptions)
  );

  useEffect(() => {
    return () => {
      unmountedRef.current = true;
    };
  }, []);

  const guardedSetEntry = useCallback(
    (entry: Result<T, ScopeName> | null) => {
      // guardedSetEntry is assigned to onData callback in socket subscription
      // it can be called after unmount
      if (unmountedRef.current) {
        return;
      }
      setEntry(prevEntry => {
        if (!keepStaleData) {
          return entry;
        }
        if (!prevEntry) {
          return entry;
        }
        const newEntryHasData = entry ? hasData(entry.status) : false;
        const prevEntryHasData = hasData(prevEntry.status);
        if (!newEntryHasData && prevEntryHasData) {
          return {
            ...prevEntry,
            status: entry ? entry.status : prevEntry.status,
            isDone: entry ? entry.isDone : prevEntry.isDone,
            isFetching: entry ? entry.isFetching : prevEntry.isFetching,
            isLoading: entry ? entry.isLoading : prevEntry.isLoading,
            isError: entry ? entry.isError : prevEntry.isError,
            error: entry ? entry.error : prevEntry.error,
          };
        }
        return entry;
      });
    },
    [keepStaleData]
  );

  const { socketNamespace, namespace } = hookOptions as Omit<
    ConvenienceOptionsCached<Namespace, ScopeName>,
    "enabled"
  > & {
    socketNamespace?: SocketNamespace<Namespace>;
    namespace?: Namespace;
  };

  const [stableHookOptions, setStableHookOptions] = useState(hookOptions);
  const [stableOptions, setStableOptions] = useState<any>({});

  if (stableHookOptions !== hookOptions) {
    if (!equal(stableHookOptions, hookOptions)) {
      setStableHookOptions(hookOptions);
    }
  }

  const options = useMemo(() => {
    return Object.assign(
      {},
      stableHookOptions,
      socketNamespace ? { socketNamespace } : null,
      namespace ? { namespace } : null,
      { onData: guardedSetEntry }
    );
  }, [stableHookOptions, namespace, socketNamespace, guardedSetEntry]);

  if (stableOptions !== options) {
    if (!equal(stableOptions, options)) {
      setStableOptions(options);
    }
  }

  /**
   * NOTE:
   * Entry might have changed has changed since our last render,
   * so we read from cache synchronously and update data if it had changed
   * This should be done synchronously to avoid returning mismatched values
   * https://github.com/facebook/react/blob/93a0c2830534cfbc4e6be3ecc9c9fc34dee3cfaa/packages/use-subscription/src/useSubscription.js#L41-L56
   */
  const newEntry: null | Result<T, ScopeName> = useMemo(
    () => client.getFromCache(hookOptions),
    [client, hookOptions]
  );
  if (
    newEntry !== entry &&
    shouldReturnCachedData(options.cachePolicy || defaultCachePolicy)
  ) {
    if (!keepStaleData) {
      guardedSetEntry(newEntry);
    }
  }

  return { entry, setEntry: guardedSetEntry, options: stableOptions };
}

export function useSubscription<
  T,
  Namespace extends string = any,
  ScopeName extends string = any
>({
  keepStaleData = false,
  enabled = true,
  client: currentClient,
  ...hookOptions
}: HookOptions<Namespace, ScopeName>): Result<T, ScopeName> {
  const client = currentClient || defaultClient;
  const { entry, setEntry, options } = useRequestData<T, Namespace, ScopeName>({
    keepStaleData,
    client,
    enabled,
    ...hookOptions,
  });

  useEffect(() => {
    if (!enabled) {
      return;
    }
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

export function usePaginatedRequest<
  T,
  Namespace extends string = any,
  ScopeName extends string = any
>({
  keepStaleData = false,
  enabled = true,
  client: currentClient,
  paginatedCacheMode = "first-page",
  body,
  getHasNext = defaultGetHasNext,
  ...restOptions
}: PaginatedHookOptions<Namespace, ScopeName, T>): PaginatedResult<
  T[],
  ScopeName
> {
  const hookOptions = { getHasNext, ...restOptions };
  const client = currentClient || defaultClient;

  const cleanedCacheRef = useRef(false);
  if (
    !cleanedCacheRef.current &&
    paginatedCacheMode === "first-page" &&
    "cursorKey" in hookOptions
  ) {
    client.slicePaginatedCache({ ...hookOptions, body });
    cleanedCacheRef.current = true;
  }

  const fetchMoreRef = useRef<() => void>();
  const [fetchMoreId, setFetchMoreId] = useState(0);

  const { entry, setEntry, options } = useRequestData<
    T[],
    Namespace,
    ScopeName
  >({
    keepStaleData,
    client,
    enabled,
    body,
    ...hookOptions,
  });

  useEffect(() => {
    if (!enabled) {
      return;
    }
    setEntry(client.getFromCache(options));
    const {
      unsubscribe,
      fetchMore: clientFetchMore,
    } = client.cachedPaginatedRequest({
      ...options,
      paginatedCacheMode,
    });
    fetchMoreRef.current = clientFetchMore;
    setFetchMoreId(current => current + 1);
    return unsubscribe;
  }, [
    enabled,
    options,
    setEntry,
    client,
    paginatedCacheMode,
    hookOptions.method,
  ]);

  return useMemo(() => {
    const resultEntry = getResultEntry<
      T[],
      ScopeName,
      PaginatedResult<T[], ScopeName>
    >({
      entry,
      enabled,
      cachePolicy: options.cachePolicy,
    }) as PaginatedResult<T[], ScopeName>;

    if (fetchMoreId) {
      return {
        ...resultEntry,
        fetchMore: fetchMoreRef.current,
      };
    }

    return resultEntry;
  }, [entry, enabled, options.cachePolicy, fetchMoreId]);
}

export function usePaginatedSubscription<
  T,
  Namespace extends string = any,
  ScopeName extends string = any
>({
  listenForUpdates = true,
  subscriptionMergeStrategy,
  cursorKey,
  ...hookOptions
}: PaginatedHookOptions<Namespace, ScopeName, T> & {
  listenForUpdates?: boolean;
  subscriptionMergeStrategy?: MergeStrategy;
}): Omit<PaginatedResult<T[], ScopeName>, "data"> {
  const { value: subscriptionValue, ...subscriptionEntry } = useSubscription<
    T[],
    Namespace,
    ScopeName
  >({
    ...hookOptions,
    body: {
      ...hookOptions.body,
      payload: {
        ...hookOptions.body.payload,
        [hookOptions.limitKey]: Math.min(5, hookOptions.limit - 1), // to distinguish subscribe and stream params requests' params
      },
    },
    mergeStrategy: subscriptionMergeStrategy,
    method: "subscribe",
    enabled: listenForUpdates && hookOptions.enabled,
  });

  const { value: paginatedValue, ...paginatedEntry } = usePaginatedRequest<
    T,
    Namespace,
    ScopeName
  >({ ...hookOptions, cursorKey });

  const getIdRef = useRef<(item: T) => string | number>(item => {
    if (hookOptions.getId) {
      return hookOptions.getId?.(item);
    }
    if ("id" in (item as any)) {
      return (item as any).id;
    }
    throw new Error(
      "Request params should contain getId, because response items don't have id field"
    );
  });

  const value = useMemo(() => {
    const paginatedIdSet = new Set(
      paginatedValue?.map(item => getIdRef.current(item))
    );
    const filteredSubscriptionValue = subscriptionValue?.filter(
      item => !paginatedIdSet.has(getIdRef.current(item))
    );
    return [...(filteredSubscriptionValue || []), ...(paginatedValue || [])];
  }, [subscriptionValue, paginatedValue]);

  return {
    ...paginatedEntry,
    value,
    isLoading: subscriptionEntry.isLoading || paginatedEntry.isLoading,
    isFetching: subscriptionEntry.isFetching || paginatedEntry.isFetching,
  };
}

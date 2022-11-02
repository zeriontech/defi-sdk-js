import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import equal from "fast-deep-equal";
import type {
  Client,
  ConvenienceOptionsCached,
  PaginatedOptionsCached,
  Result,
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
  ScopeName extends string = any
> = PaginatedOptionsCached<Namespace, ScopeName> &
  HookExtraOptions & { method: "get" | "stream"; useFullCache?: boolean };

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
  useFullCache,
  ...hookOptions
}: (
  | ConvenienceOptionsCached<Namespace, ScopeName>
  | PaginatedOptionsCached<Namespace, ScopeName>
) &
  Required<HookExtraOptions> & {
    useFullCache?: boolean;
  }) {
  const [entry, setEntry] = useState<Result<T, ScopeName> | null>(
    client.getFromCache(
      useFullCache || !("cursorKey" in hookOptions)
        ? hookOptions
        : {
            ...hookOptions,
            body: {
              ...hookOptions.body,
              payload: {
                ...hookOptions.body.payload,
                [hookOptions.cursorKey]: undefined,
                [hookOptions.limitKey]: hookOptions.limit,
              },
            },
          }
    )
  );

  const guardedSetEntry = useCallback(
    (entry: Result<T, ScopeName> | null) => {
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
          };
        }
        return entry;
      });
    },
    [keepStaleData]
  );

  const {
    socketNamespace,
    namespace,
    ...restHookOptions
  } = hookOptions as Omit<
    ConvenienceOptionsCached<Namespace, ScopeName>,
    "enabled"
  > & {
    socketNamespace?: SocketNamespace<Namespace>;
    namespace?: Namespace;
  };

  const [stableHookOptions, setStableHookOptions] = useState(restHookOptions);

  if (stableHookOptions !== restHookOptions) {
    if (!equal(stableHookOptions, restHookOptions)) {
      setStableHookOptions(restHookOptions);
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

  return { entry, setEntry: guardedSetEntry, options };
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
  useFullCache,
  body,
  ...hookOptions
}: PaginatedHookOptions<Namespace, ScopeName>): PaginatedResult<
  T[],
  ScopeName
> {
  const client = currentClient || defaultClient;
  const [fetchMore, setFetchMore] = useState<() => void | undefined>();

  const { entry, setEntry, options } = useRequestData<
    T[],
    Namespace,
    ScopeName
  >({
    keepStaleData,
    client,
    enabled,
    body,
    useFullCache,
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
      useFullCache,
    });
    setFetchMore(() => clientFetchMore);
    return unsubscribe;
  }, [enabled, options, setEntry, client, useFullCache]);

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
    resultEntry.fetchMore = fetchMore;

    return resultEntry;
  }, [entry, enabled, options.cachePolicy, fetchMore]);
}

export function usePaginatedSubscription<
  T extends { id: string },
  Namespace extends string = any,
  ScopeName extends string = any
>(
  hookOptions: PaginatedHookOptions<Namespace, ScopeName>
): Omit<PaginatedResult<T[], ScopeName>, "data"> {
  const { value: subscriptionValue, ...subscriptionEntry } = useSubscription<
    T[],
    Namespace,
    ScopeName
  >({
    ...hookOptions,
    method: "subscribe",
  });
  const { value: paginatedValue, ...paginatedEntry } = usePaginatedRequest<
    T,
    Namespace,
    ScopeName
  >(hookOptions);

  const getIdRef = useRef<(item: T) => string | number>(
    item => hookOptions.getId?.(item) || item.id
  );

  const value = useMemo(() => {
    const paginatedIdSet = new Set(
      paginatedValue?.map(item => getIdRef.current(item) || item.id)
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

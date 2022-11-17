import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  CachedPaginatedRequestOptions,
  CachedRequestOptions,
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
> = PaginatedOptionsCached<Namespace, ScopeName> & HookExtraOptions;

export type PaginatedResult<T, ScopeName extends string = any> = Result<
  T,
  ScopeName
> & { fetchMore?(): void };

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
  const [entry, setEntry] = useState<Result<T, ScopeName> | null>(
    client.getFromCache(hookOptions)
  );

  const guardedSetEntry = useCallback(
    (entry: null | Result<T, ScopeName>) => {
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

  const { socketNamespace, namespace } = hookOptions as {
    socketNamespace?: SocketNamespace<Namespace>;
    namespace?: Namespace;
  };
  const options: CachedRequestOptions<T, Namespace, ScopeName> = useMemo(() => {
    const value = Object.assign(
      {
        method: hookOptions.method,
        cachePolicy: hookOptions.cachePolicy,
        body: hookOptions.body,
        getId: hookOptions.getId,
        mergeStrategy: hookOptions.mergeStrategy,
        onAnyMessage: hookOptions.onAnyMessage,
        verifyFn: hookOptions.verifyFn,
        onData: guardedSetEntry,
      },
      socketNamespace ? { socketNamespace } : null,
      namespace ? { namespace } : null
    );
    return value;
  }, [
    guardedSetEntry,
    hookOptions.body,
    hookOptions.cachePolicy,
    hookOptions.getId,
    hookOptions.mergeStrategy,
    hookOptions.onAnyMessage,
    hookOptions.verifyFn,
    hookOptions.method,
    namespace,
    socketNamespace,
  ]);

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

  useEffect(() => {
    if (!enabled) {
      return;
    }
    guardedSetEntry(client.getFromCache(options));
    const { unsubscribe } = client.cachedSubscribe(options);
    return unsubscribe;
  }, [enabled, options, guardedSetEntry, client]);

  const entryHasOrWillHaveRequest =
    enabled && options.cachePolicy !== "cache-only";
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

export function usePaginatedSubscription<
  T,
  Namespace extends string = any,
  ScopeName extends string = any
>({
  keepStaleData = false,
  enabled = true,
  client: currentClient,
  ...hookOptions
}: PaginatedHookOptions<Namespace, ScopeName>): PaginatedResult<
  T[],
  ScopeName
> {
  const client = currentClient || defaultClient;
  const fetchMoreRef = useRef<() => void>(() => null);
  const [entry, setEntry] = useState<PaginatedResult<T[], ScopeName> | null>(
    client.getFromCache(hookOptions)
  );

  const guardedSetEntry = useCallback(
    (entry: null | PaginatedResult<T[], ScopeName>) => {
      setEntry(prevEntry => {
        if (entry) {
          entry.fetchMore = fetchMoreRef.current;
        }
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
            fetchMore: fetchMoreRef.current,
          };
        }
        return entry;
      });
    },
    [keepStaleData]
  );

  const { socketNamespace, namespace } = hookOptions as {
    socketNamespace?: SocketNamespace<Namespace>;
    namespace?: Namespace;
  };
  const options: CachedPaginatedRequestOptions<
    T[],
    Namespace,
    ScopeName
  > = useMemo(() => {
    const value = Object.assign(
      {
        method: hookOptions.method,
        cachePolicy: hookOptions.cachePolicy,
        body: hookOptions.body,
        getId: hookOptions.getId,
        mergeStrategy: hookOptions.mergeStrategy,
        onAnyMessage: hookOptions.onAnyMessage,
        verifyFn: hookOptions.verifyFn,
        cursorKey: hookOptions.cursorKey,
        limitKey: hookOptions.limitKey,
        limit: hookOptions.limit,
        onData: guardedSetEntry,
      },
      socketNamespace ? { socketNamespace } : null,
      namespace ? { namespace } : null
    );
    return value;
  }, [
    guardedSetEntry,
    hookOptions.body,
    hookOptions.cachePolicy,
    hookOptions.getId,
    hookOptions.mergeStrategy,
    hookOptions.onAnyMessage,
    hookOptions.verifyFn,
    hookOptions.method,
    hookOptions.cursorKey,
    hookOptions.limitKey,
    hookOptions.limit,
    namespace,
    socketNamespace,
  ]);

  /**
   * NOTE:
   * Entry might have changed has changed since our last render,
   * so we read from cache synchronously and update data if it had changed
   * This should be done synchronously to avoid returning mismatched values
   * https://github.com/facebook/react/blob/93a0c2830534cfbc4e6be3ecc9c9fc34dee3cfaa/packages/use-subscription/src/useSubscription.js#L41-L56
   */
  const newEntry: null | Result<T[], ScopeName> = useMemo(
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

  useEffect(() => {
    if (!enabled) {
      return;
    }
    guardedSetEntry(client.getFromCache(options));
    const { unsubscribe, fetchMore } = client.cachedPaginatedRequest(options);
    fetchMoreRef.current = fetchMore;
    return unsubscribe;
  }, [enabled, options, guardedSetEntry, client]);

  const entryHasOrWillHaveRequest =
    enabled && options.cachePolicy !== "cache-only";
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

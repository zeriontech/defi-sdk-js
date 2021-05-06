import { useCallback, useEffect, useMemo, useState } from "react";
import type { Entry } from "../cache/Entry";
import type {
  CachedRequestOptions,
  Client,
  ConvenienceOptionsCached,
} from "../client";
import { client as defaultClient } from "../client";
import type { ResponsePayload } from "../requests/ResponsePayload";
import { getInitialState } from "../cache/Entry";
import { hasData } from "../cache/hasData";
import { DataStatus } from "../cache/DataStatus";
import { SocketNamespace } from "../shared/SocketNamespace";

const emptyEntryIdle = getInitialState<any>();
const emptyEntryLoading = getInitialState<any>(DataStatus.requested);

export type HookOptions<
  Namespace extends string = any,
  ScopeName extends string = any
> = ConvenienceOptionsCached<Namespace, ScopeName> & {
  client?: Client;
  keepStaleData?: boolean;
  enabled?: boolean;
};

export function useSubscription<
  T,
  Namespace extends string = any,
  ScopeName extends string = any
>({
  keepStaleData = false,
  enabled = true,
  client: currentClient,
  ...hookOptions
}: HookOptions<Namespace, ScopeName>): Entry<ResponsePayload<T, ScopeName>> {
  const client = currentClient || defaultClient;
  const [entry, setEntry] = useState<Entry<
    ResponsePayload<T, ScopeName>
  > | null>(client.getFromCache(hookOptions));

  const guardedSetEntry = useCallback(
    (entry: null | Entry<ResponsePayload<T, ScopeName>>) => {
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
  const newEntry: null | Entry<ResponsePayload<T, ScopeName>> = useMemo(
    () => client.getFromCache(hookOptions),
    [client, hookOptions]
  );
  if (newEntry !== entry) {
    guardedSetEntry(newEntry);
  }

  useEffect(() => {
    if (!enabled) {
      return;
    }
    guardedSetEntry(client.getFromCache(options));
    const { unsubscribe } = client.cachedSubscribe(options);
    return unsubscribe;
  }, [enabled, options, guardedSetEntry, client]);

  const emptyEntry = enabled ? emptyEntryLoading : emptyEntryIdle;
  return entry || emptyEntry;
}

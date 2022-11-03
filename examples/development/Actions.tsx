import React, { useMemo } from "react";
import {
  mergeList,
  mergeListReverseChronological,
  useAddressActions,
  usePaginatedRequest,
  useSubscription,
} from "../../src";
import { EntryInfo } from "./EntryInfo";

export function Actions() {
  const entry = useSubscription({
    method: "stream",
    namespace: "address",
    mergeStrategy: mergeListReverseChronological,
    body: useMemo(() => {
      return {
        scope: ["actions"],
        payload: {
          actions_search_query: "",
          currency: "usd",
          address: "0x42b9df65b219b3dd36ff330a4dd8f327a6ada990",
          actions_limit: 100,
        },
      };
    }, []),
  });

  return (
    <>
      <EntryInfo
        entry={entry}
        render={entry => <div>{JSON.stringify(entry.value)}</div>}
      />
    </>
  );
}

export function ActionsPaginated() {
  const entry = useAddressActions(
    {
      actions_search_query: "",
      currency: "usd",
      address: "0x42b9df65b219b3dd36ff330a4dd8f327a6ada990",
    },
    {
      method: "stream",
      cachePolicy: "cache-first",
      useFullCache: false,
      limit: 2,
      subscribe: true,
    }
  );

  console.log(entry.value);

  return (
    <>
      <EntryInfo
        entry={entry}
        render={entry => (
          <div>
            {entry.value?.map(item => (
              <div key={item.id}>{item.datetime}</div>
            ))}
          </div>
        )}
      />
      {entry.value?.length ? (
        <button onClick={() => entry.fetchMore?.()}>Fetch more</button>
      ) : null}
    </>
  );
}

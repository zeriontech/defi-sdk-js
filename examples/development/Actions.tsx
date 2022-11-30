import React, { useMemo } from "react";
import {
  mergeList,
  useAddressActions,
  useSubscription,
} from "../../src";
import { AddressAction } from "../../src/entities/AddressAction";
import { EntryInfo } from "./EntryInfo";

export function Actions() {
  const entry = useSubscription<AddressAction[], "address", "actions">({
    method: "stream",
    namespace: "address",
    mergeStrategy: mergeList,
    body: useMemo(() => {
      return {
        scope: ["actions"],
        payload: {
          actions_search_query: "",
          currency: "usd",
          address: "0x42b9df65b219b3dd36ff330a4dd8f327a6ada990",
          actions_limit: 20,
        },
      };
    }, []),
  });

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
    </>
  );
}

export function ActionsPaginated() {
  const entry = useAddressActions(
    {
      currency: "usd",
      address: "0x42b9df65b219b3dd36ff330a4dd8f327a6ada990",
    },
    {
      limit: 30,
      listenForUpdates: true,
      paginatedCacheMode: 'full',
    }
  );

  return (
    <>
      <EntryInfo
        entry={{ ...entry, data: {} }}
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

import React, { useMemo } from "react";
import { mergeListReverseChronological, useSubscription } from "../../src";
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

import React from "react";
import type {
  FullNFTCollectionInfo,
  NFTCollectionsSortedByType,
} from "../../src/entities/NFTCollection";
import {
  createDomainHook,
  createPaginatedDomainHook,
} from "../../src/react/domains/createDomainHook";
import { EntryInfo } from "./components/EntryInfo";

type Payload = {
  currency: string;
  limit?: number;
  sorted_by?: NFTCollectionsSortedByType;
};

const namespace = "assets";
const scope = "nft-collections";

const useNFTCollections = createDomainHook<
  Payload,
  FullNFTCollectionInfo[],
  typeof namespace,
  typeof scope
>({
  namespace,
  scope,
});

const useNFTCollectionsPaginated = createPaginatedDomainHook<
  Payload,
  FullNFTCollectionInfo,
  typeof namespace,
  typeof scope
>({
  namespace,
  scope,
  limitKey: "limit",
  method: "get",
  getId: (item: FullNFTCollectionInfo) => item.collection_id,
});

export function NFTCollections() {
  const entry = useNFTCollections({
    currency: "usd",
    sorted_by: "one_day_volume_high",
    limit: 10,
  });

  return (
    <>
      <EntryInfo
        entry={{ ...entry, data: {} }}
        render={entry => (
          <div>
            {entry.value?.map(item => (
              <div key={item.collection_id}>{item.name}</div>
            ))}
          </div>
        )}
      />
    </>
  );
}

export function NFTCollectionsPaginated() {
  const entry = useNFTCollectionsPaginated(
    {
      currency: "usd",
      sorted_by: "one_day_volume_high",
    },
    {
      limit: 30,
      listenForUpdates: false,
      paginatedCacheMode: "first-page",
    }
  );

  return (
    <>
      <EntryInfo
        entry={{ ...entry, data: {} }}
        render={entry => (
          <div>
            {entry.value?.map(item => (
              <div key={item.collection_id}>{item.name}</div>
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

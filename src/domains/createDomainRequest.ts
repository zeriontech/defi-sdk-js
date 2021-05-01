import type { MergeStrategy } from "../shared/mergeStrategies";
import type { CachedRequestOptions, Client } from "../client";
import type { EntryStore } from "../cache/Entry";
import type { Unsubscribe } from "../shared/Unsubscribe";
import type { ResponsePayload } from "../requests/ResponsePayload";

export type Options<
  RequestPayload,
  ResponseData,
  Namespace extends string,
  ScopeName extends string
> = Omit<
  CachedRequestOptions<ResponseData, Namespace, ScopeName, RequestPayload>,
  "body" | "socketNamespace" | "onData"
> & {
  client?: Client;
  payload: RequestPayload;
  onData: (data: ResponsePayload<ResponseData, ScopeName>) => void;
};

export function createDomainRequest<
  RequestPayload,
  ResponseData,
  Namespace extends string,
  ScopeName extends string
>({
  namespace,
  scopeName,
  getId,
  mergeStrategy,
}: {
  namespace: Namespace;
  scopeName: ScopeName;
  getId?: (x: any) => string | number;
  mergeStrategy?: MergeStrategy;
  client?: Client;
}) {
  return function domainRequest(
    this: Client | void,
    {
      payload,
      client: currentClient,
      ...options
    }: Options<RequestPayload, ResponseData, Namespace, ScopeName>
  ): {
    entryStore: EntryStore<ResponseData>;
    unsubscribe: Unsubscribe;
  } {
    const client = currentClient || this;
    if (!client) {
      throw new Error(
        "Domain request must be called either as a method of Client or with a client parameter"
      );
    }

    return client.cachedSubscribe<ResponseData, Namespace, ScopeName>({
      ...options,
      onData: entry => {
        if (entry.data) {
          options.onData(entry.data);
        }
      },
      namespace,
      getId: getId || options.getId,
      mergeStrategy: mergeStrategy || options.mergeStrategy,
      body: {
        scope: [scopeName],
        payload,
      },
    });
  };
}

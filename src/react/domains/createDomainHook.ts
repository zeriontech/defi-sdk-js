import { useMemo } from "react";
import type { Entry, MergeStrategy } from "../..";
import type { ResponsePayload } from "../../requests/ResponsePayload";
import type { HookOptions } from "../useSubscription";
import { useSubscription } from "../useSubscription";

export type Options<
  Payload,
  Namespace extends string,
  ScopeName extends string
> = Omit<HookOptions<ScopeName, Namespace>, "body" | "socketNamespace"> & {
  payload: Payload;
};

export function createDomainHook<
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
}) {
  return ({
    payload,
    ...options
  }: Options<RequestPayload, Namespace, ScopeName>): Entry<
    ResponsePayload<ResponseData, ScopeName>
  > =>
    useSubscription<ResponseData, Namespace, ScopeName>({
      ...options,
      namespace,
      getId: getId || options.getId,
      mergeStrategy: mergeStrategy || options.mergeStrategy,
      body: useMemo(
        () => ({
          scope: [scopeName],
          payload,
        }),
        [payload]
      ),
    });
}

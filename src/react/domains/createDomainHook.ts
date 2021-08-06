import { useMemo } from "react";
import type { Entry, MergeStrategy } from "../..";
import type { ResponsePayload } from "../../requests/ResponsePayload";
import type { verify } from "../../requests/verify";
import type { HookOptions } from "../useSubscription";
import { useSubscription } from "../useSubscription";

export type Options<
  Payload,
  Namespace extends string,
  ScopeName extends string
> = Omit<HookOptions<Namespace, ScopeName>, "body" | "socketNamespace"> & {
  payload: Payload;
};

export function createDomainHook<
  RequestPayload,
  ResponseData,
  Namespace extends string,
  ScopeName extends string
>({
  namespace,
  scope,
  getId,
  mergeStrategy,
  verifyFn,
}: {
  namespace: Namespace;
  scope: ScopeName;
  getId?: (x: any) => string | number;
  mergeStrategy?: MergeStrategy;
  verifyFn?: typeof verify;
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
      verifyFn: verifyFn || options.verifyFn,
      body: useMemo(
        () => ({
          scope: [scope],
          payload,
        }),
        [payload]
      ),
    });
}

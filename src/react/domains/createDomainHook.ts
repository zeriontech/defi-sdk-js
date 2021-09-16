import { useEffect, useMemo, useState } from "react";
import equal from "fast-deep-equal";
import type { Entry, MergeStrategy } from "../..";
import type { ResponsePayload } from "../../requests/ResponsePayload";
import type { verify } from "../../requests/verify";
import { useSubscription } from "../useSubscription";
import type { HookOptions } from "../useSubscription";

export type Options<Namespace extends string, ScopeName extends string> = Omit<
  HookOptions<Namespace, ScopeName>,
  "body" | "socketNamespace"
>;

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
  return (
    payload: RequestPayload,
    options: Options<Namespace, ScopeName> = {}
  ): Entry<ResponsePayload<ResponseData, ScopeName>> => {
    const [currentPayload, setCurrentPayload] = useState(payload);

    if (currentPayload !== payload) {
      if (!equal(currentPayload, payload)) {
        setCurrentPayload(payload);
      }
    }

    const result = useSubscription<ResponseData, Namespace, ScopeName>({
      ...options,
      namespace,
      getId: getId || options.getId,
      mergeStrategy: mergeStrategy || options.mergeStrategy,
      verifyFn: verifyFn || options.verifyFn,
      body: useMemo(
        () => ({
          scope: [scope],
          payload: currentPayload,
        }),
        [currentPayload]
      ),
    });

    return result;
  };
}

import { useMemo, useState } from "react";
import equal from "fast-deep-equal";
import type { verify } from "../../requests/verify";
import { useSubscription, usePaginatedSubscription } from "../useSubscription";
import type {
  HookOptions,
  PaginatedHookOptions,
  PaginatedResult,
} from "../useSubscription";
import {
  mergeList,
  mergeListReverseChronological,
} from "../../shared/mergeStrategies";
import type { MergeStrategy } from "../../shared/mergeStrategies";
import { Entry } from "../../cache/Entry";

export type Options<Namespace extends string, ScopeName extends string> = Omit<
  HookOptions<Namespace, ScopeName>,
  "body" | "socketNamespace"
>;

export type PaginatedOptions<
  Namespace extends string,
  ScopeName extends string
> = Omit<
  PaginatedHookOptions<Namespace, ScopeName>,
  "body" | "socketNamespace"
> & {
  subscriptionMergeStrategy?: MergeStrategy;
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
  return (
    payload: RequestPayload,
    options: Options<Namespace, ScopeName> = {}
  ): Entry<ResponseData, ScopeName> => {
    const [currentPayload, setCurrentPayload] = useState(payload);

    if (currentPayload !== payload) {
      if (!equal(currentPayload, payload)) {
        setCurrentPayload(payload);
      }
    }

    const result = useSubscription<ResponseData, Namespace, ScopeName>({
      ...options,
      namespace,
      getId: options.getId || getId,
      mergeStrategy: options.mergeStrategy || mergeStrategy,
      verifyFn: options.verifyFn || verifyFn,
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

export function createPaginatedDomainHook<
  RequestPayload,
  ResponseData,
  Namespace extends string,
  ScopeName extends string
>({
  namespace,
  scope,
  getId,
  mergeStrategy = mergeList,
  subscriptionMergeStrategy = mergeListReverseChronological,
  verifyFn,
  cursorKey = "cursor",
  limitKey = "limit",
  method,
}: {
  namespace: Namespace;
  scope: ScopeName;
  getId?: (x: any) => string | number;
  mergeStrategy?: MergeStrategy;
  subscriptionMergeStrategy?: MergeStrategy;
  verifyFn?: typeof verify;
  cursorKey?: string;
  limitKey?: string;
  method?: "get" | "stream";
}) {
  return (
    payload: RequestPayload,
    options: Omit<
      PaginatedOptions<Namespace, ScopeName>,
      "cursorKey" | "limitKey"
    > & { listenForUpdates?: boolean }
  ): Omit<PaginatedResult<ResponseData[], ScopeName>, "data"> => {
    const [currentPayload, setCurrentPayload] = useState(payload);

    if (currentPayload !== payload) {
      if (!equal(currentPayload, payload)) {
        setCurrentPayload(payload);
      }
    }

    const result = usePaginatedSubscription<ResponseData, Namespace, ScopeName>(
      {
        ...options,
        namespace,
        cursorKey: cursorKey,
        limitKey: limitKey,
        method: options.method || method,
        getId: options.getId || getId,
        mergeStrategy: options.mergeStrategy || mergeStrategy,
        subscriptionMergeStrategy:
          options.subscriptionMergeStrategy || subscriptionMergeStrategy,
        verifyFn: options.verifyFn || verifyFn,
        body: useMemo(
          () => ({
            scope: [scope],
            payload: currentPayload,
          }),
          [currentPayload]
        ),
      }
    );

    return result;
  };
}

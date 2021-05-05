export { Client, client } from "./client";
export {
  mergeDict,
  mergeList,
  mergeListReverseChronological,
} from "./shared/mergeStrategies";
export type { MergeStrategy } from "./shared/mergeStrategies";
export type { SocketNamespace } from "./shared/SocketNamespace";
export type { CachePolicy } from "./cache/CachePolicy";
export type { Entry } from "./cache/Entry";
export { DataStatus } from "./cache/DataStatus";

// domain helpers
export { addressLoans } from "./domains/addressLoans";
export { addressAssets } from "./domains/addressAssets";
export { assetsFullInfo } from "./domains/assetsFullInfo";
export { assetsInfo } from "./domains/assetsInfo";
export { assetsPrices } from "./domains/assetsPrices";

// react bindings
export { useSubscription } from "./react/useSubscription";
export { useAddressAssets } from "./react/domains/useAddressAssets";
export { useAddressLoans } from "./react/domains/useAddressLoans";
export { useAssetsFullInfo } from "./react/domains/useAssetsFullInfo";
export { useAssetsInfo } from "./react/domains/useAssetsInfo";
export { useAssetsPrices } from "./react/domains/useAssetsPrices";
export type { HookOptions } from "./react/useSubscription";

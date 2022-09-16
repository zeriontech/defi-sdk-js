export { Client, client } from "./client";
export {
  mergeDict,
  mergeList,
  mergeListReverseChronological,
  mergeSingleEntity,
} from "./shared/mergeStrategies";
export type { MergeStrategy } from "./shared/mergeStrategies";
export type { SocketNamespace } from "./shared/SocketNamespace";
export type { CachePolicy } from "./cache/CachePolicy";
export type { Entry } from "./cache/Entry";
export { EntryStore } from "./cache/Entry";
export type { Hooks, Result } from "./client";
export { RequestCache } from "./cache/RequestCache";
export { PersistentCache } from "./cache/PersistentCache";
export { DataStatus } from "./cache/DataStatus";
export { createSocketNamespace } from "./socket/createSocketNamespace";

// domain helpers
export { addressLoans } from "./domains/addressLoans";
export { addressAssets } from "./domains/addressAssets";
export { addressPositions } from "./domains/addressPositions";
export { addressPortfolio } from "./domains/addressPortfolio";
export { addressPortfolioDecomposition } from "./domains/addressPortfolioDecomposition";
export { addressCharts } from "./domains/addressCharts";
export { assetsFullInfo } from "./domains/assetsFullInfo";
export { assetsInfo } from "./domains/assetsInfo";
export { assetsPrices } from "./domains/assetsPrices";
export { assetsCharts } from "./domains/assetsCharts";
export type { AddressParams } from "./domains/AddressParams";

// react bindings
export * from "./react";

// entities
export * from "./entities";

import { ChartType } from "../entities/Chart";
import { AddressParams } from "./AddressParams";
import { createDomainRequest } from "./createDomainRequest";

export type RequestPayload = AddressParams & {
  currency: string;
  charts_type: ChartType;
  charts_max_assets: number; // how many assets to extract from "others"
  charts_min_percentage: number;
};
export interface ResponseData {
  others: number[][];
}
export const namespace = "address";
export const scope = "charts";

export const addressCharts = createDomainRequest<
  RequestPayload,
  ResponseData,
  typeof namespace,
  typeof scope
>({
  namespace,
  scope,
});

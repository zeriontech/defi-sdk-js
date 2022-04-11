import { ChartType } from "../entities/Chart";
import { createDomainRequest } from "./createDomainRequest";

export type RequestPayload = {
  currency: string;
  asset_codes: string[];
  charts_type: ChartType;
};
export type ResponseData = Record<string, number[][]>;
export const namespace = "assets";
export const scope = "charts";

export const assetsCharts = createDomainRequest<
  RequestPayload,
  ResponseData,
  typeof namespace,
  typeof scope
>({
  namespace,
  scope,
});

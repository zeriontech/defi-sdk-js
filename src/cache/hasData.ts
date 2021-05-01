import { DataStatus } from "./DataStatus";

export function hasData(status: DataStatus): boolean {
  return status === DataStatus.ok || status === DataStatus.updating;
}

import { ProtocolInfo } from "./ProtocolInfo";

export interface LockedAsset extends ProtocolInfo {
  locked: number;
}

import io from "socket.io-client";
import type { SocketNamespace } from "../shared/SocketNamespace";
import { handlePageVisibility } from "./page-visibility";
import { reconnectionProxy } from "./reconnection-proxy";

const cached: { [key: string]: SocketNamespace<any> } = {};

export const createSocketNamespace = <T extends string>(
  endpoint: string,
  apiToken: string,
  namespace: T,
  ioOptions: Parameters<typeof io>[0] = {},
  namespaceName = namespace
): SocketNamespace<T> => {
  const key = `${endpoint}:${namespace}`;
  if (!cached[key]) {
    const { query = {}, ...restOptions } = ioOptions;
    const socket = io(new URL(namespace, endpoint).toString(), {
      transports: ["websocket"],
      timeout: 60000,
      query: { api_token: apiToken, ...query },
      ...restOptions,
    });
    const updatedSocket = reconnectionProxy(socket, endpoint);
    handlePageVisibility(updatedSocket);
    cached[key] = { socket: updatedSocket, namespace: namespaceName };
  }
  return cached[key];
};

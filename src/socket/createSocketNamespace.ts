import io from "socket.io-client";
import type { SocketNamespace } from "../shared/SocketNamespace";
import { handlePageVisibility } from "./page-visibility";
import { reconnectionProxy } from "./reconnection-proxy";

const cached: { [key: string]: SocketNamespace<any> } = {};

export const createSocketNamespace = <T extends string>(
  endpoint: string,
  apiToken: string,
  namespace: T,
  namespaceName = namespace
): SocketNamespace<T> => {
  if (!cached[namespace]) {
    const socket = io(new URL(namespace, endpoint).toString(), {
      transports: ["websocket"],
      timeout: 60000,
      query: { api_token: apiToken },
    });
    const updatedSocket = reconnectionProxy(socket, endpoint);
    handlePageVisibility(updatedSocket);
    cached[namespace] = { socket: updatedSocket, namespace: namespaceName };
  }
  return cached[namespace];
};

export const createNamespaceFactory = (endpoint: string) => <T extends string>(
  namespace: T,
  namespaceName = namespace
): SocketNamespace<T> =>
  createSocketNamespace(endpoint, namespace, namespaceName);

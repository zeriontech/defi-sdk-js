import io from "socket.io-client";
import type { SocketNamespace } from "../shared/SocketNamespace";
import { handlePageVisibility } from "./page-visibility";
import { reconnectionProxy } from "./reconnection-proxy";

// const endpoint = "wss://api-staging.zerion.io";
// const API_KEY = "Zerion.0JOY6zZTTw6yl5Cvz9sdmXc7d5AhzVMG";

const cached: { [key: string]: SocketNamespace<any> } = {};

export const createSocketNamespace = <T extends string>(
  endpoint: string,
  apiToken: string,
  namespace: T,
  namespaceName = namespace
): SocketNamespace<T> => {
  if (!cached[namespace]) {
    const socket = io(`${endpoint}/${namespace}`, {
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

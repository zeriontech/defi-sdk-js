import type { Socket } from "socket.io-client";

export interface SocketNamespace<Namespace extends string> {
  namespace: Namespace;
  socket: typeof Socket;
}

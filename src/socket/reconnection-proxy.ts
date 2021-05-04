import type { Socket } from "socket.io-client";
import type { Response } from "../requests/Response";
import type { Request } from "../requests/Request";
import { verifyByRequestId } from "../requests/verifyByRequestId";

const pendingRequests = new Map();
const activeSubscriptions = new Map();

function handleGet(
  socket: typeof Socket,
  endpoint: string,
  args: ArrayLike<any>
) {
  const request = args[1] as Request<any, any>;
  if (!request || !request.scope || !request.payload) {
    return;
  }
  const { scope } = request;
  pendingRequests.get(socket).add(args);
  scope.forEach(scopeName => {
    function handleReceive(response: Response<any>) {
      if (verifyByRequestId(request, response)) {
        socket.off(`received ${endpoint} ${scopeName}`, handleReceive);
        pendingRequests.get(socket).delete(args);
      }
    }
    socket.on(`received ${endpoint} ${scopeName}`, handleReceive);
  });
}

function handleSubscribe(socket: typeof Socket, args: ArrayLike<any>) {
  const event = args[0];
  const request = args[1] as Request<any, any>;
  if (!request || !request.scope || !request.payload) {
    return;
  }

  if (event === "subscribe") {
    activeSubscriptions.get(socket).set(request, args);
  }

  if (event === "unsubscribe" && activeSubscriptions.get(socket).has(request)) {
    activeSubscriptions.get(socket).delete(request);
  }
}

export function reconnectionProxy(
  socket: typeof Socket,
  endpoint: string
): typeof Socket {
  pendingRequests.set(socket, new Set());
  activeSubscriptions.set(socket, new Map());

  const originalEmit = socket.emit;

  /**
   * In order to intercept `emit` calls to the socket,
   * we have to monkey-patch the method.
   * There's no middleware support at the moment:
   * https://github.com/socketio/socket.io/issues/434
   *
   * Also, we're not using an actual Proxy (https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy)
   * because the implementation would still require to monkey-patch the method,
   * so there doesn't seem to be a practical difference (not sure, though)
   */
  Object.assign(socket, {
    emit(event: string) {
      /**
       * NOTE: special `arguments` object is used here for performance:
       * this function is expected to be called very often,
       * so we want to avoid unnecessary array spreading
       */
      const args = arguments; // eslint-disable-line prefer-rest-params
      if (event === "get") {
        handleGet(socket, endpoint, args);
      } else if (event === "subscribe" || event === "unsubscribe") {
        handleSubscribe(socket, args);
      }
      originalEmit.apply(socket, arguments as any); // eslint-disable-line prefer-rest-params
    },
  });

  // flag to avoid handling a 'reconnect' event twice
  let didHandleReconnect = false;

  socket.on("disconnect", () => {
    didHandleReconnect = false;
  });

  function handleReconnect() {
    for (const savedArgs of pendingRequests.get(socket)) {
      originalEmit.apply(socket, savedArgs);
    }
    for (const savedArgs of activeSubscriptions.get(socket).values()) {
      originalEmit.apply(socket, savedArgs);
    }
  }

  socket.on("reconnect", () => {
    if (didHandleReconnect) {
      return;
    }
    didHandleReconnect = true;
    handleReconnect();
  });

  return socket;
}

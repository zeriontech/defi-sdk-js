import type { Socket } from "socket.io-client";
import type { Unsubscribe } from "../shared/Unsubscribe";

const WAIT_BEFORE_DISCONNECT = 20000;

function getWaitTime() {
  // just a helper for debugging so that timeout
  // can be set from console
  return (window as any).WAIT_BEFORE_DISCONNECT || WAIT_BEFORE_DISCONNECT;
}

export function handlePageVisibility(socket: typeof Socket): Unsubscribe {
  if (typeof document === "undefined") {
    return () => {}; // eslint-disable-line @typescript-eslint/no-empty-function
  }
  let active = true;
  let timerId: any;
  let disconnected = false;
  function handler() {
    if (document.visibilityState === "hidden") {
      timerId = setTimeout(() => {
        socket.disconnect();
        disconnected = true;
      }, getWaitTime());
    }

    if (document.visibilityState === "visible") {
      clearTimeout(timerId);
      if (disconnected) {
        socket.on("connect", () => {
          if (!active) {
            return;
          }
          disconnected = false;
        });
        socket.connect();
        socket.emit("reconnect");
      }
    }
  }
  document.addEventListener("visibilitychange", handler);
  return () => {
    active = false;
    document.removeEventListener("visibilitychange", handler);
  };
}

import React, { useContext } from "react";
import type { Client } from "../client";

const ClientContext = React.createContext<Client | null>(null);

export function DefiSdkClientProvider({
  client,
  children,
}: React.PropsWithChildren<{ client: Client }>): React.ReactNode {
  // Sorry, not the best day to setup JSX support
  return React.createElement(
    ClientContext.Provider,
    { value: client },
    children
  );
}

export function useClient(): Client | null {
  const client = useContext(ClientContext);
  return client;
}

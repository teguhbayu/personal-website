"use client";

import { createContext, useContext } from "react";

interface CloudDeckContextValue {
  spinConsole: () => void;
}

export const CloudDeckContext = createContext<CloudDeckContextValue>({
  spinConsole: () => {},
});

export function useCloudDeck() {
  return useContext(CloudDeckContext);
}

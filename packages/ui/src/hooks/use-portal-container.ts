"use client";

import * as React from "react";

const PortalContainerContext = React.createContext<HTMLElement | null | undefined>(undefined);

export function PortalContainerProvider({
  container,
  children,
}: {
  container: HTMLElement | null;
  children: React.ReactNode;
}) {
  return React.createElement(
    PortalContainerContext.Provider,
    { value: container },
    children,
  );
}

export function usePortalContainer(): HTMLElement | null | undefined {
  return React.useContext(PortalContainerContext);
}

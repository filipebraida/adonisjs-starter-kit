"use client";

import * as React from "react";

/**
 * The DOM node that Radix-based popovers (Select, Dropdown, Tooltip, …) should
 * portal into instead of `document.body`.
 *
 * Native `<dialog>` in modal mode creates a top-layer render context. Portals
 * that land on `document.body` sit BELOW that layer and receive no pointer
 * events — the dialog's modal shield eats every click. Rendering the popover
 * inside the dialog subtree puts it back in the same top-layer.
 *
 * Wrap a subtree with `<PortalContainerProvider container={node}>` (typically
 * the panel div of your modal) and every shadcn/Radix popover in that subtree
 * portals into `node` automatically.
 */
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

/**
 * Returns the current portal container (or `undefined` outside a provider,
 * meaning "use Radix's default of `document.body`"). Prefer forwarding an
 * explicit prop to this hook so callers can still override.
 */
export function usePortalContainer(): HTMLElement | null | undefined {
  return React.useContext(PortalContainerContext);
}

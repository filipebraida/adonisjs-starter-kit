import type * as React from "react";

import { cn } from "@workspace/ui/lib/utils";

/**
 * The bar inside a list's card, above the header: the slices of the list on
 * the left (`tabs`), and on the right the search, the filters button and what
 * else narrows it. On a phone the tabs take a line and the rest the next.
 */
function TableToolbar({
  tabs,
  children,
  className,
}: {
  tabs?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      data-slot="table-toolbar"
      className={cn("flex flex-wrap items-center gap-x-4 gap-y-3", className)}
    >
      {tabs}
      {children && (
        <div className="flex w-full flex-wrap items-center gap-2 md:ms-auto md:w-auto md:flex-nowrap">
          {children}
        </div>
      )}
    </div>
  );
}

/** The search of the bar: it takes the line on a phone, a fixed width beyond. */
function TableToolbarSearch({ children }: { children: React.ReactNode }) {
  return (
    <div
      data-slot="table-toolbar-search"
      className="min-w-0 flex-1 md:w-72 md:flex-none"
    >
      {children}
    </div>
  );
}

export { TableToolbar, TableToolbarSearch };

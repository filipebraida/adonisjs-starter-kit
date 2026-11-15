import * as React from "react";
import { X } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

/**
 * The row above a list: the search first, then the filters, and "Clear
 * filters" once something is filtered. It follows the width of its container,
 * not the window, since the sidebar takes ~250px: narrow, the search takes the
 * whole line and the filters wrap under it; from `@2xl` all fit on one line.
 */
function FilterBar({
  children,
  filtered,
  onClear,
  clearLabel = "Clear filters",
  actions,
  className,
}: {
  children: React.ReactNode;
  /** Whether a search or filter is applied: shows the clear button. */
  filtered: boolean;
  onClear: () => void;
  clearLabel?: string;
  /** Controls that are not filters (a view switch), pushed to the right. */
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div data-slot="filter-bar" className={cn("@container", className)}>
      <div
        className={cn(
          "flex flex-wrap items-center gap-2",
          "[&>[data-slot=search-input]]:basis-full",
          "@2xl:[&>[data-slot=search-input]]:max-w-80 @2xl:[&>[data-slot=search-input]]:basis-0 @2xl:[&>[data-slot=search-input]]:grow",
        )}
      >
        {children}
        {filtered && (
          <Button type="button" variant="ghost" size="sm" onClick={onClear}>
            <X data-icon="inline-start" />
            {clearLabel}
          </Button>
        )}
        {actions && (
          <div className="ms-auto flex items-center gap-2">{actions}</div>
        )}
      </div>
    </div>
  );
}

export { FilterBar };

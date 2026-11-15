import * as React from "react";
import { Search, X } from "lucide-react";

import { Input } from "@workspace/ui/components/input";
import { cn } from "@workspace/ui/lib/utils";

/**
 * A search field: the magnifier inside on the left and, once there is text,
 * an X that clears it (Esc clears too). The browser's own clear button is
 * hidden so there is one X. Debouncing is the caller's: see `useSearchBox`.
 */
function SearchInput({
  value,
  onValueChange,
  clearLabel = "Clear search",
  className,
  disabled,
  ...props
}: Omit<React.ComponentProps<"input">, "value" | "onChange" | "type"> & {
  value: string;
  onValueChange: (value: string) => void;
  /** The X's accessible name. */
  clearLabel?: string;
}) {
  return (
    <div data-slot="search-input" className={cn("relative w-full", className)}>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        type="search"
        value={value}
        disabled={disabled}
        onChange={(event) => onValueChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Escape" && value !== "") {
            event.preventDefault();
            onValueChange("");
          }
        }}
        className="pr-8 pl-8 [&::-webkit-search-cancel-button]:appearance-none"
        {...props}
      />
      {value !== "" && !disabled && (
        <button
          type="button"
          aria-label={clearLabel}
          onClick={() => onValueChange("")}
          className="absolute top-1/2 right-1.5 inline-flex size-6 -translate-y-1/2 cursor-pointer items-center justify-center rounded-md text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          <X aria-hidden="true" className="size-3.5" />
        </button>
      )}
    </div>
  );
}

export { SearchInput };

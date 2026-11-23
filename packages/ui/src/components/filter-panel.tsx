import type * as React from "react";
import { Check, ListFilter } from "lucide-react";

import { cn } from "@workspace/ui/lib/utils";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";

interface FilterGroup {
  id: string;
  label: string;
  options: { value: string; label: string }[];
  /** `single` keeps at most one option on (a radio group); `multiple` by default. */
  select?: "single" | "multiple";
}

/** The chosen values of each group, by group id. */
type FilterValues = Record<string, string[]>;

/** The button that opens the panel: it carries how many filters are on. */
function FiltersButton({
  count,
  open,
  children,
  ...props
}: Omit<React.ComponentProps<typeof Button>, "variant"> & {
  count: number;
  open: boolean;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      aria-expanded={open}
      data-slot="filters-button"
      {...props}
    >
      <ListFilter data-icon="inline-start" />
      {children}
      {count > 0 && <Badge size="count">{count}</Badge>}
    </Button>
  );
}

interface FilterPanelProps {
  groups: FilterGroup[];
  value: FilterValues;
  onValueChange: (value: FilterValues) => void;
  /** What the filters leave on the list: "2 users found." */
  summary: React.ReactNode;
  onClear: () => void;
  onClose: () => void;
  clearLabel?: string;
  closeLabel?: string;
  className?: string;
}

/**
 * Every filter of a list in one place, inside the list's card: a group per
 * column, each option a pill that toggles. Nothing is applied on a button: the
 * list follows as the pills change, and the panel says how many rows are left.
 */
function FilterPanel({
  groups,
  value,
  onValueChange,
  summary,
  onClear,
  onClose,
  clearLabel = "Clear filters",
  closeLabel = "Done",
  className,
}: FilterPanelProps) {
  const toggle = (group: FilterGroup, option: string) => {
    const chosen = value[group.id] ?? [];
    const on = chosen.includes(option);
    const next =
      group.select === "single"
        ? on
          ? []
          : [option]
        : on
          ? chosen.filter((item) => item !== option)
          : [...chosen, option];
    onValueChange({ ...value, [group.id]: next });
  };

  return (
    <div data-slot="filter-panel" className={cn("px-4 pt-4", className)}>
      <div
        className={cn(
          "grid gap-x-6 gap-y-5",
          // A lone group takes the row; several share it, a column each.
          groups.length > 1 && "sm:grid-cols-2",
          groups.length > 2 && "lg:grid-cols-4",
        )}
      >
        {groups.map((group) => (
          <fieldset
            key={group.id}
            role={group.select === "single" ? "radiogroup" : undefined}
            className="min-w-0"
          >
            <legend className="mb-2 text-xs font-semibold">
              {group.label}
            </legend>
            <div className="flex flex-wrap gap-1.5">
              {group.options.map((option) => {
                const on = (value[group.id] ?? []).includes(option.value);
                return (
                  <button
                    key={option.value}
                    type="button"
                    role={group.select === "single" ? "radio" : "checkbox"}
                    aria-checked={on}
                    onClick={() => toggle(group, option.value)}
                    className="flex min-h-7 max-w-full items-center gap-1.5 rounded-full border bg-card px-2.5 py-1 text-left text-xs font-medium outline-none hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring aria-checked:border-primary aria-checked:bg-accent aria-checked:text-accent-foreground"
                  >
                    {on && <Check className="size-3.5 shrink-0" aria-hidden />}
                    {option.label}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3 border-t py-3">
        <p
          className="text-xs text-muted-foreground"
          role="status"
          aria-live="polite"
        >
          {summary}
        </p>
        <div className="ms-auto flex items-center gap-2">
          <Button type="button" variant="ghost" onClick={onClear}>
            {clearLabel}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>
            {closeLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

export { FilterPanel, FiltersButton, type FilterGroup, type FilterValues };

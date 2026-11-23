import { cn } from "@workspace/ui/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";

interface FilterTabOption<TValue extends string> {
  value: TValue;
  label: string;
  /** How many rows fall under this tab. */
  count?: number;
}

interface FilterTabsProps<TValue extends string> {
  /** What the tabs filter by, for assistive tech: "Status". */
  label: string;
  options: FilterTabOption<TValue>[];
  value: TValue;
  onValueChange: (value: TValue) => void;
  className?: string;
}

/**
 * The slices of a list, each with its count: tabs on a wide screen, one select
 * on a phone, where a row of tabs would not fit.
 */
function FilterTabs<TValue extends string>({
  label,
  options,
  value,
  onValueChange,
  className,
}: FilterTabsProps<TValue>) {
  return (
    <div data-slot="filter-tabs" className={cn("min-w-0", className)}>
      <div
        role="radiogroup"
        aria-label={label}
        className="hidden items-center gap-1 md:flex"
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={option.value === value}
            onClick={() => onValueChange(option.value)}
            className="flex h-8 items-center gap-1.5 rounded-md px-2.5 text-sm font-medium whitespace-nowrap text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring aria-checked:bg-muted aria-checked:text-foreground"
          >
            {option.label}
            {option.count !== undefined && (
              <span className="text-xs font-normal text-muted-foreground tabular-nums">
                {option.count}
              </span>
            )}
          </button>
        ))}
      </div>
      <div className="md:hidden">
        <Select
          value={value}
          onValueChange={(next) => onValueChange(next as TValue)}
        >
          <SelectTrigger aria-label={label} className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.count === undefined
                  ? option.label
                  : `${option.label} · ${option.count}`}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

export { FilterTabs, type FilterTabOption };

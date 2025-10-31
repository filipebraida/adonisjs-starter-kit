import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { PlusCircle } from "lucide-react";

import { cn } from "@workspace/ui/lib/utils";
import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@workspace/ui/components/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { Separator } from "@workspace/ui/components/separator";
import { Label } from "@workspace/ui/components/label";
import { Checkbox } from "@workspace/ui/components/checkbox";

export type CheckboxOption<T extends string> = {
  label: string;
  value: T;
  icon?: LucideIcon;
  counts?: number;
};

type CheckboxFilterProps<T extends string> = {
  title: string;
  options: readonly CheckboxOption<T>[];
  value: readonly T[];
  onChange: (next: T[]) => void;
  searchPlaceholder?: string;
  className?: string;
  emptyMessage?: string;
  showSelectedBadges?: boolean;
  maxBadgesInTrigger?: number;
  showClearButton?: boolean;
  clearLabel?: string;
};

export function CheckboxFilter<T extends string>({
  title,
  options,
  value,
  onChange,
  searchPlaceholder,
  className,
  emptyMessage = "Sem resultados.",
  showSelectedBadges = true,
  maxBadgesInTrigger = 2,
  showClearButton = true,
  clearLabel = "Limpar filtro",
}: CheckboxFilterProps<T>) {
  const selectedCount = value.length;

  const toggle = (v: T) => {
    const set = new Set(value);
    if (set.has(v)) set.delete(v);
    else set.add(v);
    onChange(Array.from(set));
  };

  const selectedOptions = React.useMemo(
    () => options.filter((o) => value.includes(o.value)),
    [options, value]
  );

  const visibleBadges = selectedOptions.slice(0, maxBadgesInTrigger);
  const rest = Math.max(0, selectedOptions.length - visibleBadges.length);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn("h-8 border-dashed", className)}
        >
          <PlusCircle className="mr-1 h-4 w-4" />
          {title}
          {selectedCount > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedCount}
              </Badge>
              <div className="hidden items-center space-x-1 lg:flex">
                {showSelectedBadges &&
                  visibleBadges.map((opt) => (
                    <Badge
                      key={opt.value}
                      variant="secondary"
                      className="rounded-sm px-1 font-normal"
                    >
                      {opt.label}
                    </Badge>
                  ))}
                {rest > 0 && (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    +{rest}
                  </Badge>
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[280px] p-0" align="start">
        <Command>
          <CommandInput placeholder={searchPlaceholder ?? title} />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>

            <CommandGroup>
              {options.map((option) => {
                const Icon = option.icon;
                const id = `multi-select-${String(option.value)}`;
                const checked = value.includes(option.value);

                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => toggle(option.value)}
                    value={`${option.label} ${option.value}`}
                  >
                    <Checkbox
                      id={id}
                      checked={checked}
                      onCheckedChange={() => toggle(option.value)}
                      className="mr-2 cursor-pointer"
                    />
                    {Icon && <Icon className="mr-2 h-4 w-4" />}
                    <Label htmlFor={id}>{option.label}</Label>

                    {!!option.counts && (
                      <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
                        {option.counts}
                      </span>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>

            {showClearButton && value.length > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => onChange([])}
                    className="justify-center text-center text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    {clearLabel}
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

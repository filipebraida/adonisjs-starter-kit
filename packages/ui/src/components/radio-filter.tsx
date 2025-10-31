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
} from "@workspace/ui/components/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@workspace/ui/components/popover";
import { Separator } from "@workspace/ui/components/separator";
import {
  RadioGroup,
  RadioGroupItem,
} from "@workspace/ui/components/radio-group";
import { Label } from "@workspace/ui/components/label";

export type SingleSelectOption<T extends string> = {
  label: string;
  value: T;
  icon?: LucideIcon;
  counts?: number;
};

type RadioFilterProps<T extends string> = {
  title: string;
  options: readonly SingleSelectOption<T>[];
  value: T | "";
  onChange: (next: T | "") => void;
  searchPlaceholder?: string;
  className?: string;
  emptyMessage?: string;
};

export function RadioFilter<T extends string>({
  title,
  options,
  value,
  onChange,
  searchPlaceholder,
  className,
  emptyMessage = "Nenhum resultado.",
}: RadioFilterProps<T>) {
  const selected = options.find((o) => o.value === value);
  const selectedCount = value ? 1 : 0;

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
              <div className="hidden space-x-1 lg:flex">
                <Badge
                  variant="secondary"
                  className="rounded-sm px-1 font-normal"
                >
                  {selected?.label}
                </Badge>
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[280px] p-0" align="start">
        <Command>
          <CommandInput
            accessKey="label"
            placeholder={searchPlaceholder ?? title}
          />
          <CommandList>
            <CommandEmpty>{emptyMessage}</CommandEmpty>

            <RadioGroup
              value={value || undefined}
              onValueChange={(v) => onChange(v as T)}
            >
              <CommandGroup>
                {options.map((option) => {
                  const Icon = option.icon;
                  const id = `single-select-${String(option.value)}`;
                  return (
                    <CommandItem
                      key={option.value}
                      onSelect={() => onChange(option.value)}
                      value={`${option.label} ${option.value}`}
                      className="cursor-pointer"
                    >
                      <RadioGroupItem
                        value={option.value}
                        id={id}
                        className="mr-2"
                      />
                      {Icon && <Icon className="mr-2 h-4 w-4" />}
                      <Label htmlFor={id} className="cursor-pointer">
                        {option.label}
                      </Label>

                      {!!option.counts && (
                        <span className="ml-auto flex h-4 w-4 items-center justify-center font-mono text-xs">
                          {option.counts}
                        </span>
                      )}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </RadioGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

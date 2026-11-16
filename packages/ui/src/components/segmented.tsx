import * as React from "react";
import { RadioGroup as RadioGroupPrimitive } from "radix-ui";

import { cn } from "@workspace/ui/lib/utils";

interface SegmentedOption<Value extends string> {
  value: Value;
  /** The segment's content: a word, or an icon when `title` names it. */
  label: React.ReactNode;
  /** Names an icon-only segment (its tooltip and accessible name). */
  title?: string;
  disabled?: boolean;
}

interface SegmentedProps<Value extends string> {
  /** Names the group for assistive technology (the control has no visible legend). */
  label: string;
  options: readonly SegmentedOption<Value>[];
  /** The chosen value, controlled; `null` when none is chosen yet. */
  value?: Value | null;
  defaultValue?: Value;
  onValueChange?: (value: Value) => void;
  /** Stretches the segments over the container's width. */
  fill?: boolean;
  disabled?: boolean;
}

/**
 * One choice among two or three that applies the moment it is picked (theme,
 * language, a view): a grey track whose chosen segment is raised. A radio
 * group, so the arrow keys move between the segments.
 */
function Segmented<Value extends string>({
  label,
  options,
  value,
  defaultValue,
  onValueChange,
  fill = false,
  disabled,
}: SegmentedProps<Value>) {
  return (
    <RadioGroupPrimitive.Root
      data-slot="segmented"
      data-fill={fill || undefined}
      aria-label={label}
      orientation="horizontal"
      value={value === null ? "" : value}
      defaultValue={defaultValue}
      disabled={disabled}
      onValueChange={(next) => {
        const option = options.find((candidate) => candidate.value === next);
        if (option) onValueChange?.(option.value);
      }}
      className={cn(
        "inline-flex max-w-full items-center gap-0.5 rounded-lg bg-muted p-0.5",
        fill ? "flex w-full" : "w-fit",
      )}
    >
      {options.map((option) => (
        <RadioGroupPrimitive.Item
          key={option.value}
          value={option.value}
          disabled={option.disabled}
          title={option.title}
          aria-label={option.title}
          data-slot="segmented-item"
          className={cn(
            "inline-flex h-7 shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md px-2.5 text-xs font-medium whitespace-nowrap text-muted-foreground transition-colors outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 data-[state=checked]:bg-background data-[state=checked]:text-foreground data-[state=checked]:shadow-xs data-[state=checked]:ring-1 data-[state=checked]:ring-border [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
            fill && "flex-1",
          )}
        >
          {option.label}
        </RadioGroupPrimitive.Item>
      ))}
    </RadioGroupPrimitive.Root>
  );
}

export { Segmented, type SegmentedOption, type SegmentedProps };

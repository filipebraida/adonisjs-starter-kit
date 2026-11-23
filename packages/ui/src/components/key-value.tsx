import * as React from "react";

import { cn } from "@workspace/ui/lib/utils";

/** Read-only data as label/value rows with hairline dividers. */
function KeyValueList({ className, ...props }: React.ComponentProps<"dl">) {
  return (
    <dl
      data-slot="key-value-list"
      className={cn("divide-y divide-border text-sm", className)}
      {...props}
    />
  );
}

interface KeyValueProps extends Omit<React.ComponentProps<"div">, "children"> {
  label: React.ReactNode;
  children: React.ReactNode;
  /** `mono` for codes, ids and times: the digits align. */
  mono?: boolean;
}

function KeyValue({
  label,
  children,
  mono = false,
  className,
  ...props
}: KeyValueProps) {
  return (
    <div
      data-slot="key-value"
      className={cn(
        "flex items-baseline justify-between gap-6 py-2.5 first:pt-0 last:pb-0",
        className,
      )}
      {...props}
    >
      <dt className="shrink-0 text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "min-w-0 text-right font-medium break-words",
          mono && "font-mono tabular-nums",
        )}
      >
        {children}
      </dd>
    </div>
  );
}

export { KeyValueList, KeyValue };

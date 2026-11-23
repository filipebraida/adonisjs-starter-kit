import { ArrowRight } from "lucide-react";

import { cn } from "@workspace/ui/lib/utils";

/**
 * One field's change, as a record of what happened: the field, the old value
 * struck out, the new one. A value that did not exist before shows only the
 * new one; one that was cleared shows `emptyLabel`.
 */
function ValueChange({
  field,
  from,
  to,
  emptyLabel = "empty",
  className,
}: {
  field: string;
  from: string | null;
  to: string | null;
  emptyLabel?: string;
  className?: string;
}) {
  return (
    <div
      data-slot="value-change"
      className={cn("flex min-w-0 items-center gap-1.5 text-xs", className)}
    >
      <span className="shrink-0 text-muted-foreground">{field}</span>
      {from !== null && (
        <del className="max-w-40 truncate rounded-sm bg-destructive-subtle px-1.5 py-0.5 font-mono text-destructive">
          {from}
        </del>
      )}
      <ArrowRight
        className="size-3 shrink-0 text-muted-foreground"
        aria-hidden
      />
      <ins className="max-w-40 truncate rounded-sm bg-success-subtle px-1.5 py-0.5 font-mono text-success-foreground no-underline">
        {to ?? emptyLabel}
      </ins>
    </div>
  );
}

export { ValueChange };

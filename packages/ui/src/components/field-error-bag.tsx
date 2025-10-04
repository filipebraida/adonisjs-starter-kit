import * as React from "react";
import { FieldError } from "@workspace/ui/components/field";

export type InertiaErrors<T extends Record<string, any>> = Partial<
  Record<keyof T, string | string[]>
>;

export function FieldErrorBag<T extends Record<string, any>>({
  errors,
  field,
  label,
  className,
}: {
  errors: InertiaErrors<T> | undefined;
  field: keyof T;
  label?: React.ReactNode;
  className?: string;
}) {
  if (!errors) return null;
  const val = errors[field];
  if (!val) return null;

  const toMsg = (m: unknown) => (label ? `${label}: ${String(m)}` : String(m));

  const issues = Array.isArray(val)
    ? val.filter(Boolean).map((m) => ({ message: toMsg(m) }))
    : [{ message: toMsg(val) }];

  return <FieldError errors={issues} className={className} />;
}

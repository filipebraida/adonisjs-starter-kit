import { Table } from "@tanstack/react-table";
import { X } from "lucide-react";

import { Button } from "@workspace/ui/components/button";

interface DataTableToolbarProps<TData> {
  table: Table<TData>;
  additionalFilters?: React.ReactNode;
  t: (key: string, options?: Record<string, unknown>) => string;
}

export function DataTableToolbar<TData>({
  table,
  additionalFilters,
  t,
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {additionalFilters}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => table.resetColumnFilters()}
            className="h-8 px-2 lg:px-3"
          >
            {t("users.index.table.row_actions.clear")}
            <X />
          </Button>
        )}
      </div>
    </div>
  );
}

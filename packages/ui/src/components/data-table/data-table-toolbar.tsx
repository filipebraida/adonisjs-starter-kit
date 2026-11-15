import type { RowData } from "@tanstack/react-table";
import type { Table } from "@workspace/ui/components/data-table/data-table";
import { X } from "lucide-react";

import { Button } from "@workspace/ui/components/button";

interface DataTableToolbarProps<TData extends RowData> {
  table: Table<TData>;
  additionalFilters?: React.ReactNode;
  clearLabel?: string;
}

export function DataTableToolbar<TData extends RowData>({
  table,
  additionalFilters,
  clearLabel = "Clear",
}: DataTableToolbarProps<TData>) {
  const isFiltered = table.state.columnFilters.length > 0;

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
            {clearLabel}
            <X />
          </Button>
        )}
      </div>
    </div>
  );
}

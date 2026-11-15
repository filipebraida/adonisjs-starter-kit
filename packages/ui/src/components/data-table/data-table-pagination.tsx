import type { RowData } from "@tanstack/react-table";
import type {
  DataTableLabels,
  Table,
} from "@workspace/ui/components/data-table/data-table";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";

interface DataTablePaginationProps<TData extends RowData> {
  table: Table<TData>;
  labels: DataTableLabels;
}

export function DataTablePagination<TData extends RowData>({
  table,
  labels,
}: DataTablePaginationProps<TData>) {
  const pageIndex = table.state.pagination.pageIndex;
  const pageCount = table.getPageCount();
  const pageSize = table.state.pagination.pageSize;

  return (
    <div className="flex flex-col gap-3 px-2 sm:flex-row sm:items-center sm:justify-end sm:gap-6 lg:gap-8">
      <div className="hidden items-center gap-2 sm:flex">
        <p className="text-sm font-medium">{labels.rowsPerPage}</p>
        <Select
          value={`${pageSize}`}
          onValueChange={(value) => table.setPageSize(Number(value))}
        >
          <SelectTrigger className="h-8 w-[70px]">
            <SelectValue placeholder={pageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {[10, 20, 30, 40, 50].map((size) => (
              <SelectItem key={size} value={`${size}`}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center justify-between gap-3 sm:gap-2">
        <div className="text-sm font-medium">
          {labels.pageOf(pageIndex + 1, pageCount)}
        </div>
        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">{labels.goFirstPage}</span>
            <ChevronsLeft />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <span className="sr-only">{labels.goPreviousPage}</span>
            <ChevronLeft />
          </Button>
          <Button
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">{labels.goNextPage}</span>
            <ChevronRight />
          </Button>
          <Button
            variant="outline"
            className="hidden h-8 w-8 p-0 lg:flex"
            onClick={() => table.setPageIndex(pageCount - 1)}
            disabled={!table.getCanNextPage()}
          >
            <span className="sr-only">{labels.goLastPage}</span>
            <ChevronsRight />
          </Button>
        </div>
      </div>
    </div>
  );
}

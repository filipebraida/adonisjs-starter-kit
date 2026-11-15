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

const PAGE_SIZES = [10, 20, 30, 40, 50];

/** The page numbers to show: the first, the last, and the current one with its neighbours. */
export function pageItems(
  current: number,
  total: number,
): (number | "gap-before" | "gap-after")[] {
  if (total <= 7) return Array.from({ length: total }, (_, index) => index + 1);
  const items: (number | "gap-before" | "gap-after")[] = [1];
  const low = Math.max(2, current - 1);
  const high = Math.min(total - 1, current + 1);
  if (low > 2) items.push("gap-before");
  for (let page = low; page <= high; page++) items.push(page);
  if (high < total - 1) items.push("gap-after");
  items.push(total);
  return items;
}

interface DataTablePaginationProps<TData extends RowData> {
  table: Table<TData>;
  labels: DataTableLabels;
  /** Rows across every page; without it the range is not shown. */
  total?: number;
}

export function DataTablePagination<TData extends RowData>({
  table,
  labels,
  total,
}: DataTablePaginationProps<TData>) {
  const current = table.state.pagination.pageIndex + 1;
  const pageCount = Math.max(1, table.getPageCount());
  const pageSize = table.state.pagination.pageSize;
  const from = total === 0 ? 0 : (current - 1) * pageSize + 1;
  const to = total === undefined ? 0 : Math.min(current * pageSize, total);

  return (
    <div className="flex flex-wrap items-center gap-3 px-2">
      <div className="hidden items-center gap-2 text-sm text-muted-foreground sm:flex">
        <span>{labels.rowsPerPage}</span>
        <Select
          value={`${pageSize}`}
          onValueChange={(value) => table.setPageSize(Number(value))}
        >
          <SelectTrigger size="sm">
            <SelectValue placeholder={pageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {PAGE_SIZES.map((size) => (
              <SelectItem key={size} value={`${size}`}>
                {size}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {total !== undefined && total > 0 && (
        <div className="hidden text-sm text-muted-foreground tabular-nums md:block">
          {labels.range(from, to, total)}
        </div>
      )}

      <nav
        aria-label={labels.pagination}
        className="ms-auto flex items-center gap-1"
      >
        <Button
          variant="outline"
          size="icon-sm"
          className="hidden md:inline-flex"
          onClick={() => table.setPageIndex(0)}
          disabled={!table.getCanPreviousPage()}
          aria-label={labels.goFirstPage}
        >
          <ChevronsLeft />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
          aria-label={labels.goPreviousPage}
        >
          <ChevronLeft />
        </Button>

        <div className="hidden items-center gap-1 sm:flex">
          {pageItems(current, pageCount).map((item) =>
            typeof item === "string" ? (
              <span
                key={item}
                aria-hidden="true"
                className="px-1.5 text-sm text-muted-foreground"
              >
                …
              </span>
            ) : (
              <Button
                key={item}
                variant={item === current ? "default" : "ghost"}
                size="sm"
                aria-current={item === current ? "page" : undefined}
                aria-label={labels.goToPage(item)}
                onClick={() => table.setPageIndex(item - 1)}
              >
                <span className="tabular-nums">{item}</span>
              </Button>
            ),
          )}
        </div>

        <span className="px-2 text-sm text-muted-foreground tabular-nums sm:hidden">
          {labels.pageOf(current, pageCount)}
        </span>

        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
          aria-label={labels.goNextPage}
        >
          <ChevronRight />
        </Button>
        <Button
          variant="outline"
          size="icon-sm"
          className="hidden md:inline-flex"
          onClick={() => table.setPageIndex(pageCount - 1)}
          disabled={!table.getCanNextPage()}
          aria-label={labels.goLastPage}
        >
          <ChevronsRight />
        </Button>
      </nav>
    </div>
  );
}

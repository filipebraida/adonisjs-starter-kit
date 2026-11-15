import {
  columnFacetingFeature,
  columnFilteringFeature,
  columnVisibilityFeature,
  createFacetedRowModel,
  createFacetedUniqueValues,
  createFilteredRowModel,
  createPaginatedRowModel,
  filterFn_arrIncludesSome,
  filterFn_includesString,
  flexRender,
  metaHelper,
  rowPaginationFeature,
  rowSelectionFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type Column as TanstackColumn,
  type ColumnDef as TanstackColumnDef,
  type ColumnFiltersState,
  type OnChangeFn,
  type PaginationState,
  type ReactTable,
  type Row as TanstackRow,
  type RowData,
  type SortingState,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { DataTablePagination } from "@workspace/ui/components/data-table/data-table-pagination";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useState } from "react";

export interface ColumnMeta {
  columnClasses?: string;
}

/**
 * The table features every DataTable registers. v9 exposes an API (sorting,
 * filtering, faceting, selection, pagination) only when its feature is listed
 * here; the row models apply when the table is local, and the manual flags
 * skip them for a remote table whose rows arrive already processed.
 */
export const dataTableFeatures = tableFeatures({
  columnVisibilityFeature,
  rowSelectionFeature,
  rowSortingFeature,
  columnFilteringFeature,
  columnFacetingFeature,
  rowPaginationFeature,
  filteredRowModel: createFilteredRowModel(),
  facetedRowModel: createFacetedRowModel(),
  facetedUniqueValues: createFacetedUniqueValues(),
  paginatedRowModel: createPaginatedRowModel(),
  filterFns: {
    includesString: filterFn_includesString,
    arrIncludesSome: filterFn_arrIncludesSome,
  },
  columnMeta: metaHelper<ColumnMeta>(),
});

export type DataTableFeatures = typeof dataTableFeatures;

// The v9 types take the feature set first; these keep screens on `ColumnDef<Row>`.
export type ColumnDef<
  TData extends RowData,
  TValue = unknown,
> = TanstackColumnDef<DataTableFeatures, TData, TValue>;
export type Column<TData extends RowData, TValue = unknown> = TanstackColumn<
  DataTableFeatures,
  TData,
  TValue
>;
export type Row<TData extends RowData> = TanstackRow<DataTableFeatures, TData>;
export type Table<TData extends RowData> = ReactTable<DataTableFeatures, TData>;

interface DataTableProps<TData extends RowData> {
  columns: ColumnDef<TData>[];
  data: TData[];
  className?: string;
  Toolbar?: React.ComponentType<{ table: Table<TData> }>;
  labels?: Partial<DataTableLabels>;
  remoteTableOptions?: RemoteTableOptions;
}

/** The table's own texts. English by default; an app passes its translations. */
export interface DataTableLabels {
  noResults: string;
  rowsPerPage: string;
  pageOf: (current: number, total: number) => string;
  goFirstPage: string;
  goPreviousPage: string;
  goNextPage: string;
  goLastPage: string;
}

export const defaultDataTableLabels: DataTableLabels = {
  noResults: "No results found.",
  rowsPerPage: "Rows per page",
  pageOf: (current, total) => `Page ${current} of ${total}`,
  goFirstPage: "Go to first page",
  goPreviousPage: "Go to previous page",
  goNextPage: "Go to next page",
  goLastPage: "Go to last page",
};

export interface RemoteTableOptions {
  pageCount: number;
  state: {
    pagination: { pageIndex: number; pageSize: number };
    sorting?: SortingState;
  };
  onPaginationChange: OnChangeFn<PaginationState>;
  onSortingChange?: OnChangeFn<SortingState>;
}

export interface DataTableRowActionsProps<TData extends RowData> {
  row: Row<TData>;
}

export function DataTable<TData extends RowData>({
  columns,
  data,
  Toolbar,
  labels: customLabels,
  remoteTableOptions,
  className = "table-fixed md:table-auto",
}: DataTableProps<TData>) {
  const labels = { ...defaultDataTableLabels, ...customLabels };
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [localPagination, setLocalPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const [localSorting, setLocalSorting] = useState<SortingState>([]);

  const isRemote = !!remoteTableOptions;

  const table = useTable({
    features: dataTableFeatures,
    data,
    columns,

    manualPagination: isRemote,
    manualSorting: isRemote,
    manualFiltering: isRemote,

    pageCount: isRemote ? remoteTableOptions!.pageCount : undefined,

    state: {
      pagination: isRemote
        ? remoteTableOptions!.state.pagination
        : localPagination,
      columnFilters: isRemote ? undefined : columnFilters,
      sorting: isRemote
        ? (remoteTableOptions!.state.sorting ?? [])
        : localSorting,
    },

    onColumnFiltersChange: setColumnFilters,

    onPaginationChange: isRemote
      ? remoteTableOptions!.onPaginationChange
      : setLocalPagination,

    onSortingChange: isRemote
      ? remoteTableOptions!.onSortingChange
      : setLocalSorting,
  });

  return (
    <div className="space-y-4">
      {Toolbar && <Toolbar table={table} />}
      <div className="rounded-md border">
        <Table className={className}>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const canSort = header.column.getCanSort();
                  const sortDir = header.column.getIsSorted();
                  return (
                    <TableHead
                      key={header.id}
                      className={header.column.columnDef.meta?.columnClasses}
                    >
                      {header.isPlaceholder ? null : canSort ? (
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-1 select-none hover:text-foreground"
                        >
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                          {sortDir === "asc" ? (
                            <ArrowUp className="size-3.5" />
                          ) : sortDir === "desc" ? (
                            <ArrowDown className="size-3.5" />
                          ) : (
                            <ArrowUpDown className="size-3.5 opacity-40" />
                          )}
                        </button>
                      ) : (
                        flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cell.column.columnDef.meta?.columnClasses}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  {labels.noResults}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination labels={labels} table={table} />
    </div>
  );
}

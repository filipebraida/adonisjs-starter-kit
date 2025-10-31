import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  OnChangeFn,
  PaginationState,
  Row,
  useReactTable,
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
import { useState } from "react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  className?: string;
  Toolbar?: React.ComponentType<{
    table: ReturnType<typeof useReactTable<TData>>;
  }>;
  t: (key: string, options?: Record<string, unknown>) => string;
  remoteTableOptions?: RemoteTableOptions;
}

export interface RemoteTableOptions {
  pageCount: number;
  state: {
    pagination: { pageIndex: number; pageSize: number };
  };
  onPaginationChange: OnChangeFn<PaginationState>;
}

export interface ColumnMeta {
  columnClasses: string;
}

export interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  Toolbar,
  t,
  remoteTableOptions,
  className = "table-fixed md:table-auto",
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [localPagination, setLocalPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });

  const isRemote = !!remoteTableOptions;

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),

    manualPagination: isRemote,
    manualSorting: isRemote,
    manualFiltering: isRemote,

    pageCount: isRemote ? remoteTableOptions!.pageCount : undefined,

    state: {
      pagination: isRemote
        ? remoteTableOptions!.state.pagination
        : localPagination,
      columnFilters: isRemote ? undefined : columnFilters,
    },

    onColumnFiltersChange: setColumnFilters,

    onPaginationChange: isRemote
      ? remoteTableOptions!.onPaginationChange
      : setLocalPagination,

    ...(isRemote ? {} : { getPaginationRowModel: getPaginationRowModel() }),

    getFilteredRowModel: getFilteredRowModel(),
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
                  return (
                    <TableHead
                      key={header.id}
                      className={
                        (header.column.columnDef.meta as ColumnMeta)
                          ?.columnClasses
                      }
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
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
                      className={
                        (cell.column.columnDef.meta as ColumnMeta)
                          ?.columnClasses
                      }
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
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
                  {t("common.table.no_results")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination t={t} table={table} />
    </div>
  );
}

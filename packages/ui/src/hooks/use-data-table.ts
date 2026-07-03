import type {
  OnChangeFn,
  PaginationState,
  SortingState,
  Updater,
} from "@tanstack/react-table";

import type { RemoteTableOptions } from "@workspace/ui/components/data-table/data-table";

export type PaginatorMeta = {
  perPage: number;
  currentPage: number;
  lastPage: number;
  total: number;
  firstPage?: number;
  firstPageUrl?: string;
  lastPageUrl?: string;
  nextPageUrl?: string | null;
  previousPageUrl?: string | null;
};

export type VisitFn = (args: { page: number; perPage: number }) => void;

type UseDataTableOpts = {
  data: {
    metadata: PaginatorMeta;
  };
  visit: VisitFn;
  pageParam?: string;
  perPageParam?: string;
  sorting?: {
    state: SortingState;
    onChange: OnChangeFn<SortingState>;
  };
};

export function useDataTable({
  data,
  visit,
  sorting,
}: UseDataTableOpts): RemoteTableOptions {
  const pageIndex = Math.max(0, (data.metadata.currentPage ?? 1) - 1);
  const pageSize = data.metadata.perPage;
  const pageCount = Math.max(1, data.metadata.lastPage);

  return {
    pageCount,
    state: {
      pagination: { pageIndex, pageSize },
      sorting: sorting?.state,
    },
    onPaginationChange: (updater: Updater<PaginationState>) => {
      const curr: PaginationState = { pageIndex, pageSize };
      const next = typeof updater === "function" ? updater(curr) : updater;

      if (next.pageSize !== curr.pageSize) {
        visit({
          page: 1,
          perPage: next.pageSize,
        });

        return;
      }

      visit({
        page: next.pageIndex + 1,
        perPage: next.pageSize,
      });
    },
    onSortingChange: sorting?.onChange,
  };
}

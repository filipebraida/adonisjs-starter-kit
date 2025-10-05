import { useState } from "react";

import type {
  ColumnFiltersState,
  PaginationState,
  Updater,
} from "@tanstack/react-table";

import type { RemoteTableOptions } from "@workspace/ui/components/data-table/data-table";

export type PaginatorMeta = {
  perPage: number;
  currentPage: number;
  lastPage: number;
  total: number;
  firstPage?: number;
};

export type VisitFn = (args: {
  url?: string;
  params?: Record<string, string | string[]>;
}) => void;

type ParamsRecord = Record<string, string | string[]>;

function toParams(items: ColumnFiltersState): ParamsRecord {
  const out: ParamsRecord = {};
  for (const it of items) {
    const k = String(it.id);
    const v = it.value as string | string[] | undefined | null;
    if (Array.isArray(v)) {
      if (v.length) out[k] = v.map(String);
    } else if (v != null && v !== "") {
      out[k] = String(v);
    }
  }
  return out;
}

function upsert(
  items: ColumnFiltersState,
  id: string,
  value: string | string[]
) {
  const next = items.filter((f) => f.id !== id);
  const isEmpty = Array.isArray(value) ? value.length === 0 : value === "";
  if (!isEmpty) next.push({ id, value });
  return next;
}

type UseDataTableOpts = {
  meta: PaginatorMeta;
  visit: VisitFn;
  baseUrl: string;
  currentSearch?: string;
  pageParam?: string;
  perPageParam?: string;
};

export function useDataTable({
  meta,
  visit,
  baseUrl,
  currentSearch = "",
  pageParam = "page",
  perPageParam = "perPage",
}: UseDataTableOpts): RemoteTableOptions {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(() => {
    const searchParams = new URLSearchParams(
      currentSearch.startsWith("?") ? currentSearch.slice(1) : currentSearch
    );
    const initial: ColumnFiltersState = [];

    for (const k of new Set(searchParams.keys())) {
      const all = searchParams.getAll(k);
      const value = all.length > 1 ? all : (all[0] ?? "");
      initial.push({ id: k, value });
    }

    return initial;
  });

  const pageIndex = Math.max(0, (meta.currentPage ?? 1) - 1);
  const pageSize = meta.perPage;
  const pageCount = Math.max(1, meta.lastPage);

  function visitFrom(items: ColumnFiltersState) {
    visit({ url: baseUrl, params: toParams(items) });
  }

  return {
    pageCount,
    columnFilters,
    state: { pagination: { pageIndex, pageSize } },
    onColumnFiltersChange: (updater: Updater<ColumnFiltersState>) => {
      setColumnFilters((prev) => {
        const prevVisible = prev.filter(
          (f) => f.id !== pageParam && f.id !== perPageParam
        );
        const nextVisible =
          typeof updater === "function" ? updater(prevVisible) : updater;

        const perPage =
          (prev.find((f) => f.id === perPageParam)?.value as string) ??
          String(meta.perPage);

        const merged: ColumnFiltersState = [
          ...nextVisible,
          // reset page when filters change
          { id: pageParam, value: "1" },
          { id: perPageParam, value: perPage },
        ];

        visitFrom(merged);

        return merged;
      });
    },
    onPaginationChange: (updater: Updater<PaginationState>) => {
      setColumnFilters((prev) => {
        const curr: PaginationState = { pageIndex, pageSize };
        const next = typeof updater === "function" ? updater(curr) : updater;

        let merged = prev;
        if (next.pageSize !== curr.pageSize) {
          merged = upsert(merged, perPageParam, String(next.pageSize));
          merged = upsert(merged, pageParam, "1");
        } else if (next.pageIndex !== curr.pageIndex) {
          merged = upsert(merged, pageParam, String(next.pageIndex + 1));
        }

        visitFrom(merged);

        return merged;
      });
    },
  };
}

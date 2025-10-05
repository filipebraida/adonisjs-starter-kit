import * as React from "react";
import type { PaginationState, Updater } from "@tanstack/react-table";
import type { RemoteTableOptions } from "@workspace/ui/components/data-table/data-table";

export type PaginatorMeta = {
  perPage: number;
  currentPage: number; // 1-based
  lastPage: number;
  total: number;
  firstPage?: number;
};

export type VisitFn = (args: {
  url?: string;
  params?: Record<string, string | string[]>;
}) => void;

type ParamsRecord = Record<string, string | string[]>;

function searchToRecord(search: string): ParamsRecord {
  const sp = new URLSearchParams(
    search.startsWith("?") ? search.slice(1) : search,
  );
  const out: ParamsRecord = {};
  for (const k of new Set(sp.keys())) {
    const all = sp.getAll(k);
    out[k] = all.length > 1 ? all : (all[0] ?? "");
  }
  return out;
}

function setKey(rec: ParamsRecord, key: string, val: string | string[]) {
  const next = { ...rec };

  const isEmpty = Array.isArray(val) ? val.length === 0 : val === "";

  if (isEmpty) {
    delete next[key];
  } else {
    next[key] = Array.isArray(val) ? val.map(String) : String(val);
  }
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
  const baseParams = React.useMemo(
    () => searchToRecord(currentSearch),
    [currentSearch],
  );
  const pageIndex = Math.max(0, (meta.currentPage ?? 1) - 1); // 0-based
  const pageSize = meta.perPage;
  const pageCount = Math.max(1, meta.lastPage);

  function mergeAndVisit(merge: (params: ParamsRecord) => ParamsRecord) {
    const next = merge(baseParams);
    visit({ url: baseUrl, params: next });
  }

  function clampIndex(i0: number) {
    return Math.min(Math.max(0, i0), pageCount - 1);
  }

  function setPageIndex(nextIndex0: number) {
    const clamped = clampIndex(nextIndex0);
    mergeAndVisit((params) => setKey(params, pageParam, String(clamped + 1))); // URL 1-based
  }

  function setPageSize(next: number) {
    mergeAndVisit((params) => {
      let r = setKey(params, perPageParam, String(next));
      r = setKey(r, pageParam, "1"); // reset para primeira página
      return r;
    });
  }

  return {
    pageCount,
    state: { pagination: { pageIndex, pageSize } },
    onPaginationChange: (updater: Updater<PaginationState>) => {
      const curr: PaginationState = { pageIndex, pageSize };
      const next = typeof updater === "function" ? updater(curr) : updater;
      if (next.pageSize !== curr.pageSize) setPageSize(next.pageSize);
      else if (next.pageIndex !== curr.pageIndex) setPageIndex(next.pageIndex);
    },
  };
}

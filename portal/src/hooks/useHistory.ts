"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  getHistory,
  deleteHistoryItem,
  HistoryItem,
  ApiError,
} from "@/lib/api";

type SortDir = "asc" | "desc";

export function useHistory() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortOrder, setSortOrder] = useState<SortDir>("asc");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortByRef = useRef(sortBy);
  const sortOrderRef = useRef(sortOrder);
  sortByRef.current = sortBy;
  sortOrderRef.current = sortOrder;

  const fetchPage = useCallback(
    async (p: number, ps: number, sb?: string, so?: string) => {
      setIsLoading(true);
      setError(null);
      const sBy = sb !== undefined ? sb : sortByRef.current;
      const sOrd = so !== undefined ? so : sortOrderRef.current;
      try {
        const data = await getHistory(p, ps, sBy || undefined, sOrd);
        setItems(data.items);
        setTotal(data.total);
        setPage(data.page);
        setPageSize(ps);
      } catch (err) {
        if (err instanceof ApiError) {
          setError(err.detail || err.message);
        } else {
          setError("Failed to load history.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  useEffect(() => {
    fetchPage(1, 20);
  }, [fetchPage]);

  const sort = useCallback(
    (field: string) => {
      let newBy: string | undefined;
      let newDir: SortDir;
      if (field === sortByRef.current) {
        if (sortOrderRef.current === "asc") {
          newBy = field;
          newDir = "desc";
        } else {
          newBy = undefined;
          newDir = "asc";
        }
      } else {
        newBy = field;
        newDir = "asc";
      }
      setSortBy(newBy);
      setSortOrder(newDir);
      sortByRef.current = newBy ?? "";
      sortOrderRef.current = newDir;
      fetchPage(1, pageSize, newBy, newDir);
    },
    [fetchPage, pageSize]
  );

  const deleteItem = async (id: number) => {
    try {
      await deleteHistoryItem(id);
      const wasLastOnPage = items.length === 1;
      setItems((prev) => prev.filter((item) => item.id !== id));
      setTotal((prev) => prev - 1);
      if (wasLastOnPage && page > 1) {
        fetchPage(page - 1, pageSize);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail || err.message);
      } else {
        setError("Failed to delete item.");
      }
    }
  };

  const refresh = useCallback(() => {
    fetchPage(1, pageSize);
  }, [fetchPage, pageSize]);

  return {
    items, total, page, pageSize, sortBy, sortOrder,
    isLoading, error, fetchPage, sort, deleteItem, refresh,
  };
}

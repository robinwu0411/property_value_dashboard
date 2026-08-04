"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  getMarketSummary,
  getMarketBreakdown,
  getExportUrl,
  MarketStatsResponse,
  BreakdownPageResponse,
  PropertyResponse,
  ApiError,
} from "@/lib/api";

export function useMarketData(
  filters: Record<string, unknown>,
  initialSummary?: MarketStatsResponse | null,
  initialBreakdown?: BreakdownPageResponse | null
) {
  const [summary, setSummary] = useState<MarketStatsResponse | null>(initialSummary ?? null);
  const [breakdown, setBreakdown] = useState<PropertyResponse[]>(initialBreakdown?.items ?? []);
  const [chartData, setChartData] = useState<PropertyResponse[]>([]);
  const [total, setTotal] = useState(initialBreakdown?.total ?? 0);
  const [page, setPage] = useState(initialBreakdown?.page ?? 1);
  const [pageSize, setPageSize] = useState(initialBreakdown?.pageSize ?? 20);
  const [sortBy, setSortBy] = useState("");
  const [sortOrder, setSortOrder] = useState("");
  const [isLoading, setIsLoading] = useState(!initialBreakdown);
  const [error, setError] = useState<string | null>(null);

  // refs to always read latest sort values from callbacks regardless of closure
  const sortByRef = useRef("");
  const sortOrderRef = useRef("");
  const abortRef = useRef<AbortController | null>(null);
  const chartAbortRef = useRef<AbortController | null>(null);
  const skipInitialRef = useRef(!!initialBreakdown);

  const fetchSummary = useCallback(async () => {
    try {
      const data = await getMarketSummary(filters);
      setSummary(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail || err.message);
      }
    }
  }, [JSON.stringify(filters)]);

  const fetchBreakdown = useCallback(
    async (p: number, ps: number, sb?: string, so?: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsLoading(true);
      setError(null);
      const sBy = sb !== undefined ? sb : sortByRef.current;
      const sOrd = so !== undefined ? so : sortOrderRef.current;
      try {
        const params: Record<string, unknown> = { ...filters, page: p, pageSize: ps };
        if (sBy) {
          params.sortBy = sBy;
          params.sortOrder = sOrd;
        }
        const data = await getMarketBreakdown(params, controller.signal);
        setBreakdown(data.items);
        setTotal(data.total);
        setPage(data.page);
        setPageSize(data.pageSize);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (err instanceof ApiError) {
          setError(err.detail || err.message);
        } else {
          setError("Failed to load market data.");
        }
      } finally {
        setIsLoading(false);
      }
    },
    [JSON.stringify(filters)]
  );

  const handleSort = useCallback(
    (sb: string, so: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      sortByRef.current = sb;
      sortOrderRef.current = so;
      setSortBy(sb);
      setSortOrder(so);
      setPage(1);
      setIsLoading(true);
      setError(null);
      const params: Record<string, unknown> = { ...filters, page: 1, pageSize };
      if (sb) {
        params.sortBy = sb;
        params.sortOrder = so;
      }
      getMarketBreakdown(params, controller.signal).then((data) => {
        setBreakdown(data.items);
        setTotal(data.total);
        setPage(data.page);
        setPageSize(data.pageSize);
      }).catch((err) => {
        if (err instanceof DOMException && err.name === "AbortError") return;
        if (err instanceof ApiError) {
          setError(err.detail || err.message);
        } else {
          setError("Failed to load market data.");
        }
      }).finally(() => setIsLoading(false));
    },
    [filters, pageSize]
  );

  const fetchChartData = useCallback(async () => {
    chartAbortRef.current?.abort();
    const controller = new AbortController();
    chartAbortRef.current = controller;

    try {
      const params: Record<string, unknown> = { ...filters, page: 1, pageSize: 1000 };
      const data = await getMarketBreakdown(params, controller.signal);
      setChartData(data.items);
    } catch (_) {
      // chart data is non-critical; ignore errors
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => {
    if (skipInitialRef.current) {
      skipInitialRef.current = false;
      fetchChartData();
      return;
    }
    fetchSummary();
    fetchBreakdown(1, 20);
    fetchChartData();
  }, [fetchSummary, fetchBreakdown, fetchChartData]);

  const exportUrl = (format: "csv" | "pdf") =>
    getExportUrl({ ...filters, sortBy, sortOrder }, format);

  return {
    summary,
    breakdown,
    chartData,
    total,
    page,
    pageSize,
    sortBy,
    sortOrder,
    isLoading,
    error,
    fetchBreakdown,
    handleSort,
    exportUrl,
  };
}

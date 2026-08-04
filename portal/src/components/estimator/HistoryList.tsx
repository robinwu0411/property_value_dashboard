"use client";

import { forwardRef, useImperativeHandle, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useHistory } from "@/hooks/useHistory";
import { HistoryItem, HistoryListResponse } from "@/lib/api";
import Button from "@/components/ui/Button";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { format } from "date-fns";

const PAGE_SIZE_OPTIONS = [10, 20, 50];

interface ColSpec {
  key: string;
  label: string;
  format?: (item: HistoryItem) => string;
}

const COLUMNS: ColSpec[] = [
  { key: "created_at", label: "Date", format: (i) =>
    i.created_at ? format(new Date(i.created_at), "MM-dd HH:mm") : "" },
  { key: "square_footage", label: "Square Footage" },
  { key: "bedrooms", label: "Bedrooms" },
  { key: "bathrooms", label: "Bathrooms" },
  { key: "year_built", label: "Year" },
  { key: "lot_size", label: "Lot Size" },
  { key: "distance_to_city_center", label: "Distance" },
  { key: "school_rating", label: "Rating" },
  { key: "predicted_price", label: "Price", format: (i) =>
    `$${(i.predicted_price ?? 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` },
];

interface HistoryListProps {
  initialHistory?: HistoryListResponse | null;
}

const HistoryList = forwardRef<{ refresh: () => void }, HistoryListProps>(function HistoryList({ initialHistory }, ref) {
  const { items, total, page, pageSize, sortBy, sortOrder, isLoading, error, fetchPage, sort, deleteItem, refresh } = useHistory(initialHistory);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [pendingDelete, setPendingDelete] = useState<HistoryItem | null>(null);
  const router = useRouter();

  useImperativeHandle(ref, () => ({ refresh }), [refresh]);

  const SortIcon = ({ field }: { field: string }) => (
    <svg className={`inline-block w-3 h-3 ml-0.5 ${field === sortBy ? "text-blue-600" : "text-gray-300"}`} viewBox="0 0 10 14" fill="currentColor">
      <path d="M5 0L8 4H2L5 0Z" opacity={sortBy === field && sortOrder === "asc" ? 1 : 0.4} />
      <path d="M5 14L2 10H8L5 14Z" opacity={sortBy === field && sortOrder === "desc" ? 1 : 0.4} />
    </svg>
  );

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const toggleSelect = useCallback((id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectAll = useCallback(
    (checked: boolean) => {
      setSelectedIds((prev) => {
        const next = new Set(prev);
        for (const item of items) {
          if (checked) next.add(item.id);
          else next.delete(item.id);
        }
        return next;
      });
    },
    [items]
  );

  const allChecked = items.length > 0 && items.every((i) => selectedIds.has(i.id));

  const handleCompare = () => {
    const ids = Array.from(selectedIds).slice(0, 5);
    if (ids.length >= 2) router.push(`/estimator/compare?ids=${ids.join(",")}`);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Prediction History <span className="text-sm font-normal text-gray-500">({total})</span>
        </h2>
        <div className="flex items-center gap-2">
          {selectedIds.size > 0 && (
            <span className="text-xs text-gray-500">{selectedIds.size} selected</span>
          )}
          <Button variant="secondary" size="sm" disabled={selectedIds.size < 2} onClick={handleCompare}>
            Compare{selectedIds.size > 0 ? ` (${selectedIds.size})` : ""}
          </Button>
        </div>
      </div>

      {error && (
        <div className="p-2 rounded bg-red-50 text-red-700 text-xs">{error}</div>
      )}

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-6 px-1 py-2 text-left font-medium text-gray-400 text-xs">#</th>
                <th className="w-8 px-1 py-2 text-center">
                  <input type="checkbox" checked={allChecked}
                    onChange={(e) => selectAll(e.target.checked)}
                    aria-label="Select all"
                    className="cursor-pointer" />
                </th>
                {COLUMNS.map((col) => (
                  <th key={col.key}
                    role="button"
                    tabIndex={0}
                    aria-sort={sortBy === col.key ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}
                    className="px-2 py-2 text-left font-medium text-gray-700 cursor-pointer select-none hover:bg-gray-100 transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                    onClick={() => sort(col.key)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); sort(col.key); } }}
                  >
                    {col.label}
                    <SortIcon field={col.key} />
                  </th>
                ))}
                <th className="w-10 px-1 py-2"></th>
              </tr>
            </thead>
            <tbody className={`divide-y divide-gray-100 bg-white transition-opacity ${isLoading ? "opacity-50" : ""}`}>
              {items.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan={COLUMNS.length + 3} className="px-4 py-16 text-center text-gray-400">
                    No history yet
                  </td>
                </tr>
              ) : (
                items.map((item, idx) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-1 py-1.5 text-gray-400 text-[10px] whitespace-nowrap">
                      {(page - 1) * pageSize + idx + 1}
                    </td>
                    <td className="px-1 py-1.5 text-center">
                      <input type="checkbox" checked={selectedIds.has(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        className="cursor-pointer" />
                    </td>
                    {COLUMNS.map((col) => {
                      const raw = (item as unknown as Record<string, unknown>)[col.key];
                      const display = col.format ? col.format(item) : String(raw ?? "");
                      return (
                        <td key={col.key} className="px-2 py-1.5 text-gray-700 whitespace-nowrap">
                          {display}
                        </td>
                      );
                    })}
                    <td className="px-1 py-1.5 text-center">
                      <Button variant="danger" size="sm" onClick={() => setPendingDelete(item)}>Del</Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2">
          <span className="text-gray-600">Rows:</span>
          <select
            className="border border-gray-300 rounded px-2 py-1"
            value={pageSize}
            onChange={(e) => fetchPage(1, Number(e.target.value))}
          >
            {PAGE_SIZE_OPTIONS.map((n) => (<option key={n} value={n}>{n}</option>))}
          </select>
        </div>
        <div className="flex items-center gap-1 text-gray-600">
          <button
            className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-30"
            disabled={page <= 1 || isLoading}
            onClick={() => fetchPage(page - 1, pageSize)}
            aria-label="Previous page"
          >&lt;</button>
          <span className="px-2">{page}–{totalPages}</span>
          <button
            className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-30"
            disabled={page >= totalPages || isLoading}
            onClick={() => fetchPage(page + 1, pageSize)}
            aria-label="Next page"
          >&gt;</button>
        </div>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete Record"
        message={pendingDelete
          ? `Delete the estimate for $${pendingDelete.predicted_price.toLocaleString()} from ${format(new Date(pendingDelete.created_at), "MMM d, yyyy")}? This cannot be undone.`
          : ""}
        onConfirm={() => {
          if (pendingDelete) {
            deleteItem(pendingDelete.id);
            setSelectedIds((prev) => { const n = new Set(prev); n.delete(pendingDelete.id); return n; });
            setPendingDelete(null);
          }
        }}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
});

export default HistoryList;

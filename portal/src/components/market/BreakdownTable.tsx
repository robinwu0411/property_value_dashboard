"use client";

import { PropertyResponse } from "@/lib/api";
import Button from "@/components/ui/Button";

interface BreakdownTableProps {
  data: PropertyResponse[];
  total: number;
  page: number;
  pageSize: number;
  sortBy: string;
  sortOrder: string;
  isLoading: boolean;
  onPageChange: (page: number, pageSize: number) => void;
  onSortChange: (sortBy: string, sortOrder: string) => void;
  exportUrl: (format: "csv" | "pdf") => string;
}

interface ColSpec {
  field: keyof PropertyResponse;
  label: string;
  format?: (v: number) => string;
}

const COLUMNS: ColSpec[] = [
  { field: "squareFootage", label: "Square Footage" },
  { field: "bedrooms", label: "Bedrooms" },
  { field: "bathrooms", label: "Bathrooms" },
  { field: "yearBuilt", label: "Year" },
  { field: "lotSize", label: "Lot Size" },
  { field: "distanceToCityCenter", label: "Distance" },
  { field: "schoolRating", label: "Rating" },
  { field: "price", label: "Price", format: (v: number) =>
    `$${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  },
];

const PAGE_SIZE_OPTIONS = [10, 20, 50];

function SortIcon({ field, sortBy, sortOrder }: { field: string; sortBy: string; sortOrder: string }) {
  return (
    <svg className={`inline-block w-3 h-3 ml-0.5 ${field === sortBy ? "text-blue-600" : "text-gray-300"}`} viewBox="0 0 10 14" fill="currentColor">
      <path d="M5 0L8 4H2L5 0Z" opacity={sortBy === field && sortOrder === "asc" ? 1 : 0.4} />
      <path d="M5 14L2 10H8L5 14Z" opacity={sortBy === field && sortOrder === "desc" ? 1 : 0.4} />
    </svg>
  );
}

export default function BreakdownTable({
  data,
  total,
  page,
  pageSize,
  sortBy,
  sortOrder,
  isLoading,
  onPageChange,
  onSortChange,
  exportUrl,
}: BreakdownTableProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  const handleSort = (field: string) => {
    if (field === sortBy) {
      if (sortOrder === "asc") onSortChange(field, "desc");
      else onSortChange("", "");
    } else {
      onSortChange(field, "asc");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">
          Property Breakdown
          <span className="ml-2 text-sm font-normal text-gray-500">({total} total)</span>
        </h2>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => window.open(exportUrl("csv"), "_blank")}>Export CSV</Button>
          <Button size="sm" onClick={() => window.open(exportUrl("pdf"), "_blank")}>Export PDF</Button>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="w-8 px-1 py-2 text-left font-medium text-gray-400 text-xs">#</th>
                {COLUMNS.map((col) => (
                  <th
                    key={col.field}
                    role="button"
                    tabIndex={0}
                    aria-sort={sortBy === col.field ? (sortOrder === "asc" ? "ascending" : "descending") : "none"}
                    className="px-2 py-2 text-left font-medium text-gray-700 cursor-pointer select-none hover:bg-gray-100 transition-colors whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                    onClick={() => handleSort(col.field)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleSort(col.field); } }}
                  >
                    {col.label}
                    <SortIcon field={col.field} sortBy={sortBy} sortOrder={sortOrder} />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className={`divide-y divide-gray-100 bg-white transition-opacity ${isLoading ? "opacity-50" : ""}`}>
              {data.length === 0 && !isLoading ? (
                <tr>
                  <td colSpan={COLUMNS.length + 1} className="px-4 py-20 text-center text-gray-400">
                    No data
                  </td>
                </tr>
              ) : (
                data.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-gray-50">
                    <td className="px-1 py-1.5 text-gray-400 text-[10px] whitespace-nowrap">
                      {(page - 1) * pageSize + idx + 1}
                    </td>
                    {COLUMNS.map((col) => {
                      const val = row[col.field] as number;
                      return (
                        <td key={col.field} className="px-2 py-1.5 text-gray-700 whitespace-nowrap">
                          {col.format ? col.format(val) : val}
                        </td>
                      );
                    })}
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
            onChange={(e) => onPageChange(1, Number(e.target.value))}
          >
            {PAGE_SIZE_OPTIONS.map((n) => (<option key={n} value={n}>{n}</option>))}
          </select>
        </div>
        <div className="flex items-center gap-1 text-gray-600">
          <button
            className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-30"
            disabled={page <= 1 || isLoading}
            onClick={() => onPageChange(page - 1, pageSize)}
            aria-label="Previous page"
          >&lt;</button>
          <span className="px-2">{page}–{totalPages}</span>
          <button
            className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-30"
            disabled={page >= totalPages || isLoading}
            onClick={() => onPageChange(page + 1, pageSize)}
            aria-label="Next page"
          >&gt;</button>
        </div>
      </div>
    </div>
  );
}

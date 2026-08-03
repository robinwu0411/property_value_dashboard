"use client";

import { useSearchParams } from "next/navigation";
import FilterPanel from "@/components/market/FilterPanel";
import SummaryCards from "@/components/market/SummaryCards";
import MarketCharts from "@/components/market/MarketCharts";
import BreakdownTable from "@/components/market/BreakdownTable";
import { useMarketData } from "@/hooks/useMarketData";

function filtersFromParams(searchParams: URLSearchParams): Record<string, unknown> {
  const filters: Record<string, unknown> = {};
  const rangeKeys = [
    "minSquareFootage", "maxSquareFootage",
    "minYearBuilt", "maxYearBuilt",
    "minLotSize", "maxLotSize",
    "minDistanceToCityCenter", "maxDistanceToCityCenter",
    "minPrice", "maxPrice",
    "minSchoolRating", "maxSchoolRating",
    "minBedrooms", "minBathrooms",
  ];
  rangeKeys.forEach((key) => {
    const v = searchParams.get(key);
    if (v) filters[key] = Number(v);
  });
  ["bedrooms", "bathrooms"].forEach((key) => {
    const vals = searchParams.getAll(key);
    if (vals.length) filters[key] = vals.map(Number);
  });
  return filters;
}

export default function MarketPage() {
  const searchParams = useSearchParams();
  const filters = filtersFromParams(searchParams);

  const {
    summary,
    breakdown,
    chartData,
    total,
    page,
    pageSize,
    sortBy,
    sortOrder,
    isLoading,
    fetchBreakdown,
    handleSort,
    exportUrl,
  } = useMarketData(filters);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Property Market Analysis
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <FilterPanel />

        <div className="flex-1 min-w-0 space-y-8">
          <SummaryCards stats={summary} />
          <MarketCharts stats={summary} properties={chartData} />
          <BreakdownTable
            data={breakdown}
            total={total}
            page={page}
            pageSize={pageSize}
            sortBy={sortBy}
            sortOrder={sortOrder}
            isLoading={isLoading}
            onPageChange={(p, ps) => fetchBreakdown(p, ps)}
            onSortChange={handleSort}
            exportUrl={exportUrl}
          />
        </div>
      </div>
    </div>
  );
}

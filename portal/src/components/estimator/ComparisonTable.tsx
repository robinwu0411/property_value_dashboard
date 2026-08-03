"use client";

import { useEffect, useState } from "react";
import { getHistoryItem, HistoryItem, ApiError } from "@/lib/api";
import HighchartsWrapper from "@/components/ui/HighchartsWrapper";
import Card from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";

const LABELS: Record<string, string> = {
  square_footage: "Square Footage",
  bedrooms: "Bedrooms",
  bathrooms: "Bathrooms",
  year_built: "Year Built",
  lot_size: "Lot Size",
  distance_to_city_center: "Distance to City Center",
  school_rating: "School Rating",
  predicted_price: "Predicted Price",
};

const PRICE_FIELDS = new Set(["predicted_price"]);

interface ComparisonTableProps {
  ids: number[];
}

export default function ComparisonTable({ ids }: ComparisonTableProps) {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all(ids.map((id) => getHistoryItem(id)))
      .then(setItems)
      .catch((err) => {
        if (err instanceof ApiError) {
          setError(err.detail || err.message);
        } else {
          setError("Failed to load comparison data.");
        }
      })
      .finally(() => setIsLoading(false));
  }, [ids]);

  if (isLoading) {
    return <Skeleton variant="rectangular" height="300px" />;
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-red-50 text-red-700" role="alert">
        {error}
      </div>
    );
  }

  const features = Object.keys(LABELS);

  const chartOptions = {
    chart: { type: "bar", height: 400 },
    title: { text: "Property Comparison" },
    xAxis: { categories: features.map((f) => LABELS[f]), title: { text: null } },
    yAxis: { title: { text: "Value" }, min: 0 },
    tooltip: { pointFormat: "{series.name}: <b>{point.y}</b>" },
    series: items.map((item, i) => ({
      type: "bar",
      name: `Property ${i + 1}`,
      data: features.map((f) => {
        const val = (item as unknown as Record<string, number>)[f];
        return PRICE_FIELDS.has(f) ? Math.round(val / 1000) : val;
      }),
    })),
    legend: { enabled: true },
    credits: { enabled: false },
  };

  return (
    <div className="space-y-6">
      <Card title="Side-by-Side Comparison">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-2 pr-4 font-semibold text-gray-900">Feature</th>
                {items.map((item, i) => (
                  <th key={item.id} className="text-right py-2 px-3 font-semibold text-gray-900">
                    Property {i + 1}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {features.map((feature) => (
                <tr key={feature}>
                  <td className="py-2.5 pr-4 font-medium text-gray-700">
                    {LABELS[feature]}
                  </td>
                  {items.map((item) => {
                    const val = (item as unknown as Record<string, number>)[feature];
                    const isPrice = PRICE_FIELDS.has(feature);
                    return (
                      <td
                        key={item.id}
                        className={`py-2.5 px-3 text-right ${
                          isPrice ? "font-bold text-green-600" : "text-gray-600"
                        }`}
                      >
                        {isPrice
                          ? `$${val.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}`
                          : val}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Comparison Chart">
        <HighchartsWrapper options={chartOptions} />
      </Card>
    </div>
  );
}

"use client";

import { EstimateResponse } from "@/lib/api";
import Card from "@/components/ui/Card";

const FEATURE_LABELS: Record<string, string> = {
  square_footage: "Square Footage",
  bedrooms: "Bedrooms",
  bathrooms: "Bathrooms",
  year_built: "Year Built",
  lot_size: "Lot Size",
  distance_to_city_center: "Distance to City Center",
  school_rating: "School Rating",
};

interface ResultTableProps {
  features: Record<string, number> | null;
  result: EstimateResponse;
}

export default function ResultTable({ features, result }: ResultTableProps) {
  return (
    <Card title="Estimate Result">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <tbody className="divide-y divide-gray-100">
            {features && Object.entries(features).map(([key, value]) => (
              <tr key={key}>
                <td className="py-2 pr-4 text-gray-500">{FEATURE_LABELS[key] || key}</td>
                <td className="py-2 text-right text-gray-700">{value}</td>
              </tr>
            ))}
            <tr>
              <td className="py-3 pr-4 font-medium text-gray-900">Predicted Price</td>
              <td className="py-3 text-right">
                <span className="text-lg font-bold text-green-600">
                  ${result.predicted_price.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
              </td>
            </tr>
            <tr>
              <td className="py-3 pr-4 font-medium text-gray-500">Saved to History</td>
              <td className="py-3 text-right text-gray-700">
                {result.saved ? "Yes" : "No"}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
}

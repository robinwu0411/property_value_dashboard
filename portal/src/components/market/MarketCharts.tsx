"use client";

import HighchartsWrapper from "@/components/ui/HighchartsWrapper";
import Card from "@/components/ui/Card";
import { MarketStatsResponse, PropertyResponse } from "@/lib/api";

interface MarketChartsProps {
  stats: MarketStatsResponse | null;
  properties: PropertyResponse[];
}

export default function MarketCharts({ stats, properties }: MarketChartsProps) {
  if (!stats) return null;

  const histogramOptions = {
    chart: { type: "column", height: 300 },
    title: { text: "Price Distribution" },
    xAxis: {
      categories: stats.priceDistribution.map((b) => b.range),
      title: { text: null },
    },
    yAxis: { title: { text: "Count" }, min: 0 },
    tooltip: { pointFormat: "Count: <b>{point.y}</b>" },
    series: [
      {
        type: "column",
        name: "Properties",
        data: stats.priceDistribution.map((b) => b.count),
        color: "#3b82f6",
      },
    ],
    legend: { enabled: false },
    credits: { enabled: false },
  };

  const scatterData = properties.map((p) => [
    p.squareFootage,
    p.price,
  ]);

  const scatterOptions = {
    chart: { type: "scatter", height: 300 },
    title: { text: "Price vs Square Footage" },
    xAxis: { title: { text: "Square Footage" } },
    yAxis: { title: { text: "Price ($)" } },
    tooltip: {
      pointFormat: "Sq.Ft: <b>{point.x}</b><br/>Price: <b>${point.y}</b>",
    },
    series: [
      {
        type: "scatter",
        name: "Properties",
        data: scatterData,
        color: "#3b82f6",
      },
    ],
    legend: { enabled: false },
    credits: { enabled: false },
  };

  const bedroomData = Object.entries(stats.avgPriceByBedrooms)
    .sort(([a], [b]) => parseFloat(a) - parseFloat(b))
    .map(([key, value]) => ({
      name: `${parseFloat(key)} Beds`,
      y: value,
    }));

  const bedroomOptions = {
    chart: { type: "column", height: 300 },
    title: { text: "Average Price by Bedroom Count" },
    xAxis: {
      categories: bedroomData.map((d) => d.name),
      title: { text: null },
    },
    yAxis: { title: { text: "Average Price ($)" }, min: 0 },
    tooltip: { pointFormat: "Avg Price: <b>${point.y}</b>" },
    series: [
      {
        type: "column",
        name: "Avg Price",
        data: bedroomData.map((d) => d.y),
        color: "#10b981",
      },
    ],
    legend: { enabled: false },
    credits: { enabled: false },
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="Price Distribution">
        <div className="flex justify-center">
          <HighchartsWrapper options={histogramOptions} height={300} />
        </div>
      </Card>
      <Card title="Price vs Square Footage">
        <div className="flex justify-center">
          <HighchartsWrapper options={scatterOptions} height={300} />
        </div>
      </Card>
      <Card title="Average Price by Bedrooms" className="lg:col-span-2">
        <div className="flex justify-center">
          <HighchartsWrapper options={bedroomOptions} height={300} />
        </div>
      </Card>
    </div>
  );
}

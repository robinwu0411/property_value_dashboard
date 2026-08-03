"use client";

import HighchartsWrapper from "@/components/ui/HighchartsWrapper";
import Card from "@/components/ui/Card";

interface ResultChartProps {
  featureImportances: Record<string, number>;
}

export default function ResultChart({ featureImportances }: ResultChartProps) {
  const categories = Object.keys(featureImportances).map((k) =>
    k.replace(/_/g, " ")
  );
  const data = Object.values(featureImportances).map((v) =>
    Math.round(v * 10000) / 100
  );

  const options = {
    chart: { type: "bar", height: 400 },
    title: { text: "Feature Importances" },
    subtitle: { text: "How much each feature affects the price prediction" },
    xAxis: { categories, title: { text: null } },
    yAxis: { title: { text: "Importance (%)" }, min: 0 },
    tooltip: { valueSuffix: "%" },
    series: [
      {
        name: "Importance",
        type: "bar",
        data,
        color: "#3b82f6",
      },
    ],
    legend: { enabled: false },
    credits: { enabled: false },
  };

  return (
    <Card title="Feature Importance">
      <HighchartsWrapper options={options} />
    </Card>
  );
}

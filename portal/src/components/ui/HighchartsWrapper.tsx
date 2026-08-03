"use client";

import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";

interface ChartProps {
  options: Record<string, unknown>;
  height?: number;
}

export default function HighchartsWrapper({ options, height = 400 }: ChartProps) {
  return (
    <div style={{ width: "100%" }}>
      <HighchartsReact highcharts={Highcharts} options={{ ...options, chart: { ...options.chart as Record<string,unknown>, height } }} />
    </div>
  );
}

import { MarketStatsResponse } from "@/lib/api";
import Card from "@/components/ui/Card";

interface SummaryCardsProps {
  stats: MarketStatsResponse | null;
}

function fmtCurrency(value: number): string {
  return `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

export default function SummaryCards({ stats }: SummaryCardsProps) {
  if (!stats) return null;

  const cards = [
    {
      title: "Total Properties",
      value: stats.totalProperties.toLocaleString(),
    },
    {
      title: "Average Price",
      value: fmtCurrency(stats.avgPrice),
    },
    {
      title: "Median Price",
      value: fmtCurrency(stats.medianPrice),
    },
    {
      title: "Price Range",
      value: `${fmtCurrency(stats.minPrice)} – ${fmtCurrency(stats.maxPrice)}`,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => (
        <Card key={card.title} className="text-center w-full">
          <p className="text-xs text-gray-500 mb-1">{card.title}</p>
          <p className={`font-bold text-gray-900 ${idx < 3 ? "text-2xl" : "text-base"}`}>
            {card.value}
          </p>
        </Card>
      ))}
    </div>
  );
}

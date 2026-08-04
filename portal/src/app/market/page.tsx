import MarketPageClient from "@/components/market/MarketPageClient";
import { getMarketSummary, getMarketBreakdown } from "@/lib/api";

export default async function MarketPage() {
  const [summary, breakdown] = await Promise.all([
    getMarketSummary({}),
    getMarketBreakdown({ page: 1, pageSize: 20 }),
  ]);

  return <MarketPageClient initialSummary={summary} initialBreakdown={breakdown} />;
}

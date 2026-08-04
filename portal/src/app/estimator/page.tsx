import EstimatorPageClient from "@/components/estimator/EstimatorPageClient";
import { getHistory, HistoryListResponse } from "@/lib/api";

export default async function EstimatorPage() {
  let initialHistory: HistoryListResponse | null = null;
  try {
    initialHistory = await getHistory(1, 20);
  } catch {
    // fall back to client-side fetch
  }

  return <EstimatorPageClient initialHistory={initialHistory} />;
}

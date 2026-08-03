"use client";

import { useRef, useCallback } from "react";
import PredictionForm from "@/components/estimator/PredictionForm";
import HistoryList from "@/components/estimator/HistoryList";

export default function EstimatorPage() {
  const historyRef = useRef<{ refresh: () => void }>(null);

  const onPredicted = useCallback(() => {
    historyRef.current?.refresh();
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <PredictionForm onPredicted={onPredicted} />
      <HistoryList ref={historyRef} />
    </div>
  );
}

"use client";

import { useState } from "react";
import {
  submitEstimate,
  EstimateResponse,
  ApiError,
} from "@/lib/api";

export function usePrediction() {
  const [result, setResult] = useState<EstimateResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const predict = async (features: Record<string, number>) => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await submitEstimate(features);
      setResult(data);
      return true;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail || err.message);
      } else {
        setError("Network error. Please check your connection.");
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const reset = () => {
    setResult(null);
    setError(null);
  };

  return { result, isLoading, error, predict, reset };
}

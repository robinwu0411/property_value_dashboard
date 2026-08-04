"use client";

import { useState, useCallback } from "react";
import { getModelInfo, ModelInfo, ApiError } from "@/lib/api";

export function useModelInfo() {
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchModelInfo = useCallback(async () => {
    if (modelInfo) return;
    setIsLoading(true);
    setError(null);
    try {
      const data = await getModelInfo();
      setModelInfo(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail || err.message);
      } else {
        setError("Failed to load model info.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [modelInfo]);

  return { modelInfo, isLoading, error, fetchModelInfo };
}

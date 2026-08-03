"use client";

import { useState, useEffect } from "react";
import { getModelInfo, ModelInfo, ApiError } from "@/lib/api";

export function useModelInfo() {
  const [modelInfo, setModelInfo] = useState<ModelInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getModelInfo()
      .then((data) => {
        if (!cancelled) setModelInfo(data);
      })
      .catch((err) => {
        if (!cancelled) {
          if (err instanceof ApiError) {
            setError(err.detail || err.message);
          } else {
            setError("Failed to load model info.");
          }
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { modelInfo, isLoading, error };
}

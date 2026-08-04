"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import {
  propertyFeaturesSchema,
  PropertyFeatures,
} from "@/lib/validators";
import { submitWhatIf, WhatIfResponse, ApiError } from "@/lib/api";

let nextId = 1;
interface Scenario {
  id: string;
  features: Record<string, number>;
  label: string;
  result: WhatIfResponse;
}

const FEATURE_LABELS: Record<string, string> = {
  squareFootage: "Square Footage",
  bedrooms: "Bedrooms",
  bathrooms: "Bathrooms",
  yearBuilt: "Year Built",
  lotSize: "Lot Size",
  distanceToCityCenter: "Distance",
  schoolRating: "Rating",
};

const toCamel = (f: PropertyFeatures): Record<string, number> => ({
  squareFootage: f.square_footage,
  bedrooms: f.bedrooms,
  bathrooms: f.bathrooms,
  yearBuilt: f.year_built,
  lotSize: f.lot_size,
  distanceToCityCenter: f.distance_to_city_center,
  schoolRating: f.school_rating,
});

function formatPrice(v: number) {
  return `$${v.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function ScenarioCard({
  item,
  baselinePrice,
  isBaseline,
  onRemove,
}: {
  item: Scenario;
  baselinePrice: number | null;
  isBaseline: boolean;
  onRemove?: () => void;
}) {
  const delta = baselinePrice != null ? item.result.predictedPrice - baselinePrice : 0;
  const deltaPct = baselinePrice != null ? (delta / baselinePrice) * 100 : 0;

  return (
    <div
      className={`rounded-xl border-2 p-4 ${
        isBaseline
          ? "border-yellow-400 bg-yellow-50"
          : "border-gray-200 bg-white"
      }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          {isBaseline && (
            <span className="text-yellow-500 text-base">★</span>
          )}
          <span
            className={`text-xs font-semibold uppercase ${
              isBaseline ? "text-yellow-700" : "text-gray-500"
            }`}
          >
            {isBaseline ? "Baseline" : item.label}
          </span>
        </div>
        {!isBaseline && onRemove && (
          <button
            onClick={onRemove}
            className="px-2 py-1 text-base text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
            title="Remove"
          >
            ✕
          </button>
        )}
      </div>

      <div className="text-[11px] text-gray-500 space-y-0.5 mb-3">
        {Object.entries(item.features).map(([k, v]) => (
          <span key={k} className="inline-block mr-2">
            {FEATURE_LABELS[k] || k}: {v}
          </span>
        ))}
      </div>

      <div className="text-xl font-bold text-gray-900">
        {formatPrice(item.result.predictedPrice)}
      </div>
      {!isBaseline && baselinePrice != null && (
        <div
          className={`text-xs font-medium mt-0.5 ${
            delta >= 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {delta >= 0 ? "▲" : "▼"} {formatPrice(Math.abs(delta))}{" "}
          ({deltaPct >= 0 ? "+" : ""}
          {deltaPct.toFixed(1)}%) vs baseline
        </div>
      )}
    </div>
  );
}

export default function WhatIfTool() {
  const [baseline, setBaseline] = useState<Scenario | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm<PropertyFeatures>({
    resolver: zodResolver(propertyFeaturesSchema),
    mode: "onBlur",
  });

  const analyzeOne = async (features: Record<string, number>): Promise<WhatIfResponse> => {
    const data = await submitWhatIf(features);
    return data;
  };

  const onSubmit = async (data: PropertyFeatures) => {
    const features = toCamel(data);
    setIsLoading(true);
    setError(null);
    try {
      const result = await analyzeOne(features);
      const id = String(nextId++);
      const label = `Scenario ${id}`;
      const scenario: Scenario = { id, features, label, result };
      if (!baseline) {
        setBaseline(scenario);
      } else {
        setScenarios((prev) => [...prev, scenario]);
      }
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.detail || err.message);
      } else {
        setError("Network error.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const removeScenario = (id: string) => {
    setScenarios((prev) => prev.filter((s) => s.id !== id));
  };

  const clearAll = () => {
    setBaseline(null);
    setScenarios([]);
    setError(null);
    resetForm();
  };

  const allCards = [
    ...(baseline ? [{ item: baseline, isBaseline: true as const }] : []),
    ...scenarios.map((item) => ({ item, isBaseline: false as const })),
  ];

  const baselinePrice = baseline?.result.predictedPrice ?? null;

  return (
    <div className="space-y-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">What-If Analysis</h1>
        <p className="text-gray-600 mb-6">
          Submit a baseline property, then compare different scenarios to see
          how changes affect the predicted price.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Square Footage"
              type="number"
              {...register("square_footage", { valueAsNumber: true })}
              error={errors.square_footage?.message}
              placeholder="2000"
            />
            <Input
              label="Bedrooms"
              type="number"
              step="1"
              {...register("bedrooms", { valueAsNumber: true })}
              error={errors.bedrooms?.message}
              placeholder="3"
            />
            <Input
              label="Bathrooms"
              type="number"
              step="0.5"
              {...register("bathrooms", { valueAsNumber: true })}
              error={errors.bathrooms?.message}
              placeholder="2"
            />
            <Input
              label="Year Built"
              type="number"
              {...register("year_built", { valueAsNumber: true })}
              error={errors.year_built?.message}
              placeholder="2010"
            />
            <Input
              label="Lot Size (sq.ft)"
              type="number"
              {...register("lot_size", { valueAsNumber: true })}
              error={errors.lot_size?.message}
              placeholder="5000"
            />
            <Input
              label="Distance to City Center (miles)"
              type="number"
              step="0.1"
              {...register("distance_to_city_center", { valueAsNumber: true })}
              error={errors.distance_to_city_center?.message}
              placeholder="5.0"
            />
            <Input
              label="School Rating (1-10)"
              type="number"
              step="0.1"
              {...register("school_rating", { valueAsNumber: true })}
              error={errors.school_rating?.message}
              placeholder="8.0"
            />
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm" role="alert">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button type="submit" loading={isLoading}>
              {baseline ? "Add Scenario" : "Set Baseline"}
            </Button>
            {(baseline || scenarios.length > 0) && (
              <Button type="button" variant="ghost" onClick={clearAll}>
                Clear All
              </Button>
            )}
          </div>
        </form>
      </div>

      {(baseline || scenarios.length > 0) && (
        <div className="max-w-5xl mx-auto">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Scenarios</h2>
          <div className="grid grid-cols-2 gap-4">
            {allCards.map(({ item, isBaseline }) => (
              <ScenarioCard
                key={item.id}
                item={item}
                baselinePrice={baselinePrice}
                isBaseline={isBaseline}
                onRemove={
                  !isBaseline ? () => removeScenario(item.id) : undefined
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

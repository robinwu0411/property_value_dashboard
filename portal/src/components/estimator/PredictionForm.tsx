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
import { usePrediction } from "@/hooks/usePrediction";
import ResultTable from "./ResultTable";
import ResultChart from "./ResultChart";
import { useModelInfo } from "@/hooks/useModelInfo";

interface PredictionFormProps {
  onPredicted?: () => void;
}

export default function PredictionForm({ onPredicted }: PredictionFormProps) {
  const { result, isLoading, error, predict, reset } = usePrediction();
  const { modelInfo } = useModelInfo();
  const [submittedFeatures, setSubmittedFeatures] = useState<Record<string, number> | null>(null);

  const {
    register,
    handleSubmit,
    reset: resetForm,
    formState: { errors },
  } = useForm<PropertyFeatures>({
    resolver: zodResolver(propertyFeaturesSchema),
    mode: "onBlur",
  });

  const onSubmit = async (data: PropertyFeatures) => {
    const features = data as unknown as Record<string, number>;
    const ok = await predict(features);
    if (ok) {
      setSubmittedFeatures(features);
      onPredicted?.();
    }
  };

  return (
    <div className="space-y-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Property Value Estimator
        </h1>
        <p className="text-gray-600 mb-6">
          Enter property details to get an AI-powered price estimate.
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

          <div className="flex gap-3 pt-2 sm:w-1/2">
            <Button type="submit" loading={isLoading} className="flex-1">
              Estimate Price
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => { reset(); resetForm(); }}
              disabled={isLoading}
              className="flex-1"
            >
              Reset
            </Button>
          </div>
        </form>
      </div>

      {result && (
        <div className="max-w-4xl mx-auto space-y-8">
          <ResultTable features={submittedFeatures} result={result} />
          {modelInfo && (
            <ResultChart
              featureImportances={modelInfo.feature_importances}
            />
          )}
        </div>
      )}
    </div>
  );
}

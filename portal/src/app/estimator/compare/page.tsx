"use client";

import { useSearchParams, redirect } from "next/navigation";
import Link from "next/link";
import ComparisonTable from "@/components/estimator/ComparisonTable";

export default function ComparePage() {
  const searchParams = useSearchParams();
  const idsParam = searchParams.get("ids");

  if (!idsParam) {
    redirect("/estimator/history");
  }

  const ids = idsParam
    .split(",")
    .map(Number)
    .filter((n) => !isNaN(n));

  if (ids.length < 2) {
    redirect("/estimator/history");
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Link
        href="/estimator"
        className="inline-flex items-center text-sm text-primary-600 hover:text-primary-800 mb-4"
      >
        &larr; Back to Estimator
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        Property Comparison
      </h1>
      <ComparisonTable ids={ids.slice(0, 5)} />
    </div>
  );
}

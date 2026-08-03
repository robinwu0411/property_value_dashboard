"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import RangeSlider from "@/components/ui/RangeSlider";
import MultiSelect from "@/components/ui/MultiSelect";
import Button from "@/components/ui/Button";

const BEDROOM_OPTIONS = ["1", "2", "3", ">3"].map((v) => ({ label: v, value: v }));
const BATHROOM_OPTIONS = ["1", "1.5", "2", ">2"].map((v) => ({
  label: v,
  value: v,
}));

function getNum(sp: URLSearchParams, key: string, defaultVal: number): number {
  const v = sp.get(key);
  return v ? Number(v) : defaultVal;
}

function getNums(sp: URLSearchParams, key: string): string[] {
  return sp.getAll(key);
}

function restorePlus(exactVals: string[], sp: URLSearchParams, minKey: string): string[] {
  const minVal = sp.get(minKey);
  if (minVal) {
    return [...exactVals, `${minVal}+`];
  }
  return exactVals;
}

export default function FilterPanel() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const buildLocal = useCallback(() => ({
    sqftMin: getNum(searchParams, "minSquareFootage", 0),
    sqftMax: getNum(searchParams, "maxSquareFootage", 5000),
    yearMin: getNum(searchParams, "minYearBuilt", 1900),
    yearMax: getNum(searchParams, "maxYearBuilt", 2030),
    lotMin: getNum(searchParams, "minLotSize", 0),
    lotMax: getNum(searchParams, "maxLotSize", 15000),
    distMin: getNum(searchParams, "minDistanceToCityCenter", 0),
    distMax: getNum(searchParams, "maxDistanceToCityCenter", 10),
    priceMin: getNum(searchParams, "minPrice", 0),
    priceMax: getNum(searchParams, "maxPrice", 1000000),
    bedrooms: restorePlus(getNums(searchParams, "bedrooms"), searchParams, "minBedrooms"),
    bathrooms: restorePlus(getNums(searchParams, "bathrooms"), searchParams, "minBathrooms"),
    schoolRatingMin: getNum(searchParams, "minSchoolRating", 1),
    schoolRatingMax: getNum(searchParams, "maxSchoolRating", 10),
  }), [searchParams]);

  const [local, setLocal] = useState(buildLocal);

  useEffect(() => {
    setLocal(buildLocal());
  }, [buildLocal]);

  const applyFilters = () => {
    const params = new URLSearchParams();
    const set = (key: string, val: number, defaultVal: number) => {
      if (val !== defaultVal) params.set(key, String(val));
    };
    set("minSquareFootage", local.sqftMin, 0);
    set("maxSquareFootage", local.sqftMax, 5000);
    set("minYearBuilt", local.yearMin, 1900);
    set("maxYearBuilt", local.yearMax, 2030);
    set("minLotSize", local.lotMin, 0);
    set("maxLotSize", local.lotMax, 15000);
    set("minDistanceToCityCenter", local.distMin, 0);
    set("maxDistanceToCityCenter", local.distMax, 10);
    set("minPrice", local.priceMin, 0);
    set("maxPrice", local.priceMax, 1000000);
    set("minSchoolRating", local.schoolRatingMin, 1);
    set("maxSchoolRating", local.schoolRatingMax, 10);
    local.bedrooms.forEach((v: string) => {
      if (v.endsWith("+")) {
        params.set("minBedrooms", v.replace("+", ""));
      } else {
        params.append("bedrooms", v);
      }
    });
    local.bathrooms.forEach((v: string) => {
      if (v.endsWith("+")) {
        params.set("minBathrooms", v.replace("+", ""));
      } else {
        params.append("bathrooms", v);
      }
    });
    router.push(`/market?${params.toString()}`);
  };

  const resetLocal = () => {
    setLocal({
      sqftMin: 0, sqftMax: 5000,
      yearMin: 1900, yearMax: 2030,
      lotMin: 0, lotMax: 15000,
      distMin: 0, distMax: 10,
      priceMin: 0, priceMax: 1000000,
      bedrooms: [], bathrooms: [],
      schoolRatingMin: 1, schoolRatingMax: 10,
    });
    router.push("/market");
  };

  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4">
        <h2 className="text-sm font-semibold text-gray-900">Filters</h2>

        <div className="space-y-3">
          <RangeSlider
            label="Square Footage"
            min={0} max={5000} step={100}
            value={[local.sqftMin, local.sqftMax]}
            formatValue={(v) => v === 5000 ? "5000+" : v.toLocaleString()}
            onChange={([min, max]) => setLocal((s) => ({ ...s, sqftMin: min, sqftMax: max }))}
          />

          <RangeSlider
            label="Year Built"
            min={1900} max={2030} step={1}
            value={[local.yearMin, local.yearMax]}
            formatValue={(v) => v === 2030 ? "2030+" : String(v)}
            onChange={([min, max]) => setLocal((s) => ({ ...s, yearMin: min, yearMax: max }))}
          />

          <RangeSlider
            label="Lot Size"
            min={0} max={15000} step={500}
            value={[local.lotMin, local.lotMax]}
            formatValue={(v) => v === 15000 ? "15000+" : v.toLocaleString()}
            onChange={([min, max]) => setLocal((s) => ({ ...s, lotMin: min, lotMax: max }))}
          />

          <RangeSlider
            label="Distance (mi)"
            min={0} max={10} step={0.5}
            value={[local.distMin, local.distMax]}
            formatValue={(v) => v === 10 ? "10+" : String(v)}
            onChange={([min, max]) => setLocal((s) => ({ ...s, distMin: min, distMax: max }))}
          />

          <RangeSlider
            label="Price"
            min={0} max={1000000} step={10000}
            value={[local.priceMin, local.priceMax]}
            formatValue={(v) =>
              v === 0
                ? "$0"
                : v >= 1000000
                  ? "$1M+"
                  : `$${(v / 1000).toFixed(0)}k`
            }
            onChange={([min, max]) => setLocal((s) => ({ ...s, priceMin: min, priceMax: max }))}
          />
        </div>

        <div className="space-y-2">
          <RangeSlider
            label="School Rating"
            min={1} max={10} step={1}
            value={[local.schoolRatingMin, local.schoolRatingMax]}
            onChange={([min, max]) => setLocal((s) => ({ ...s, schoolRatingMin: min, schoolRatingMax: max }))}
          />
          <MultiSelect
            label="Bedrooms"
            options={BEDROOM_OPTIONS}
            selected={local.bedrooms}
            onChange={(v) => setLocal((s) => ({ ...s, bedrooms: v }))}
          />
          <MultiSelect
            label="Bathrooms"
            options={BATHROOM_OPTIONS}
            selected={local.bathrooms}
            onChange={(v) => setLocal((s) => ({ ...s, bathrooms: v }))}
          />
        </div>

        <Button className="w-full text-sm" onClick={applyFilters}>
          Apply Filters
        </Button>

        <Button variant="secondary" size="sm" className="w-full" onClick={resetLocal}>
          Reset
        </Button>
      </div>
    </aside>
  );
}

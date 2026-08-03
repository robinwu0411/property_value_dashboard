"use client";

interface RangeSliderProps {
  label: string;
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  formatValue?: (value: number) => string;
}

const defaultFormat = (v: number) => v.toLocaleString();

export default function RangeSlider({
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  formatValue = defaultFormat,
}: RangeSliderProps) {
  const [low, high] = value;

  return (
    <fieldset className="w-full">
      <legend className="text-xs font-medium text-gray-700 mb-1.5">{label}</legend>
      <div className="relative h-6 flex items-center">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={low}
          onChange={(e) => {
            const newLow = Math.min(Number(e.target.value), high - step);
            onChange([newLow, high]);
          }}
          className="absolute w-full h-1.5 bg-transparent pointer-events-none appearance-none
            [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-primary-600 [&::-webkit-slider-thumb]:shadow
            [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-10
            [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none
            [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-primary-600 [&::-moz-range-thumb]:shadow
            [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0"
          aria-label={`${label} minimum`}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={high}
          onChange={(e) => {
            const newHigh = Math.max(Number(e.target.value), low + step);
            onChange([low, newHigh]);
          }}
          className="absolute w-full h-1.5 bg-transparent pointer-events-none appearance-none
            [&::-webkit-slider-thumb]:pointer-events-auto [&::-webkit-slider-thumb]:appearance-none
            [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:rounded-full
            [&::-webkit-slider-thumb]:bg-primary-600 [&::-webkit-slider-thumb]:shadow
            [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:relative [&::-webkit-slider-thumb]:z-10
            [&::-moz-range-thumb]:pointer-events-auto [&::-moz-range-thumb]:appearance-none
            [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full
            [&::-moz-range-thumb]:bg-primary-600 [&::-moz-range-thumb]:shadow
            [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:border-0"
          aria-label={`${label} maximum`}
        />
        <div className="absolute left-0 right-0 h-1.5 bg-gray-200 rounded" aria-hidden="true" />
        <div
          className="absolute h-1.5 bg-primary-300 rounded"
          style={{
            left: `${((low - min) / (max - min)) * 100}%`,
            right: `${((max - high) / (max - min)) * 100}%`,
          }}
          aria-hidden="true"
        />
      </div>
      <div className="flex justify-between mt-1 text-xs text-gray-500">
        <span>{formatValue(low)}</span>
        <span>{formatValue(high)}</span>
      </div>
    </fieldset>
  );
}

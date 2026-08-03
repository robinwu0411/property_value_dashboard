"use client";

import { useState } from "react";

interface MultiSelectOption {
  label: string;
  value: string;
}

interface MultiSelectProps {
  label: string;
  options: MultiSelectOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
}

const DEFAULT_VISIBLE = 6;

export default function MultiSelect({
  label,
  options,
  selected,
  onChange,
}: MultiSelectProps) {
  const [expanded, setExpanded] = useState(false);
  const visibleOptions = expanded ? options : options.slice(0, DEFAULT_VISIBLE);
  const hasMore = options.length > DEFAULT_VISIBLE;

  const toggle = (value: string) => {
    if (selected.includes(value)) {
      onChange(selected.filter((v) => v !== value));
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <fieldset className="w-full">
      <legend className="text-sm font-medium text-gray-700 mb-2">{label}</legend>
      <div className="space-y-1">
        {visibleOptions.map((opt) => (
          <label
            key={opt.value}
            className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={selected.includes(opt.value)}
              onChange={() => toggle(opt.value)}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            {opt.label}
          </label>
        ))}
      </div>
      {hasMore && (
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="mt-1 text-xs text-primary-600 hover:text-primary-800"
        >
          {expanded ? "Show less" : `Show ${options.length - DEFAULT_VISIBLE} more`}
        </button>
      )}
    </fieldset>
  );
}

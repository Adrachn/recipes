"use client";

import React from "react";

interface CategoryCounterProps {
  category: string;
  currentValue: number;
  maxValue: number;
  onChange: (value: number) => void;
  availableCount?: number;
}

const CategoryCounter: React.FC<CategoryCounterProps> = ({
  category,
  currentValue,
  maxValue,
  onChange,
  availableCount,
}) => {
  return (
    <div className="flex items-center">
      <label className="flex items-center text-sm font-medium text-gray-700 capitalize w-48 shrink-0">
        <span>{category.replace("-", " ")}</span>
        <span className="ml-1 text-xs text-slate-400">
          ({availableCount ?? "..."})
        </span>
      </label>
      <div className="flex items-center space-x-1.5">
        {Array.from({ length: maxValue + 1 }, (_, i) => i).map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onChange(num)}
            className={`w-8 h-8 rounded-md font-semibold transition-colors text-sm ${
              currentValue === num
                ? "bg-primary text-white"
                : "bg-slate-200 text-slate-700 hover:bg-slate-300"
            }`}
          >
            {num}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryCounter;

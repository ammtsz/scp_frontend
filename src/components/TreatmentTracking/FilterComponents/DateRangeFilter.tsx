"use client";

import React from "react";
import { DATE_PRESETS } from "@/types/filters";

interface DateRangeFilterProps {
  dateRange: { start: Date | null; end: Date | null };
  onDateRangeChange: (range: { start: Date | null; end: Date | null }) => void;
  onDatePresetChange: (preset: string) => void;
}

export function DateRangeFilter({
  dateRange,
  onDateRangeChange,
  onDatePresetChange,
}: DateRangeFilterProps) {
  const handleDateChange = (field: "start" | "end", value: string) => {
    const date = value ? new Date(value) : null;
    onDateRangeChange({
      ...dateRange,
      [field]: date,
    });
  };

  const formatDate = (date: Date | null) => {
    return date ? date.toISOString().split("T")[0] : "";
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      <label className="block text-xs sm:text-sm font-medium text-gray-700">
        Período
      </label>

      {/* Date Presets */}
      <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1 sm:gap-2">
        {DATE_PRESETS.map((preset) => (
          <button
            key={preset.value}
            onClick={() => onDatePresetChange(preset.value)}
            className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded border border-blue-200 transition-colors text-center"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Custom Date Range */}
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 sm:items-end mt-4 mx-1">
        <div className="flex-1">
          <label
            htmlFor="start-date"
            className="block text-xs text-gray-600 mb-1"
          >
            Data inicial
          </label>
          <input
            id="start-date"
            type="date"
            value={formatDate(dateRange.start)}
            onChange={(e) => handleDateChange("start", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="flex-1">
          <label
            htmlFor="end-date"
            className="block text-xs text-gray-600 mb-1"
          >
            Data final
          </label>
          <input
            id="end-date"
            type="date"
            value={formatDate(dateRange.end)}
            onChange={(e) => handleDateChange("end", e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

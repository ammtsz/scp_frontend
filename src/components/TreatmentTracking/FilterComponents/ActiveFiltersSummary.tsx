"use client";

import React from "react";
import { TREATMENT_TYPE_OPTIONS, STATUS_OPTIONS } from "@/types/filters";

interface ActiveFiltersSummaryProps {
  searchTerm: string;
  treatmentTypes: string[];
  statuses: string[];
  dateRange: { start: Date | null; end: Date | null };
  onSearchChange: (value: string) => void;
  onTreatmentTypesChange: (types: string[]) => void;
  onStatusesChange: (statuses: string[]) => void;
  onDateRangeChange: (range: { start: Date | null; end: Date | null }) => void;
}

export function ActiveFiltersSummary({
  searchTerm,
  treatmentTypes,
  statuses,
  dateRange,
  onSearchChange,
  onTreatmentTypesChange,
  onStatusesChange,
  onDateRangeChange,
}: ActiveFiltersSummaryProps) {
  const formatDate = (date: Date | null) => {
    return date ? date.toISOString().split("T")[0] : "";
  };

  const handleTreatmentTypeToggle = (type: string) => {
    const updated = treatmentTypes.filter((t) => t !== type);
    onTreatmentTypesChange(updated);
  };

  const handleStatusToggle = (status: string) => {
    const updated = statuses.filter((s) => s !== status);
    onStatusesChange(updated);
  };

  return (
    <div className="border-t pt-3 sm:pt-4">
      <div className="flex flex-wrap gap-1 sm:gap-2">
        {searchTerm && (
          <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-blue-100 text-blue-800 text-xs sm:text-sm rounded-full">
            <span className="truncate max-w-[100px] sm:max-w-none">
              🔍 &ldquo;{searchTerm}&rdquo;
            </span>
            <button
              onClick={() => onSearchChange("")}
              className="ml-1 text-blue-600 hover:text-blue-800 flex-shrink-0"
            >
              ✕
            </button>
          </span>
        )}

        {treatmentTypes.map((type) => {
          const option = TREATMENT_TYPE_OPTIONS.find((o) => o.value === type);
          return option ? (
            <span
              key={type}
              className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-green-100 text-green-800 text-xs sm:text-sm rounded-full"
            >
              <span className="truncate max-w-[80px] sm:max-w-none">
                {option.icon} {option.label}
              </span>
              <button
                onClick={() => handleTreatmentTypeToggle(type)}
                className="ml-1 text-green-600 hover:text-green-800 flex-shrink-0"
              >
                ✕
              </button>
            </span>
          ) : null;
        })}

        {statuses.map((status) => {
          const option = STATUS_OPTIONS.find((o) => o.value === status);
          return option ? (
            <span
              key={status}
              className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-purple-100 text-purple-800 text-xs sm:text-sm rounded-full"
            >
              <span className="truncate max-w-[80px] sm:max-w-none">
                {option.icon} {option.label}
              </span>
              <button
                onClick={() => handleStatusToggle(status)}
                className="ml-1 text-purple-600 hover:text-purple-800 flex-shrink-0"
              >
                ✕
              </button>
            </span>
          ) : null;
        })}

        {(dateRange.start || dateRange.end) && (
          <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-1 bg-orange-100 text-orange-800 text-xs sm:text-sm rounded-full">
            <span className="truncate max-w-[120px] sm:max-w-none">
              📅 {dateRange.start ? formatDate(dateRange.start) : "..."} -{" "}
              {dateRange.end ? formatDate(dateRange.end) : "..."}
            </span>
            <button
              onClick={() => onDateRangeChange({ start: null, end: null })}
              className="ml-1 text-orange-600 hover:text-orange-800 flex-shrink-0"
            >
              ✕
            </button>
          </span>
        )}
      </div>
    </div>
  );
}

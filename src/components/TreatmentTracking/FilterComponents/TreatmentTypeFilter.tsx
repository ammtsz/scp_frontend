"use client";

import React from "react";
import { TREATMENT_TYPE_OPTIONS } from "@/types/filters";

interface TreatmentTypeFilterProps {
  treatmentTypes: string[];
  onTreatmentTypesChange: (types: string[]) => void;
}

export function TreatmentTypeFilter({
  treatmentTypes,
  onTreatmentTypesChange,
}: TreatmentTypeFilterProps) {
  const handleToggle = (type: string) => {
    const updated = treatmentTypes.includes(type)
      ? treatmentTypes.filter((t) => t !== type)
      : [...treatmentTypes, type];
    onTreatmentTypesChange(updated);
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      <label className="block text-xs sm:text-sm font-medium text-gray-700">
        Tipo de Tratamento
      </label>
      <div className="flex flex-wrap gap-2 sm:gap-4">
        {TREATMENT_TYPE_OPTIONS.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-gray-50 transition-colors"
          >
            <input
              type="checkbox"
              checked={treatmentTypes.includes(option.value)}
              onChange={() => handleToggle(option.value)}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 flex-shrink-0"
            />
            <span className="text-xs sm:text-sm text-gray-700">
              {option.icon} {option.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

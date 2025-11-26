"use client";

import React from "react";
import { STATUS_OPTIONS } from "@/types/filters";

interface StatusFilterProps {
  statuses: string[];
  onStatusesChange: (statuses: string[]) => void;
}

export function StatusFilter({
  statuses,
  onStatusesChange,
}: StatusFilterProps) {
  const handleToggle = (status: string) => {
    const updated = statuses.includes(status)
      ? statuses.filter((s) => s !== status)
      : [...statuses, status];
    onStatusesChange(updated);
  };

  return (
    <div className="space-y-2 sm:space-y-3">
      <label className="block text-xs sm:text-sm font-medium text-gray-700">
        Status da Sessão
      </label>
      <div className="flex flex-wrap gap-2 sm:gap-4">
        {STATUS_OPTIONS.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-2 cursor-pointer p-2 rounded-md hover:bg-gray-50 transition-colors"
          >
            <input
              type="checkbox"
              checked={statuses.includes(option.value)}
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

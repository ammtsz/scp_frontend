"use client";

import React from "react";
import { ChevronDown, ChevronUp } from "react-feather";

interface FilterBarHeaderProps {
  resultCount?: number;
  isFilterGridCollapsed: boolean;
  onToggleCollapse: () => void;
  hasActiveFilters: boolean;
}

export function FilterBarHeader({
  resultCount,
  isFilterGridCollapsed,
  onToggleCollapse,
  hasActiveFilters,
}: FilterBarHeaderProps) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 flex-1">
      <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
        <span>🔍 Filtros de Busca</span>
        {resultCount !== undefined && (
          <span className="text-xs sm:text-sm font-normal text-gray-500">
            ({resultCount} {resultCount === 1 ? "resultado" : "resultados"})
          </span>
        )}
      </h3>

      {/* Collapse Toggle Button */}
      <button
        onClick={onToggleCollapse}
        className={`p-1 rounded transition-all duration-200 ${
          hasActiveFilters && isFilterGridCollapsed
            ? "text-blue-600 bg-blue-50 hover:text-blue-700 hover:bg-blue-100"
            : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
        }`}
        title={isFilterGridCollapsed ? "Expandir filtros" : "Recolher filtros"}
      >
        {isFilterGridCollapsed ? (
          <div className="relative">
            <ChevronDown className="w-5 h-5" />
            {/* Active filters indicator dot */}
            {hasActiveFilters && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"></div>
            )}
          </div>
        ) : (
          <ChevronUp className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}

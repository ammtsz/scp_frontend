"use client";

import React, { useState } from "react";
import { FilterPreset } from "@/types/filters";
import {
  FilterBarHeader,
  FilterBarControls,
  SearchInput,
  TreatmentTypeFilter,
  StatusFilter,
  DateRangeFilter,
  ActiveFiltersSummary,
  SavePresetModal,
  ManagePresetsModal,
} from "./FilterComponents";

interface FilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  treatmentTypes: string[];
  onTreatmentTypesChange: (types: string[]) => void;
  statuses: string[];
  onStatusesChange: (statuses: string[]) => void;
  dateRange: { start: Date | null; end: Date | null };
  onDateRangeChange: (range: { start: Date | null; end: Date | null }) => void;
  onDatePresetChange: (preset: string) => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
  savedPresets: FilterPreset[];
  onSavePreset: (name: string) => void;
  onLoadPreset: (preset: FilterPreset) => void;
  onRemovePreset: (presetId: string) => void;
  resultCount?: number;
}

export function FilterBar({
  searchTerm,
  onSearchChange,
  treatmentTypes,
  onTreatmentTypesChange,
  statuses,
  onStatusesChange,
  dateRange,
  onDateRangeChange,
  onDatePresetChange,
  onClearFilters,
  hasActiveFilters,
  savedPresets,
  onSavePreset,
  onLoadPreset,
  onRemovePreset,
  resultCount,
}: FilterBarProps) {
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [isFilterGridCollapsed, setIsFilterGridCollapsed] = useState(false);

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <FilterBarHeader
          resultCount={resultCount}
          isFilterGridCollapsed={isFilterGridCollapsed}
          onToggleCollapse={() =>
            setIsFilterGridCollapsed(!isFilterGridCollapsed)
          }
          hasActiveFilters={hasActiveFilters}
        />

        <FilterBarControls
          hasActiveFilters={hasActiveFilters}
          savedPresets={savedPresets}
          onClearFilters={onClearFilters}
          onLoadPreset={onLoadPreset}
          onShowManageModal={() => setShowManageModal(true)}
          onShowSaveModal={() => setShowSaveModal(true)}
        />
      </div>

      {/* Search Input */}
      <SearchInput searchTerm={searchTerm} onSearchChange={onSearchChange} />

      {/* Filter Grid - Collapsible */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isFilterGridCollapsed
            ? "max-h-0 opacity-0 pointer-events-none"
            : "max-h-[500px] opacity-100 pointer-events-auto"
        }`}
      >
        <div className={`space-y-6 ${isFilterGridCollapsed ? "pb-0" : "pb-2"}`}>
          <TreatmentTypeFilter
            treatmentTypes={treatmentTypes}
            onTreatmentTypesChange={onTreatmentTypesChange}
          />

          <StatusFilter
            statuses={statuses}
            onStatusesChange={onStatusesChange}
          />

          <DateRangeFilter
            dateRange={dateRange}
            onDateRangeChange={onDateRangeChange}
            onDatePresetChange={onDatePresetChange}
          />
        </div>
      </div>

      {/* Collapsed State Divider */}
      {isFilterGridCollapsed && hasActiveFilters && (
        <div className="border-t border-gray-200 pt-3 -mt-1">
          <p className="text-sm text-gray-600 text-center italic">
            Filtros ativos aplicados • Clique no ícone acima para expandir
          </p>
        </div>
      )}

      {/* Active Filters Summary */}
      {hasActiveFilters && (
        <ActiveFiltersSummary
          searchTerm={searchTerm}
          treatmentTypes={treatmentTypes}
          statuses={statuses}
          dateRange={dateRange}
          onSearchChange={onSearchChange}
          onTreatmentTypesChange={onTreatmentTypesChange}
          onStatusesChange={onStatusesChange}
          onDateRangeChange={onDateRangeChange}
        />
      )}

      {/* Modals */}
      <SavePresetModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={onSavePreset}
      />

      <ManagePresetsModal
        isOpen={showManageModal}
        savedPresets={savedPresets}
        onClose={() => setShowManageModal(false)}
        onLoadPreset={onLoadPreset}
        onRemovePreset={onRemovePreset}
      />
    </div>
  );
}

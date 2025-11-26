"use client";

import React from "react";
import { FilterPreset } from "@/types/filters";

interface FilterBarControlsProps {
  hasActiveFilters: boolean;
  savedPresets: FilterPreset[];
  onClearFilters: () => void;
  onLoadPreset: (preset: FilterPreset) => void;
  onShowManageModal: () => void;
  onShowSaveModal: () => void;
}

export function FilterBarControls({
  hasActiveFilters,
  savedPresets,
  onClearFilters,
  onLoadPreset,
  onShowManageModal,
  onShowSaveModal,
}: FilterBarControlsProps) {
  return (
    <div className="flex flex-wrap items-center gap-1 sm:gap-2 justify-end sm:justify-start">
      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors whitespace-nowrap"
        >
          <span className="sm:hidden">✕</span>
          <span className="hidden sm:inline">✕ Limpar todos</span>
        </button>
      )}

      {savedPresets.length > 0 && (
        <div className="relative">
          <select
            className="text-xs sm:text-sm border border-gray-300 rounded-md px-2 sm:px-3 py-1 bg-white min-w-0 max-w-[120px] sm:max-w-none"
            onChange={(e) => {
              if (e.target.value) {
                const preset = savedPresets.find(
                  (p) => p.id === e.target.value
                );
                if (preset) onLoadPreset(preset);
              }
            }}
            value=""
          >
            <option value="">Selecione um filtro</option>
            {savedPresets.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {savedPresets.length > 0 && (
        <button
          onClick={onShowManageModal}
          className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-md transition-colors"
          title="Gerenciar filtros salvos"
        >
          <span className="sm:hidden">⚙️</span>
          <span className="hidden sm:inline">⚙️ Gerenciar</span>
        </button>
      )}

      <button
        onClick={onShowSaveModal}
        className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors disabled:opacity-50 whitespace-nowrap"
        disabled={!hasActiveFilters}
      >
        <span className="sm:hidden">💾</span>
        <span className="hidden sm:inline">💾 Salvar</span>
      </button>
    </div>
  );
}

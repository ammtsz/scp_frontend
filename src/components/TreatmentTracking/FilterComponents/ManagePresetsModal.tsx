"use client";

import React from "react";
import { FilterPreset } from "@/types/filters";

interface ManagePresetsModalProps {
  isOpen: boolean;
  savedPresets: FilterPreset[];
  onClose: () => void;
  onLoadPreset: (preset: FilterPreset) => void;
  onRemovePreset: (presetId: string) => void;
}

export function ManagePresetsModal({
  isOpen,
  savedPresets,
  onClose,
  onLoadPreset,
  onRemovePreset,
}: ManagePresetsModalProps) {
  if (!isOpen) return null;

  const handleLoadPreset = (preset: FilterPreset) => {
    onLoadPreset(preset);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-lg">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
          Gerenciar Filtros Salvos
        </h3>
        <div className="space-y-3 sm:space-y-4">
          {savedPresets.length === 0 ? (
            <p className="text-gray-500 text-center py-6 sm:py-8 text-sm">
              Nenhum filtro salvo encontrado
            </p>
          ) : (
            <div className="space-y-2 max-h-64 sm:max-h-80 overflow-y-auto">
              {savedPresets.map((preset) => (
                <div
                  key={preset.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 text-sm sm:text-base truncate">
                      {preset.name}
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-500">
                      Criado em{" "}
                      {new Date(preset.createdAt).toLocaleDateString("pt-BR")}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleLoadPreset(preset)}
                      className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      <span className="sm:hidden">📋</span>
                      <span className="hidden sm:inline">
                        Selecione um filtro
                      </span>
                    </button>
                    <button
                      onClick={() => onRemovePreset(preset.id)}
                      className="px-2 sm:px-3 py-1 text-xs sm:text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                    >
                      <span className="sm:hidden">🗑️</span>
                      <span className="hidden sm:inline">🗑️ Remover</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

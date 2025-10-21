"use client";

import React, { useState } from "react";
import { X, Globe, Check } from "react-feather";
import { useTimezone } from "@/contexts/TimezoneContext";

interface TimezoneSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Modal for global timezone settings
 * Allows users to change the application-wide timezone setting
 */
export function TimezoneSettingsModal({
  isOpen,
  onClose,
}: TimezoneSettingsModalProps) {
  const { userTimezone, setUserTimezone, supportedTimezones, timezoneInfo } =
    useTimezone();
  const [selectedTimezone, setSelectedTimezone] = useState(userTimezone);
  const [isApplying, setIsApplying] = useState(false);

  if (!isOpen) return null;

  const handleApply = async () => {
    if (selectedTimezone === userTimezone) {
      onClose();
      return;
    }

    setIsApplying(true);
    try {
      await setUserTimezone(selectedTimezone);
      // Small delay to show the applying state
      setTimeout(() => {
        setIsApplying(false);
        onClose();
      }, 500);
    } catch (error) {
      console.error("Error updating timezone:", error);
      setIsApplying(false);
    }
  };

  const getTimezoneLabel = (timezone: string) => {
    const timezoneMap: Record<string, string> = {
      "America/Sao_Paulo": "São Paulo, Brasil",
      "America/New_York": "Nova York, EUA",
      "America/Chicago": "Chicago, EUA",
      "America/Denver": "Denver, EUA",
      "America/Los_Angeles": "Los Angeles, EUA",
      "America/Seattle": "Seattle, EUA",
      "Europe/London": "Londres, Reino Unido",
      "Europe/Paris": "Paris, França",
      "Europe/Berlin": "Berlim, Alemanha",
      "Asia/Tokyo": "Tóquio, Japão",
      "Asia/Shanghai": "Xangai, China",
      "Australia/Sydney": "Sydney, Austrália",
    };
    return timezoneMap[timezone] || timezone;
  };

  const getTimezoneOffset = (timezone: string) => {
    try {
      // For now, use a static mapping - in production, you'd calculate this dynamically
      const offsetMap: Record<string, string> = {
        "America/Sao_Paulo": "GMT-3",
        "America/New_York": "GMT-5",
        "America/Chicago": "GMT-6",
        "America/Denver": "GMT-7",
        "America/Los_Angeles": "GMT-8",
        "America/Seattle": "GMT-8",
        "Europe/London": "GMT+0",
        "Europe/Paris": "GMT+1",
        "Europe/Berlin": "GMT+1",
        "Asia/Tokyo": "GMT+9",
        "Asia/Shanghai": "GMT+8",
        "Australia/Sydney": "GMT+11",
      };
      return offsetMap[timezone] || "GMT+0";
    } catch {
      return "GMT+0";
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-25 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full">
                <Globe size={16} className="text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Configurações de Fuso Horário
                </h3>
                <p className="text-sm text-gray-500">
                  Selecione o fuso horário do sistema
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={16} className="text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {/* Current Timezone Info */}
            {timezoneInfo && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Globe size={16} className="text-blue-600" />
                  <span className="font-medium text-blue-900">
                    Fuso Horário Atual
                  </span>
                </div>
                <p className="text-sm text-blue-800">
                  {getTimezoneLabel(userTimezone)} (
                  {getTimezoneOffset(userTimezone)})
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  {timezoneInfo.date} às {timezoneInfo.time}
                </p>
              </div>
            )}

            {/* Timezone Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Selecionar Novo Fuso Horário
              </label>

              <div className="max-h-64 overflow-y-auto space-y-1 border border-gray-200 rounded-lg">
                {supportedTimezones.map((timezone: string) => (
                  <button
                    key={timezone}
                    onClick={() => setSelectedTimezone(timezone)}
                    className={`w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors ${
                      selectedTimezone === timezone
                        ? "bg-blue-50 border-l-4 border-blue-500"
                        : ""
                    }`}
                  >
                    <div>
                      <div className="font-medium text-gray-900">
                        {getTimezoneLabel(timezone)}
                      </div>
                      <div className="text-sm text-gray-500">
                        {getTimezoneOffset(timezone)}
                      </div>
                    </div>
                    {selectedTimezone === timezone && (
                      <Check size={16} className="text-blue-600" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              onClick={handleApply}
              disabled={isApplying || selectedTimezone === userTimezone}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {isApplying ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Aplicando...</span>
                </>
              ) : (
                <span>Aplicar</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

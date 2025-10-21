"use client";

import React from "react";
import { useTimezone } from "@/contexts/TimezoneContext";

/**
 * TimezoneDisplay component for showing current timezone information
 * This component can be used for debugging and user information
 */
export function TimezoneDisplay() {
  const {
    userTimezone,
    serverTimezone,
    detectedTimezone,
    isValidBrowserTimezone,
    isLoading,
    error,
    formatDateInTimezone,
  } = useTimezone();

  if (isLoading) {
    return (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm">
        <div className="flex items-center gap-2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-blue-700">
            Carregando informações de fuso horário...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
        <div className="text-red-700">
          <strong>Erro:</strong> {error}
        </div>
      </div>
    );
  }

  const currentTime = formatDateInTimezone(
    new Date().toISOString().split("T")[0],
    new Date().toTimeString().split(" ")[0],
    userTimezone
  );

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs space-y-2">
      <div className="font-semibold text-gray-700 mb-2">
        Informações de Fuso Horário
      </div>

      <div className="grid grid-cols-1 gap-2">
        <div>
          <span className="font-medium text-gray-600">Seu fuso:</span>{" "}
          <span className="text-gray-800">{userTimezone}</span>
        </div>

        <div>
          <span className="font-medium text-gray-600">Hora atual:</span>{" "}
          <span className="text-gray-800">{currentTime}</span>
        </div>

        <div>
          <span className="font-medium text-gray-600">Servidor:</span>{" "}
          <span className="text-gray-800">
            {serverTimezone.timezone} ({serverTimezone.date}{" "}
            {serverTimezone.time})
          </span>
        </div>

        {detectedTimezone.timezone !== userTimezone && (
          <div>
            <span className="font-medium text-gray-600">Detectado:</span>{" "}
            <span className="text-gray-800">
              {detectedTimezone.timezone}
              {!isValidBrowserTimezone && (
                <span className="text-orange-600 ml-1">(não suportado)</span>
              )}
            </span>
          </div>
        )}
      </div>

      {!isValidBrowserTimezone && (
        <div className="text-orange-600 text-xs mt-2">
          ⚠️ Fuso detectado automaticamente não é suportado. Usando padrão do
          Brasil.
        </div>
      )}
    </div>
  );
}

/**
 * Compact timezone display for showing just the current timezone
 */
export function CompactTimezoneDisplay() {
  const { userTimezone, isLoading, error } = useTimezone();

  if (isLoading || error) return null;

  return <div className="text-xs text-gray-500">📍 {userTimezone}</div>;
}

"use client";

import React, { useState, useEffect } from "react";
import { useTimezone } from "@/contexts/TimezoneContext";

interface TimezoneSelectProps {
  value: string;
  onChange: (timezone: string) => void;
  disabled?: boolean;
  className?: string;
  label?: string;
  showDetectedHint?: boolean;
}

/**
 * TimezoneSelect component for selecting patient timezones
 * Provides intelligent defaults based on browser detection
 */
export function TimezoneSelect({
  value,
  onChange,
  disabled = false,
  className = "",
  label = "Fuso Horário",
  showDetectedHint = true,
}: TimezoneSelectProps) {
  const {
    userTimezone,
    detectedTimezone,
    isValidBrowserTimezone,
    isLoading,
    validateTimezone,
  } = useTimezone();

  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // List of supported timezones with friendly names
  const timezones = [
    { value: "America/Sao_Paulo", label: "Brasil (São Paulo)" },
    { value: "America/New_York", label: "Estados Unidos (Nova York)" },
    { value: "America/Chicago", label: "Estados Unidos (Chicago)" },
    { value: "America/Denver", label: "Estados Unidos (Denver)" },
    { value: "America/Los_Angeles", label: "Estados Unidos (Los Angeles)" },
    { value: "America/Seattle", label: "Estados Unidos (Seattle)" },
    { value: "Europe/London", label: "Reino Unido (Londres)" },
    { value: "Europe/Paris", label: "França (Paris)" },
    { value: "Europe/Berlin", label: "Alemanha (Berlim)" },
    { value: "Asia/Tokyo", label: "Japão (Tóquio)" },
    { value: "Asia/Shanghai", label: "China (Xangai)" },
    { value: "Australia/Sydney", label: "Austrália (Sydney)" },
  ];

  // Validate timezone when value changes
  useEffect(() => {
    if (value && value !== userTimezone) {
      setIsValidating(true);
      setValidationError(null);

      validateTimezone(value)
        .then((isValid) => {
          if (!isValid) {
            setValidationError("Fuso horário inválido");
          }
        })
        .catch(() => {
          setValidationError("Erro ao validar fuso horário");
        })
        .finally(() => {
          setIsValidating(false);
        });
    } else {
      setValidationError(null);
      setIsValidating(false);
    }
  }, [value, userTimezone, validateTimezone]);

  // Get detected timezone hint
  const getDetectedHint = () => {
    if (!showDetectedHint || isLoading) return null;

    if (isValidBrowserTimezone && detectedTimezone.timezone !== value) {
      return (
        <div className="text-sm text-blue-600 mt-1">
          💡 Detectamos seu fuso: {getTimezoneLabel(detectedTimezone.timezone)}
          <button
            type="button"
            onClick={() => onChange(detectedTimezone.timezone)}
            className="ml-2 text-blue-700 underline hover:text-blue-800"
            disabled={disabled}
          >
            Usar detectado
          </button>
        </div>
      );
    }

    return null;
  };

  // Get friendly label for timezone
  const getTimezoneLabel = (timezone: string) => {
    const found = timezones.find((tz) => tz.value === timezone);
    return found ? found.label : timezone;
  };

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled || isLoading}
        className={`
          w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
          disabled:bg-gray-100 disabled:cursor-not-allowed
          ${
            validationError
              ? "border-red-300 focus:ring-red-500 focus:border-red-500"
              : ""
          }
        `}
      >
        <option value="">Selecione um fuso horário</option>
        {timezones.map((timezone) => (
          <option key={timezone.value} value={timezone.value}>
            {timezone.label}
          </option>
        ))}
      </select>

      {/* Validation indicator */}
      {isValidating && (
        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
          <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-400"></div>
          Validando...
        </div>
      )}

      {/* Validation error */}
      {validationError && (
        <div className="text-sm text-red-600 mt-1">⚠️ {validationError}</div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="text-sm text-gray-500 mt-1">
          Carregando fusos horários...
        </div>
      )}

      {/* Detected timezone hint */}
      {getDetectedHint()}

      {/* Current selection info */}
      {value && !validationError && !isValidating && (
        <div className="text-sm text-gray-600 mt-1">
          ✓ Selecionado: {getTimezoneLabel(value)}
        </div>
      )}
    </div>
  );
}

/**
 * Compact timezone selector for inline use
 */
export function CompactTimezoneSelect({
  value,
  onChange,
  disabled = false,
  className = "",
}: Omit<TimezoneSelectProps, "label" | "showDetectedHint">) {
  return (
    <TimezoneSelect
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={className}
      label=""
      showDetectedHint={false}
    />
  );
}

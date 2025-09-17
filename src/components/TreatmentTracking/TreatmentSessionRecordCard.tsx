"use client";

import React from "react";
import { TreatmentSessionRecordResponseDto } from "@/api/types";
import { formatDate, formatTime, isPast } from "@/utils/formatters";

interface TreatmentSessionRecordCardProps {
  sessionRecord: TreatmentSessionRecordResponseDto;
  patientName?: string;
  onComplete?: (recordId: string) => void;
  onMarkMissed?: (recordId: string) => void;
  onReschedule?: (recordId: string) => void;
  showActions?: boolean;
}

export function TreatmentSessionRecordCard({
  sessionRecord,
  patientName,
  onComplete,
  onMarkMissed,
  onReschedule,
  showActions = true,
}: TreatmentSessionRecordCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "missed":
        return "bg-red-100 text-red-800 border-red-300";
      case "rescheduled":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "cancelled":
        return "bg-gray-100 text-gray-800 border-gray-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "scheduled":
        return "Agendado";
      case "completed":
        return "Completo";
      case "missed":
        return "Perdido";
      case "rescheduled":
        return "Reagendado";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  const sessionDate = new Date(sessionRecord.scheduled_date);
  const isSessionPast = isPast(sessionDate);
  const canComplete = sessionRecord.status === "scheduled" && !isSessionPast;
  const canMarkMissed = sessionRecord.status === "scheduled" && isSessionPast;
  const canReschedule =
    sessionRecord.status === "scheduled" || sessionRecord.status === "missed";

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Sessão #{sessionRecord.session_number}
        </h3>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
            sessionRecord.status
          )}`}
        >
          {getStatusLabel(sessionRecord.status)}
        </span>
      </div>

      {/* Content */}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          {patientName && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500">👤</span>
              <span className="text-gray-700">{patientName}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-gray-500">📅</span>
            <span className="text-gray-700">
              {formatDate(sessionRecord.scheduled_date)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-500">🕐</span>
            <span className="text-gray-700">
              {formatTime(sessionRecord.scheduled_date)}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-gray-500">📋</span>
            <span className="text-gray-700">
              ID da Sessão: {sessionRecord.treatment_session_id}
            </span>
          </div>
        </div>

        {sessionRecord.notes && (
          <div className="mt-3 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Notas:</span> {sessionRecord.notes}
            </p>
          </div>
        )}

        {sessionRecord.notes && sessionRecord.status === "completed" && (
          <div className="mt-3 p-3 bg-green-50 rounded-md">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Notas de Conclusão:</span>{" "}
              {sessionRecord.notes}
            </p>
          </div>
        )}

        {sessionRecord.missed_reason && (
          <div className="mt-3 p-3 bg-red-50 rounded-md">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Motivo da Falta:</span>{" "}
              {sessionRecord.missed_reason}
            </p>
          </div>
        )}

        {showActions && (
          <div className="flex gap-2 mt-4">
            {canComplete && (
              <button
                onClick={() => onComplete?.(sessionRecord.id.toString())}
                className="inline-flex items-center gap-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
              >
                ✓ Marcar como Completo
              </button>
            )}

            {canMarkMissed && (
              <button
                onClick={() => onMarkMissed?.(sessionRecord.id.toString())}
                className="inline-flex items-center gap-1 px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition-colors"
              >
                ✗ Marcar como Perdido
              </button>
            )}

            {canReschedule && (
              <button
                onClick={() => onReschedule?.(sessionRecord.id.toString())}
                className="inline-flex items-center gap-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                🔄 Reagendar
              </button>
            )}
          </div>
        )}

        {sessionRecord.end_time && sessionRecord.status === "completed" && (
          <div className="text-xs text-gray-500 mt-2">
            Completado em: {formatDate(sessionRecord.end_time)} às{" "}
            {formatTime(sessionRecord.end_time)}
          </div>
        )}

        {sessionRecord.status === "missed" && (
          <div className="text-xs text-gray-500 mt-2">
            Marcado como perdido em: {formatDate(sessionRecord.updated_at)}
          </div>
        )}
      </div>
    </div>
  );
}

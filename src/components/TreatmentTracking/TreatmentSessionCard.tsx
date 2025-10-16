"use client";

import React from "react";
import { TreatmentSessionResponseDto } from "@/api/types";
import { formatDate } from "@/utils/formatters";

interface TreatmentSessionCardProps {
  session: TreatmentSessionResponseDto;
  patientName?: string;
  onActivate?: (sessionId: string) => void;
  onSuspend?: (sessionId: string) => void;
  onComplete?: (sessionId: string) => void;
  showActions?: boolean;
}

export function TreatmentSessionCard({
  session,
  patientName,
  onActivate,
  onSuspend,
  onComplete,
  showActions = true,
}: TreatmentSessionCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 border-green-300";
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "suspended":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Ativo";
      case "completed":
        return "Completo";
      case "suspended":
        return "Suspenso";
      case "cancelled":
        return "Cancelado";
      default:
        return status;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "spiritual":
        return "Espiritual";
      case "light_bath":
        return "Banho de Luz";
      case "rod":
        return "Vara";
      default:
        return type;
    }
  };

  const progressPercentage =
    session.planned_sessions > 0
      ? (session.completed_sessions / session.planned_sessions) * 100
      : 0;

  const canActivate = session.status === "suspended";
  const canSuspend = session.status === "active";
  const canComplete =
    session.status === "active" &&
    session.completed_sessions >= session.planned_sessions;

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Tratamento {getTypeLabel(session.treatment_type)}
        </h3>
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
            session.status
          )}`}
        >
          {getStatusLabel(session.status)}
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
              Início: {formatDate(session.start_date)}
            </span>
          </div>

          {session.end_date && (
            <div className="flex items-center gap-2">
              <span className="text-gray-500">🏁</span>
              <span className="text-gray-700">
                Fim: {formatDate(session.end_date)}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <span className="text-gray-500">�</span>
            <span className="text-gray-700">
              Local: {session.body_location}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Progresso</span>
            <span className="text-gray-900 font-medium">
              {session.completed_sessions} / {session.planned_sessions} sessões
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 text-right">
            {Math.round(progressPercentage)}% completo
          </div>
        </div>

        {session.notes && (
          <div className="mt-3 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">
              <span className="font-medium">Notas:</span> {session.notes}
            </p>
          </div>
        )}

        {showActions && (
          <div className="flex gap-2 mt-4">
            {canActivate && (
              <button
                onClick={() => onActivate?.(session.id.toString())}
                className="inline-flex items-center gap-1 px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 transition-colors"
              >
                ▶️ Ativar
              </button>
            )}

            {canSuspend && (
              <button
                onClick={() => onSuspend?.(session.id.toString())}
                className="inline-flex items-center gap-1 px-3 py-2 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700 transition-colors"
              >
                ⏸️ Suspender
              </button>
            )}

            {canComplete && (
              <button
                onClick={() => onComplete?.(session.id.toString())}
                className="inline-flex items-center gap-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
              >
                ✅ Marcar como Completo
              </button>
            )}
          </div>
        )}

        {session.end_date && session.status === "completed" && (
          <div className="text-xs text-gray-500 mt-2">
            Completado em: {formatDate(session.end_date)}
          </div>
        )}

        <div className="text-xs text-gray-500 mt-2">
          Criado em: {formatDate(session.created_at)}
        </div>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import { TreatmentSessionResponseDto } from "@/api/types";
import { formatDate } from "@/utils/formatters";
import { TreatmentSessionsList } from "./TreatmentSessionsList";
import { ChevronDown, ChevronUp } from "react-feather";

interface TreatmentCardProps {
  session: TreatmentSessionResponseDto;
  patientName?: string;
  onComplete?: (sessionId: string) => void;
  onCancel?: (sessionId: string) => void;
  showActions?: boolean;
  isExpanded?: boolean;
  onToggleExpanded?: (sessionId: string) => void;
  onRecordUpdate?: () => void;
}

export function TreatmentCard({
  session,
  patientName,
  onComplete,
  onCancel,
  showActions = true,
  isExpanded = false,
  onToggleExpanded,
  onRecordUpdate,
}: TreatmentCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-300";
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-300";
      case "scheduled":
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "completed":
        return "Completo";
      case "cancelled":
        return "Cancelado";
      case "scheduled":
        return "Agendado";
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
        return "Bastão";
      default:
        return type;
    }
  };

  const progressPercentage =
    session.planned_sessions > 0
      ? Math.min(
          (session.completed_sessions / session.planned_sessions) * 100,
          100
        )
      : 0;

  const canComplete =
    session.status === "scheduled" &&
    session.completed_sessions >= session.planned_sessions;
  const canCancel =
    session.status !== "completed" && session.status !== "cancelled";

  return (
    <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        {/* <h3 className="text-lg font-semibold text-gray-900">
          Tratamento {getTypeLabel(session.treatment_type)}
        </h3> */}
        <h3 className="text-lg font-semibold text-gray-900">{patientName}</h3>
        <div className="flex items-right gap-2">
          <div className="flex items-right gap-2">
            <span
              className={`px-3 py-1 rounded-full text-sm font-medium border ${
                session.treatment_type === "light_bath"
                  ? "bg-yellow-100 text-yellow-800 border-yellow-300"
                  : "bg-blue-100 text-blue-800 border-blue-300"
              }`}
            >
              {getTypeLabel(session.treatment_type)}
            </span>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(
              session.status
            )}`}
          >
            {getStatusLabel(session.status)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4 mt-8">
        <div className="flex flex-col gap-4 text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-gray-700">Início: </span>
              {formatDate(session.start_date)}
            </div>

            {session.end_date && (
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-700">Fim: </span>
                {formatDate(session.end_date)}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="font-bold text-gray-700">Local: </span>
            {session.body_location}
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
              className={`${
                session.treatment_type === "light_bath"
                  ? "bg-yellow-400"
                  : "bg-blue-400"
              } h-2 rounded-full transition-all duration-300`}
              style={{ width: `${Math.min(progressPercentage, 100)}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 text-right">
            {Math.round(progressPercentage)}% completo
          </div>
        </div>

        {session.notes && (
          <div className="mb-2 p-3 bg-gray-50 rounded-md">
            <p className="text-sm text-gray-600">
              <span className="font-bold">Notas:</span> {session.notes}
            </p>
          </div>
        )}
        {session.created_at && (
          <div className="text-xs text-gray-500 ml-1">
            Criado em: {formatDate(session.created_at)}
          </div>
        )}

        {showActions && (
          <div className="flex flex-col sm:flex-row flex-wrap gap-2 mt-4 justify-end">
            {canComplete && (
              <button
                onClick={() => onComplete?.(session.id.toString())}
                className="inline-flex items-center justify-center gap-1 px-3 py-2 border border-green-600 text-green-600 text-xs sm:text-sm font-bold rounded-md hover:bg-gray-200 transition-colors cursor-pointer"
              >
                Finalizar Tratamento
              </button>
            )}

            {canCancel && (
              <button
                onClick={() => onCancel?.(session.id.toString())}
                className="inline-flex items-center justify-center gap-1 px-3 py-2 border border-red-600 text-red-600 text-xs sm:text-sm font-bold rounded-md hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <span className="sm:hidden">❌</span>
                <span className="hidden sm:inline">Cancelar Tratamento</span>
              </button>
            )}
          </div>
        )}

        <button
          onClick={() => onToggleExpanded?.(session.id.toString())}
          className={`flex items-center justify-center gap-2 px-3 py-2 bg-gray-200 text-sm rounded hover:bg-gray-300 w-full cursor-pointer transition-colors ${
            isExpanded ? "mb-0" : "mb-4"
          }`}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Ocultar sessões
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Ver sessões ({session.planned_sessions})
            </>
          )}
        </button>

        {/* Expanded Sessions List */}
        <div
          className={`bg-gray-50 rounded-b-lg overflow-hidden transition-all duration-300 ease-in-out ${
            isExpanded ? "max-h-[800px] opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="mt-4 p-4 rounded-lg">
            <TreatmentSessionsList
              treatmentSessionId={session.id.toString()}
              patientName={patientName}
              onRecordUpdate={onRecordUpdate}
            />

            {/* Collapse Button */}
            <div className="mt-4 pt-3 border-t border-gray-200">
              <button
                onClick={() => onToggleExpanded?.(session.id.toString())}
                className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-200 text-sm rounded hover:bg-gray-300 w-full cursor-pointer transition-colors"
              >
                <ChevronUp className="w-4 h-4" />
                Ocultar sessões
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

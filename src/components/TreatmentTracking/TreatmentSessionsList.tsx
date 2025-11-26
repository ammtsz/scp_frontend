"use client";

import React, { useState, useEffect } from "react";
import { TreatmentSessionRecordResponseDto } from "@/api/types";
import { TreatmentSessionCard } from "./TreatmentSessionCard";
import {
  getTreatmentSessionRecordsBySession,
  completeTreatmentSessionRecord,
  markTreatmentSessionRecordMissed,
  rescheduleTreatmentSessionRecord,
} from "@/api/treatment-session-records";

interface TreatmentSessionsListProps {
  treatmentSessionId: string;
  patientName?: string;
  showActions?: boolean;
  onRecordUpdate?: () => void;
}

export function TreatmentSessionsList({
  treatmentSessionId,
  patientName,
  showActions = true,
  onRecordUpdate,
}: TreatmentSessionsListProps) {
  const [records, setRecords] = useState<TreatmentSessionRecordResponseDto[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadRecords = React.useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getTreatmentSessionRecordsBySession(
        treatmentSessionId
      );

      if (response.success && response.value) {
        setRecords(response.value);
      } else {
        setError(response.error || "Erro ao carregar registros de sessão");
      }
    } catch (err) {
      setError("Erro inesperado ao carregar registros");
      console.error("Error loading treatment session records:", err);
    } finally {
      setLoading(false);
    }
  }, [treatmentSessionId]);

  useEffect(() => {
    if (treatmentSessionId) {
      loadRecords();
    }
  }, [treatmentSessionId, loadRecords]);

  const handleComplete = async (recordId: string) => {
    try {
      const response = await completeTreatmentSessionRecord(recordId, {
        notes: "Sessão completada",
      });

      if (response.success) {
        await loadRecords();
        onRecordUpdate?.();
      } else {
        setError(response.error || "Erro ao completar sessão");
      }
    } catch (err) {
      setError("Erro inesperado ao completar sessão");
      console.error("Error completing session record:", err);
    }
  };

  const handleMarkMissed = async (recordId: string) => {
    try {
      const response = await markTreatmentSessionRecordMissed(recordId, {
        missed_reason: "Paciente não compareceu",
      });

      if (response.success) {
        await loadRecords();
        onRecordUpdate?.();
      } else {
        setError(response.error || "Erro ao marcar como perdido");
      }
    } catch (err) {
      setError("Erro inesperado ao marcar como perdido");
      console.error("Error marking session as missed:", err);
    }
  };

  const handleReschedule = async (recordId: string) => {
    // For now, just show an alert - in a real app you'd open a modal with date/time picker
    const newDate = prompt("Nova data (YYYY-MM-DD):");
    const newTime = prompt("Novo horário (HH:MM):");

    if (newDate && newTime) {
      try {
        const response = await rescheduleTreatmentSessionRecord(recordId, {
          new_date: newDate,
          new_time: newTime,
        });

        if (response.success) {
          await loadRecords();
          onRecordUpdate?.();
        } else {
          setError(response.error || "Erro ao reagendar sessão");
        }
      } catch (err) {
        setError("Erro inesperado ao reagendar sessão");
        console.error("Error rescheduling session record:", err);
      }
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p className="mt-2 text-gray-600">Carregando registros de sessão...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col py-8 bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center justify-center gap-2">
          <span className="text-red-500 text-sm">❌</span>
          <p className="text-red-700">{error}</p>
        </div>
        <button
          onClick={loadRecords}
          className="mt-2 px-3 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 w-48 mx-auto font-medium"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  if (records.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Nenhum registro de sessão encontrado.</p>
      </div>
    );
  }

  // Sort records by session number
  const sortedRecords = [...records].sort(
    (a, b) => a.session_number - b.session_number
  );

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base sm:text-lg font-semibold text-gray-900">
          Sessões ({records.length})
        </h3>
        {records.length > 10 && (
          <div className="text-xs text-gray-500">
            Mostrando todas as {records.length} sessões
          </div>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto space-y-3">
        {sortedRecords.map((record) => (
          <TreatmentSessionCard
            key={record.id}
            sessionRecord={record}
            patientName={patientName}
            onComplete={handleComplete}
            onMarkMissed={handleMarkMissed}
            onReschedule={handleReschedule}
            showActions={showActions}
          />
        ))}
      </div>

      {/* {records.length > 10 && (
        <div className="text-center pt-2 border-t border-gray-200">
          <p className="text-xs text-gray-500">
            💡 Dica: Use as ações dos tratamentos para gerenciar várias sessões
          </p>
        </div>
      )} */}
    </div>
  );
}

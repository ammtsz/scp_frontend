"use client";

import React, { useState, useEffect } from "react";
import { TreatmentSessionRecordResponseDto } from "@/api/types";
import { TreatmentSessionRecordCard } from "./TreatmentSessionRecordCard";
import {
  getTreatmentSessionRecordsBySession,
  completeTreatmentSessionRecord,
  markTreatmentSessionRecordMissed,
  rescheduleTreatmentSessionRecord,
} from "@/api/treatment-session-records";

interface SessionRecordsListProps {
  treatmentSessionId: string;
  patientName?: string;
  showActions?: boolean;
  onRecordUpdate?: () => void;
}

export function SessionRecordsList({
  treatmentSessionId,
  patientName,
  showActions = true,
  onRecordUpdate,
}: SessionRecordsListProps) {
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
        completion_notes: "Sessão completada",
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
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <span className="text-red-500">❌</span>
          <p className="text-red-700">{error}</p>
        </div>
        <button
          onClick={loadRecords}
          className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
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
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        Registros de Sessão ({records.length})
      </h3>

      <div className="grid gap-4">
        {sortedRecords.map((record) => (
          <TreatmentSessionRecordCard
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
    </div>
  );
}

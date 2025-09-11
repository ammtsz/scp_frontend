"use client";

import React, { useState, useEffect } from "react";
import { TreatmentSessionCard } from "@/components/TreatmentTracking/TreatmentSessionCard";
import { SessionRecordsList } from "@/components/TreatmentTracking/SessionRecordsList";
import {
  getTreatmentSessions,
  createTreatmentSession,
  activateTreatmentSession,
  suspendTreatmentSession,
  completeTreatmentSession,
} from "@/api/treatment-sessions";
import { getPatients } from "@/api/patients";
import { TreatmentSessionResponseDto, PatientResponseDto } from "@/api/types";

export default function TreatmentTrackingPage() {
  const [sessions, setSessions] = useState<TreatmentSessionResponseDto[]>([]);
  const [patients, setPatients] = useState<PatientResponseDto[]>([]);
  const [selectedSession, setSelectedSession] =
    useState<TreatmentSessionResponseDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [sessionsResponse, patientsResponse] = await Promise.all([
        getTreatmentSessions(),
        getPatients(),
      ]);

      if (sessionsResponse.success && sessionsResponse.value) {
        setSessions(sessionsResponse.value);
      }

      if (patientsResponse.success && patientsResponse.value) {
        setPatients(patientsResponse.value);
      }

      if (!sessionsResponse.success) {
        setError(
          sessionsResponse.error || "Erro ao carregar sessões de tratamento"
        );
      }
    } catch (err) {
      setError("Erro inesperado ao carregar dados");
      console.error("Error loading treatment tracking data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSession = async () => {
    if (patients.length === 0) {
      alert("Nenhum paciente disponível");
      return;
    }

    try {
      // NOTE: This is demo/test code - in real usage, treatment sessions are created
      // automatically by the SpiritualTreatmentForm after completing a consultation
      const response = await createTreatmentSession({
        treatment_record_id: 1, // Placeholder - would come from actual treatment record
        attendance_id: 1, // Placeholder - would come from actual attendance
        patient_id: patients[0].id,
        treatment_type: "light_bath",
        body_location: "Coronário",
        start_date: new Date().toISOString().split("T")[0],
        planned_sessions: 10,
        duration_minutes: 3, // 3 units = 21 minutes
        color: "azul",
        notes: "Sessão de exemplo criada para demonstração",
      });

      if (response.success) {
        await loadData();
      } else {
        setError(response.error || "Erro ao criar sessão");
      }
    } catch (err) {
      setError("Erro inesperado ao criar sessão");
      console.error("Error creating session:", err);
    }
  };

  const handleActivateSession = async (sessionId: string) => {
    try {
      const response = await activateTreatmentSession(sessionId);
      if (response.success) {
        await loadData();
      } else {
        setError(response.error || "Erro ao ativar sessão");
      }
    } catch (err) {
      setError("Erro inesperado ao ativar sessão");
      console.error("Error activating session:", err);
    }
  };

  const handleSuspendSession = async (sessionId: string) => {
    try {
      const response = await suspendTreatmentSession(sessionId, {
        suspension_reason: "Suspenso temporariamente",
      });
      if (response.success) {
        await loadData();
      } else {
        setError(response.error || "Erro ao suspender sessão");
      }
    } catch (err) {
      setError("Erro inesperado ao suspender sessão");
      console.error("Error suspending session:", err);
    }
  };

  const handleCompleteSession = async (sessionId: string) => {
    try {
      const response = await completeTreatmentSession(sessionId, {
        completion_notes: "Tratamento completado com sucesso",
      });
      if (response.success) {
        await loadData();
      } else {
        setError(response.error || "Erro ao completar sessão");
      }
    } catch (err) {
      setError("Erro inesperado ao completar sessão");
      console.error("Error completing session:", err);
    }
  };

  const getPatientName = (patientId: number) => {
    const patient = patients.find((p) => p.id === patientId);
    return patient?.name || `Paciente #${patientId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">
              Carregando sistema de acompanhamento...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Acompanhamento de Tratamentos
          </h1>
          <p className="text-gray-600">
            Sistema completo para gerenciar sessões de tratamento e registros
            individuais
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="text-red-500">❌</span>
              <p className="text-red-700">{error}</p>
            </div>
            <button
              onClick={loadData}
              className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              Tentar novamente
            </button>
          </div>
        )}

        <div className="flex gap-2 mb-6">
          <button
            onClick={handleCreateSession}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            ➕ Criar Nova Sessão
          </button>
          <button
            onClick={loadData}
            className="px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
          >
            🔄 Atualizar
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Treatment Sessions */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Sessões de Tratamento ({sessions.length})
            </h2>

            {sessions.length === 0 ? (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <p className="text-gray-500">
                  Nenhuma sessão de tratamento encontrada.
                </p>
                <button
                  onClick={handleCreateSession}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Criar primeira sessão
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {sessions.map((session) => (
                  <div key={session.id} className="relative">
                    <TreatmentSessionCard
                      session={session}
                      patientName={getPatientName(session.patient_id)}
                      onActivate={handleActivateSession}
                      onSuspend={handleSuspendSession}
                      onComplete={handleCompleteSession}
                    />
                    <button
                      onClick={() => setSelectedSession(session)}
                      className="absolute top-4 right-16 px-3 py-1 bg-purple-600 text-white text-sm rounded hover:bg-purple-700"
                    >
                      📋 Ver Registros
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Session Records */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Registros de Sessão
            </h2>

            {selectedSession ? (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium">
                    Tratamento {selectedSession.type} -{" "}
                    {getPatientName(selectedSession.patient_id)}
                  </h3>
                  <button
                    onClick={() => setSelectedSession(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                <SessionRecordsList
                  treatmentSessionId={selectedSession.id.toString()}
                  patientName={getPatientName(selectedSession.patient_id)}
                  onRecordUpdate={loadData}
                />
              </div>
            ) : (
              <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                <p className="text-gray-500">
                  Selecione uma sessão de tratamento para ver os registros.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

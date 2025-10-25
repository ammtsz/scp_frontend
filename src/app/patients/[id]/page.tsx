"use client";

import { useParams } from "next/navigation";
import React, { useEffect, useState, useCallback } from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import { getPatientById } from "@/api/patients";
import { getAttendancesByPatient } from "@/api/attendances";
import {
  transformSinglePatientFromApi,
  transformPatientWithAttendances,
} from "@/utils/apiTransformers";
import { Patient } from "@/types/types";
import { PatientStatusOverview } from "@/components/patients/TreatmentStatusBadge";
import { HeaderCard } from "@/components/patients/HeaderCard";
import { CurrentTreatmentCard } from "@/components/patients/CurrentTreatmentCard";
import { AttendanceHistoryCard } from "@/components/patients/AttendanceHistoryCard";
import { FutureAppointmentsCard } from "@/components/patients/FutureAppointmentsCard";
import { PatientNotesCard } from "@/components/patients/PatientNotesCard";
import { PatientDetailSkeleton } from "@/components/patients/PatientDetailSkeleton";
import { PageError } from "@/components/common/PageError";
import { useRetry } from "@/hooks/useRetry";

export default function PatientDetailPage() {
  const params = useParams();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);

  const fetchPatientData = useCallback(async () => {
    if (!params.id) return;

    try {
      setLoading(true);
      setError(null);
      setAttendanceError(null);

      // Fetch patient data and attendance history in parallel
      const [patientResult, attendancesResult] = await Promise.all([
        getPatientById(params.id as string),
        getAttendancesByPatient(params.id as string),
      ]);

      if (patientResult.success && patientResult.value) {
        let transformedPatient;

        if (attendancesResult.success && attendancesResult.value) {
          // Use enhanced transformer with attendance history
          transformedPatient = transformPatientWithAttendances(
            patientResult.value,
            attendancesResult.value
          );
        } else {
          // Fallback to basic transformer if attendance fetch fails
          transformedPatient = transformSinglePatientFromApi(
            patientResult.value
          );
          // Set attendance-specific error but don't fail the whole page
          setAttendanceError(
            attendancesResult.error ||
              "Erro ao carregar histórico de atendimentos"
          );
        }

        setPatient(transformedPatient);
      } else {
        // More specific error handling based on the error message
        const errorMessage = patientResult.error || "Erro ao carregar paciente";
        setError(errorMessage);
      }
    } catch {
      setError("Erro inesperado ao carregar dados do paciente");
    } finally {
      setLoading(false);
    }
  }, [params.id]);

  const { retry, attempt, isRetrying, canRetry } = useRetry(fetchPatientData, {
    maxAttempts: 3,
    retryDelay: 2000,
    onRetry: (attemptNumber) => {
      console.log(`Tentativa ${attemptNumber} de recarregar dados do paciente`);
    },
    onMaxAttemptsReached: () => {
      console.log("Máximo de tentativas alcançado");
    },
  });

  useEffect(() => {
    fetchPatientData();
  }, [fetchPatientData]);

  // Loading state with skeleton
  if (loading || isRetrying) {
    return (
      <div className="flex flex-col gap-8 my-16">
        <div className="max-w-4xl mx-auto w-full px-4">
          <Breadcrumb
            items={[
              { label: "Pacientes", href: "/patients" },
              {
                label: isRetrying ? "Recarregando..." : "Carregando...",
                isActive: true,
              },
            ]}
          />
          <PatientDetailSkeleton />
          {isRetrying && attempt > 1 && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-center">
                Tentativa {attempt} de {3}... Recarregando dados do paciente.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Error state with retry option
  if (error) {
    const isPatientNotFound =
      error.toLowerCase().includes("não encontrado") ||
      error.toLowerCase().includes("not found");

    return (
      <div className="flex flex-col gap-8 my-16">
        <div className="max-w-4xl mx-auto w-full px-4">
          <Breadcrumb
            items={[
              { label: "Pacientes", href: "/patients" },
              {
                label: isPatientNotFound ? "Não encontrado" : "Erro",
                isActive: true,
              },
            ]}
          />
          <PageError
            error={error}
            reset={!isPatientNotFound && canRetry ? retry : undefined}
            title={
              isPatientNotFound
                ? "Paciente não encontrado"
                : attempt > 0
                ? "Falha após múltiplas tentativas"
                : "Erro ao carregar paciente"
            }
            showBackButton={true}
          />
          {!isPatientNotFound && attempt > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm text-center">
                {attempt} tentativa(s) realizadas.{" "}
                {canRetry
                  ? "Você pode tentar novamente."
                  : "Máximo de tentativas alcançado."}
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col gap-8 my-16">
        <div className="max-w-4xl mx-auto w-full px-4">
          <Breadcrumb
            items={[
              { label: "Pacientes", href: "/patients" },
              { label: "Não encontrado", isActive: true },
            ]}
          />
          <PageError
            error="Paciente não encontrado."
            title="Paciente não encontrado"
            backLabel="Voltar para Pacientes"
            showBackButton={true}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8 py-4 sm:py-6 lg:py-8">
        <Breadcrumb
          items={[
            { label: "Pacientes", href: "/patients" },
            { label: patient.name, isActive: true },
          ]}
        />

        {/* Show attendance error if present */}
        {attendanceError && (
          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center">
              <div className="text-yellow-500 mr-3">⚠️</div>
              <div>
                <p className="text-yellow-800 font-medium">Aviso</p>
                <p className="text-yellow-700 text-sm">{attendanceError}</p>
              </div>
            </div>
          </div>
        )}

        <HeaderCard patient={patient} />

        {/* Responsive Layout: Mobile-first approach with better breakpoints */}
        <div className="grid grid-cols-1 xl:grid-cols-3 lg:grid-cols-1 gap-4 sm:gap-6">
          {/* Mobile: Status Overview First (Most Important) */}
          <div className="xl:hidden order-1">
            <PatientStatusOverview
              priority={patient.priority}
              totalAttendances={patient.previousAttendances.length}
              weeksInTreatment={Math.ceil(
                (new Date().getTime() - new Date(patient.startDate).getTime()) /
                  (1000 * 60 * 60 * 24 * 7)
              )}
              nextAppointment={
                patient.nextAttendanceDates[0]?.date
                  ? new Date(
                      patient.nextAttendanceDates[0].date
                    ).toLocaleDateString("pt-BR")
                  : "Não agendado"
              }
            />
          </div>

          {/* Main Content Column - Treatment Info */}
          <div className="xl:col-span-2 order-2 space-y-4 sm:space-y-6">
            <CurrentTreatmentCard patient={patient} />

            {/* Mobile: Notes Card After Current Treatment */}
            <div className="xl:hidden">
              <PatientNotesCard patientId={patient.id} />
            </div>

            <AttendanceHistoryCard patient={patient} />
            <FutureAppointmentsCard patient={patient} />
          </div>

          {/* Desktop: Right Sidebar */}
          <div className="hidden xl:block order-3 space-y-4 sm:space-y-6">
            <PatientNotesCard patientId={patient.id} />
            <PatientStatusOverview
              priority={patient.priority}
              totalAttendances={patient.previousAttendances.length}
              weeksInTreatment={Math.ceil(
                (new Date().getTime() - new Date(patient.startDate).getTime()) /
                  (1000 * 60 * 60 * 24 * 7)
              )}
              nextAppointment={
                patient.nextAttendanceDates[0]?.date
                  ? new Date(
                      patient.nextAttendanceDates[0].date
                    ).toLocaleDateString("pt-BR")
                  : "Não agendado"
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}

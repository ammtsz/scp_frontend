"use client";

import { useParams } from "next/navigation";
import React from "react";
import Breadcrumb from "@/components/common/Breadcrumb";
import {
  LazyHeaderCard,
  LazyCurrentTreatmentCard,
  LazyAttendanceHistoryCard,
  LazyScheduledAttendancesCard,
  LazyPatientNotesCard,
  LazyPatientStatusOverview,
  LazyComponentWrapper,
} from "@/components/patients/LazyComponents";
import { PatientDetailSkeleton } from "@/components/patients/PatientDetailSkeleton";
import { PageError } from "@/components/common/PageError";
import { usePatientWithAttendances } from "@/hooks/usePatientQueries";

export default function PatientDetailPage() {
  const params = useParams();
  const patientId = params.id as string;

  // Use React Query for data fetching and caching
  const {
    data: patient,
    isLoading,
    error,
    refetch,
    isRefetching,
    failureCount,
  } = usePatientWithAttendances(patientId);

  // Loading state with skeleton
  if (isLoading || isRefetching) {
    return (
      <div className="flex flex-col gap-8 my-16">
        <div className="max-w-4xl mx-auto w-full px-4">
          <Breadcrumb
            items={[
              { label: "Pacientes", href: "/patients" },
              {
                label: isRefetching ? "Recarregando..." : "Carregando...",
                isActive: true,
              },
            ]}
          />
          <PatientDetailSkeleton />
          {isRefetching && failureCount > 1 && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-center">
                Tentativa {failureCount} de 3... Recarregando dados do paciente.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Error state with retry option
  if (error) {
    const errorMessage = error.message || "Erro desconhecido";
    const isPatientNotFound =
      errorMessage.toLowerCase().includes("não encontrado") ||
      errorMessage.toLowerCase().includes("not found");

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
            error={errorMessage}
            reset={!isPatientNotFound ? refetch : undefined}
            title={
              isPatientNotFound
                ? "Paciente não encontrado"
                : failureCount > 0
                ? "Falha após múltiplas tentativas"
                : "Erro ao carregar paciente"
            }
            showBackButton={true}
          />
          {!isPatientNotFound && failureCount > 0 && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm text-center">
                {failureCount} tentativa(s) realizadas. Você pode tentar
                novamente.
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

        <LazyComponentWrapper>
          <LazyHeaderCard patient={patient} />
        </LazyComponentWrapper>

        {/* Responsive Layout: Mobile-first approach with better breakpoints */}
        <div className="grid grid-cols-1 xl:grid-cols-3 lg:grid-cols-1 gap-4 sm:gap-6">
          {/* Mobile: Status Overview First (Most Important) */}
          <div className="xl:hidden order-1">
            <LazyComponentWrapper>
              <LazyPatientStatusOverview
                priority={patient.priority}
                totalAttendances={patient.previousAttendances.length}
                weeksInTreatment={Math.ceil(
                  (new Date().getTime() -
                    new Date(patient.startDate).getTime()) /
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
            </LazyComponentWrapper>
          </div>

          {/* Main Content Column - Treatment Info */}
          <div className="xl:col-span-2 order-2 space-y-4 sm:space-y-6">
            <LazyComponentWrapper>
              <LazyCurrentTreatmentCard patient={patient} />
            </LazyComponentWrapper>

            {/* Mobile: Notes Card After Current Treatment */}
            <div className="xl:hidden">
              <LazyComponentWrapper>
                <LazyPatientNotesCard patientId={patient.id} />
              </LazyComponentWrapper>
            </div>

            <LazyComponentWrapper>
              <LazyAttendanceHistoryCard patient={patient} />
            </LazyComponentWrapper>

            <LazyComponentWrapper>
              <LazyScheduledAttendancesCard patient={patient} />
            </LazyComponentWrapper>
          </div>

          {/* Desktop: Right Sidebar */}
          <div className="hidden xl:block order-3 space-y-4 sm:space-y-6">
            <LazyComponentWrapper>
              <LazyPatientStatusOverview
                priority={patient.priority}
                totalAttendances={patient.previousAttendances.length}
                weeksInTreatment={Math.ceil(
                  (new Date().getTime() -
                    new Date(patient.startDate).getTime()) /
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
            </LazyComponentWrapper>

            <LazyComponentWrapper>
              <LazyPatientNotesCard patientId={patient.id} />
            </LazyComponentWrapper>
          </div>
        </div>
      </div>
    </div>
  );
}

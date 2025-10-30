"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  PatientResponseDto,
  AttendanceResponseDto,
  AttendanceType,
} from "@/api/types";
import { Patient } from "@/types/types";
import {
  useCreateAttendance,
  useCheckInAttendance,
  useCompleteAttendance,
} from "@/hooks/useAttendanceQueries";
import TreatmentRecommendationsModal from "@/components/patients/TreatmentRecommendationsModal";
import { convertToPatient, generatePatientSummary } from "@/utils/patientUtils";

interface QuickActionsProps {
  patient: PatientResponseDto | Patient;
  latestAttendance?: AttendanceResponseDto;
  onAttendanceUpdate?: () => void;
}

export default function QuickActions({
  patient,
  latestAttendance,
  onAttendanceUpdate,
}: QuickActionsProps) {
  console.log({ latestAttendance });
  // Modal state
  const [isRecommendationsModalOpen, setIsRecommendationsModalOpen] =
    useState(false);

  // React Query mutations for better cache management
  const createAttendanceMutation = useCreateAttendance();
  const checkInAttendanceMutation = useCheckInAttendance();
  const completeAttendanceMutation = useCompleteAttendance();

  // Normalize patient ID to number (handle both legacy and new types)
  const patientId =
    typeof patient.id === "string" ? parseInt(patient.id) : patient.id;

  const handleCreateAttendance = async () => {
    try {
      const attendanceData = {
        patientId,
        attendanceType: AttendanceType.SPIRITUAL,
        scheduledDate: new Date().toISOString().slice(0, 10),
      };

      await createAttendanceMutation.mutateAsync(attendanceData);

      // No need for toast - React Query mutations handle notifications
      if (onAttendanceUpdate) {
        onAttendanceUpdate();
      }
    } catch (error) {
      console.error("Error creating attendance:", error);
      // React Query mutations handle error notifications
    }
  };

  const handleCheckIn = async () => {
    if (!latestAttendance) return;

    try {
      await checkInAttendanceMutation.mutateAsync({
        attendanceId: latestAttendance.id,
        patientName: patient.name || "Patient",
      });

      if (onAttendanceUpdate) {
        onAttendanceUpdate();
      }
    } catch (error) {
      console.error("Check-in error:", error);
      // React Query mutations handle error notifications
    }
  };

  const handleCompleteAttendance = async () => {
    if (!latestAttendance) return;

    try {
      await completeAttendanceMutation.mutateAsync({
        id: latestAttendance.id.toString(),
      });

      if (onAttendanceUpdate) {
        onAttendanceUpdate();
      }
    } catch (error) {
      console.error("Complete attendance error:", error);
      // React Query mutations handle error notifications
    }
  };

  const handleExportSummary = () => {
    // Generate patient summary for export
    const summary = generatePatientSummary(patient, latestAttendance);

    // Create a downloadable text file
    const blob = new Blob([summary], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resumo-${patient.name.replace(/\s+/g, "-").toLowerCase()}-${
      new Date().toISOString().split("T")[0]
    }.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const canCheckIn = latestAttendance?.status === "scheduled";
  const canComplete =
    latestAttendance?.status === "checked_in" ||
    latestAttendance?.status === "in_progress";

  return (
    <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
      {/* Create New Attendance */}
      <button
        className="ds-button-secondary flex-1 sm:flex-none"
        onClick={handleCreateAttendance}
        disabled={createAttendanceMutation.isPending}
      >
        {createAttendanceMutation.isPending
          ? "⏳ Criando..."
          : "📅 Novo Agendamento"}
      </button>

      {/* Create Recommendations */}
      <button
        className="ds-button-secondary flex-1 sm:flex-none"
        onClick={() => setIsRecommendationsModalOpen(true)}
      >
        📋 Criar Recomendações
      </button>

      {/* Check-in (only if scheduled) */}
      {canCheckIn && (
        <button
          className="ds-button-success flex-1 sm:flex-none"
          onClick={handleCheckIn}
          disabled={checkInAttendanceMutation.isPending}
        >
          {checkInAttendanceMutation.isPending
            ? "⏳ Processando..."
            : "✅ Check-in"}
        </button>
      )}

      {/* Complete Attendance (only if checked in or ongoing) */}
      {canComplete && (
        <button
          className="ds-button-success flex-1 sm:flex-none"
          onClick={handleCompleteAttendance}
          disabled={completeAttendanceMutation.isPending}
        >
          {completeAttendanceMutation.isPending
            ? "⏳ Finalizando..."
            : "🏁 Finalizar"}
        </button>
      )}

      {/* Edit Patient */}
      <Link
        href={`/patients/${patient.id}/edit`}
        className="inline-flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md text-sm font-semibold transition-colors min-h-[44px] flex-1 sm:flex-none text-center"
      >
        ✏️ Editar
      </Link>

      {/* Export Summary - unavailable for now */}
      {false && (
        <button
          className="ds-button-outline flex-1 sm:flex-none"
          onClick={handleExportSummary}
        >
          📄 Exportar
        </button>
      )}

      {/* Treatment Recommendations Modal */}
      {isRecommendationsModalOpen && (
        <TreatmentRecommendationsModal
          isOpen={isRecommendationsModalOpen}
          onClose={() => setIsRecommendationsModalOpen(false)}
          patient={convertToPatient(patient)}
          onSuccess={() => {
            setIsRecommendationsModalOpen(false);
            if (onAttendanceUpdate) {
              onAttendanceUpdate();
            }
          }}
        />
      )}
    </div>
  );
}

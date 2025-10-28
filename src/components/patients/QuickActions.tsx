"use client";

import React from "react";
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
      {/* Edit Patient */}
      <Link
        href={`/patients/${patient.id}/edit`}
        className="inline-flex items-center justify-center px-4 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md text-sm font-semibold transition-colors min-h-[44px] flex-1 sm:flex-none text-center"
      >
        ✏️ Editar
      </Link>

      {/* Create New Attendance */}
      <button
        className="ds-button-primary flex-1 sm:flex-none"
        onClick={handleCreateAttendance}
        disabled={createAttendanceMutation.isPending}
      >
        {createAttendanceMutation.isPending
          ? "⏳ Criando..."
          : "📅 Novo Agendamento"}
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

      {/* Export Summary */}
      <button
        className="ds-button-outline flex-1 sm:flex-none"
        onClick={handleExportSummary}
      >
        📄 Exportar
      </button>
    </div>
  );
}

function generatePatientSummary(
  patient: PatientResponseDto | Patient,
  latestAttendance?: AttendanceResponseDto
): string {
  const now = new Date();
  const formattedDate = now.toLocaleDateString("pt-BR");
  const formattedTime = now.toLocaleTimeString("pt-BR");

  // Type guard to check if it's a PatientResponseDto
  const isPatientResponseDto = (
    p: PatientResponseDto | Patient
  ): p is PatientResponseDto => {
    return "treatment_status" in p;
  };

  const isDto = isPatientResponseDto(patient);

  return `
RESUMO DO PACIENTE
==================

Gerado em: ${formattedDate} às ${formattedTime}

INFORMAÇÕES PESSOAIS
-------------------
Nome: ${patient.name}
Telefone: ${patient.phone || "Não informado"}
Prioridade: ${getPriorityLabel(patient.priority.toString())}
${
  isDto
    ? `Status do Tratamento: ${getTreatmentStatusLabel(
        patient.treatment_status
      )}`
    : ""
}
${
  isDto && patient.birth_date
    ? `Data de Nascimento: ${new Date(patient.birth_date).toLocaleDateString(
        "pt-BR"
      )}`
    : ""
}
${
  isDto
    ? `Data de Início: ${new Date(patient.start_date).toLocaleDateString(
        "pt-BR"
      )}`
    : ""
}
${isDto ? `Sequência de Faltas: ${patient.missing_appointments_streak}` : ""}

QUEIXA PRINCIPAL
---------------
${
  (isDto ? patient.main_complaint : (patient as Patient).mainComplaint) ||
  "Não informada"
}

ÚLTIMO ATENDIMENTO
-----------------
${
  latestAttendance
    ? `
Tipo: ${getAttendanceTypeLabel(latestAttendance.type)}
Status: ${getStatusLabel(latestAttendance.status)}
Data Agendada: ${
        latestAttendance.scheduled_date
          ? new Date(latestAttendance.scheduled_date).toLocaleDateString(
              "pt-BR"
            )
          : "Não informada"
      }
Observações: ${latestAttendance.notes || "Nenhuma observação"}
`
    : "Nenhum atendimento registrado"
}

${
  isDto
    ? `
INFORMAÇÕES ADICIONAIS
---------------------
Data de Alta: ${
        patient.discharge_date
          ? new Date(patient.discharge_date).toLocaleDateString("pt-BR")
          : "Não aplicável"
      }
Criado em: ${new Date(patient.created_at).toLocaleDateString("pt-BR")}
Última Atualização: ${new Date(patient.updated_at).toLocaleDateString("pt-BR")}
`
    : ""
}

---
Este resumo foi gerado automaticamente pelo sistema MVP Center.
`.trim();
}

function getPriorityLabel(priority: string): string {
  switch (priority) {
    case "1":
      return "Emergência (1)";
    case "2":
      return "Intermediária (2)";
    case "3":
      return "Normal (3)";
    default:
      return priority;
  }
}

function getTreatmentStatusLabel(status: string): string {
  switch (status) {
    case "N":
      return "Novo Paciente";
    case "T":
      return "Em Tratamento";
    case "A":
      return "Alta";
    case "F":
      return "Ausente";
    default:
      return status;
  }
}

function getAttendanceTypeLabel(type: string): string {
  switch (type) {
    case "spiritual":
      return "Consulta Espiritual";
    case "light_bath":
      return "Banho de Luz";
    case "rod":
      return "Tratamento com Bastão";
    default:
      return type;
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case "scheduled":
      return "Agendado";
    case "checked_in":
      return "Check-in Realizado";
    case "in_progress":
      return "Em Atendimento";
    case "completed":
      return "Concluído";
    case "cancelled":
      return "Cancelado";
    case "missed":
      return "Perdido";
    default:
      return status;
  }
}

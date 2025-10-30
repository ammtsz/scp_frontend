/**
 * Patient Utility Functions
 * 
 * Pure utility functions for patient data validation and calculations.
 * These functions don't involve API calls and can be used across the application.
 */

import { Patient } from "@/types/types";
import { PatientResponseDto, AttendanceResponseDto } from "@/api/types";

/**
 * Validate patient data before creation/update
 */
export function validatePatientData({
  name,
  phone,
  birthDate
}: {
  name: string;
  phone?: string;
  birthDate: Date;
}) {
  const errors: string[] = [];

  // Name validation
  if (!name || name.trim().length === 0) {
    errors.push("Name is required");
  } else if (name.trim().length < 2) {
    errors.push("Name must be at least 2 characters long");
  }

  // Phone validation (optional but must be valid if provided)
  if (phone && phone.trim().length > 0) {
    const phoneRegex = /^\d{10,15}$/; // Simple phone validation
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
      errors.push("Phone number must be 10-15 digits");
    }
  }

  // Birth date validation
  const today = new Date();
  if (birthDate > today) {
    errors.push("Birth date cannot be in the future");
  }

  const minDate = new Date();
  minDate.setFullYear(today.getFullYear() - 120); // Max 120 years old
  if (birthDate < minDate) {
    errors.push("Birth date is too far in the past");
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Calculate age from birth date
 */
export function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Format patient data for display
 */
export function formatPatientForDisplay(patient: Patient) {
  return {
    ...patient,
    formattedPhone: patient.phone 
      ? patient.phone.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
      : 'N/A',
    formattedBirthDate: patient.birthDate.toLocaleDateString('pt-BR'),
    age: calculateAge(patient.birthDate)
  };
}

/**
 * Helper function to convert PatientResponseDto to Patient type
 */
export function convertToPatient(patient: PatientResponseDto | Patient): Patient {
  // If it's already a Patient type, return as is
  if ("currentRecommendations" in patient || "previousAttendances" in patient) {
    return patient as Patient;
  }

  // Convert PatientResponseDto to Patient
  const dto = patient as PatientResponseDto;
  return {
    id: dto.id.toString(),
    name: dto.name,
    phone: dto.phone || "",
    priority: dto.priority,
    status: dto.treatment_status,
    birthDate: dto.birth_date ? new Date(dto.birth_date) : new Date(),
    mainComplaint: dto.main_complaint || "",
    startDate: new Date(dto.start_date),
    dischargeDate: dto.discharge_date ? new Date(dto.discharge_date) : null,
    timezone: undefined, // Not available in DTO, will be loaded by modal if needed
    nextAttendanceDates: [],
    currentRecommendations: {
      date: new Date(),
      food: "",
      water: "",
      ointment: "",
      lightBath: false,
      rod: false,
      spiritualTreatment: false,
      returnWeeks: 2,
    },
    previousAttendances: [], // Will be loaded by the modal if needed
  };
}

/**
 * Generate a formatted patient summary for export
 */
export function generatePatientSummary(
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

/**
 * Get human-readable priority label
 */
export function getPriorityLabel(priority: string): string {
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

/**
 * Get human-readable treatment status label
 */
export function getTreatmentStatusLabel(status: string): string {
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

/**
 * Get human-readable attendance type label
 */
export function getAttendanceTypeLabel(type: string): string {
  switch (type) {
    case "spiritual":
      return "Consulta Espiritual";
    case "light_bath":
      return "Banho de Luz";
    case "rod":
      return "Bastão";
    default:
      return type;
  }
}

/**
 * Get human-readable attendance status label
 */
export function getStatusLabel(status: string): string {
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
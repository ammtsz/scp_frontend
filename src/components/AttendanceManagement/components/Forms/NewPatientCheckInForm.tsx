"use client";

import React, { useState } from "react";
import { Patient, AttendanceType, Priority } from "@/types/types";
import { createAttendance, checkInAttendance } from "@/api/attendances";
import { updatePatient } from "@/api/patients";
import { useAttendances } from "@/contexts/AttendancesContext";
import { usePatients } from "@/contexts/PatientsContext";
import {
  transformAttendanceTypeToApi,
  transformPriorityToApi,
} from "@/utils/apiTransformers";
import { TreatmentStatus } from "@/api/types";
import { formatPhoneNumber, formatDateForInput } from "@/utils/formHelpers";
import ErrorDisplay from "@/components/common/ErrorDisplay";

interface NewPatientCheckInFormProps {
  patient: Patient;
  attendanceId?: number;
  onSuccess: (updatedPatient: Patient) => void;
  onCancel: () => void;
}

const priorityOptions = [
  { value: "1", label: "1 - Emergência" },
  { value: "2", label: "2 - Intermediário" },
  { value: "3", label: "3 - Normal" },
];

const NewPatientCheckInForm: React.FC<NewPatientCheckInFormProps> = ({
  patient,
  attendanceId,
  onSuccess,
  onCancel,
}) => {
  const { refreshCurrentDate } = useAttendances();
  const { refreshPatients } = usePatients();

  // Form state for patient information
  const [formData, setFormData] = useState({
    name: patient.name || "",
    phone: patient.phone || "",
    birthDate: patient.birthDate ? formatDateForInput(patient.birthDate) : "",
    priority: patient.priority || ("3" as Priority),
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    setFormData((prev) => ({
      ...prev,
      phone: formatted,
    }));
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError("Nome é obrigatório.");
      return false;
    }
    if (!formData.phone.trim()) {
      setError("Telefone é obrigatório.");
      return false;
    }
    if (!formData.birthDate) {
      setError("Data de nascimento é obrigatória.");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // First, update the patient information
      const updateData = {
        name: formData.name.trim(),
        phone: formData.phone,
        birth_date: formData.birthDate, // Send as ISO date string (YYYY-MM-DD)
        priority: transformPriorityToApi(formData.priority),
        treatment_status: TreatmentStatus.IN_TREATMENT, // Change status from "N" (new) to "T" (in treatment)
      };

      const updateResult = await updatePatient(patient.id, updateData);

      if (!updateResult.success) {
        console.error("Patient update failed:", updateResult);
        setError(
          `Erro ao atualizar informações do paciente: ${
            updateResult.error || "Erro desconhecido"
          }`
        );
        return;
      }

      // Check if we have an existing attendance to check in, or need to create a new one
      if (attendanceId) {
        // Check in the existing attendance
        const checkInResult = await checkInAttendance(attendanceId.toString());
        if (!checkInResult.success) {
          setError(
            `Erro ao fazer check-in: ${
              checkInResult.error || "Erro desconhecido"
            }`
          );
          return;
        }
      } else {
        // Create a new spiritual consultation attendance (default for new patients)
        const today = new Date();
        const now = new Date();

        // Create attendance
        const createResult = await createAttendance({
          patient_id: parseInt(patient.id),
          type: transformAttendanceTypeToApi("spiritual" as AttendanceType),
          scheduled_date: today.toISOString().split("T")[0], // YYYY-MM-DD
          scheduled_time: now.toTimeString().split(" ")[0].substring(0, 5), // HH:mm
        });

        if (createResult.success && createResult.value?.id) {
          // Immediately check in the new attendance
          const checkInResult = await checkInAttendance(
            createResult.value.id.toString()
          );
          if (!checkInResult.success) {
            console.warn(
              `Failed to check in attendance ${createResult.value.id}:`,
              checkInResult.error
            );
          }
        } else {
          setError("Erro ao criar atendimento. Tente novamente.");
          return;
        }
      }

      // Refresh contexts to update the UI
      await Promise.all([refreshCurrentDate(), refreshPatients()]);

      // Create updated patient object for callback
      const updatedPatient: Patient = {
        ...patient,
        name: formData.name.trim(),
        phone: formData.phone,
        birthDate: new Date(formData.birthDate),
        priority: formData.priority,
        status: "T",
      };

      // Call success callback
      onSuccess(updatedPatient);
    } catch (err) {
      console.error("Error during check-in:", err);
      setError("Erro ao processar check-in. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6">
      <div className="space-y-4 mb-6">
        {/* Name Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nome Completo *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Digite o nome completo"
            disabled={isSubmitting}
          />
        </div>

        {/* Phone Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Telefone *
          </label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="(00) 00000-0000"
            disabled={isSubmitting}
          />
        </div>

        {/* Birth Date Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data de Nascimento *
          </label>
          <input
            type="date"
            value={formData.birthDate}
            onChange={(e) => handleInputChange("birthDate", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          />
        </div>

        {/* Priority Field */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Prioridade
          </label>
          <select
            value={formData.priority}
            onChange={(e) => handleInputChange("priority", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          >
            {priorityOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4">
          <ErrorDisplay error={error} />
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={onCancel}
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
        >
          Cancelar
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "Processando..." : "Fazer Check-in"}
        </button>
      </div>
    </div>
  );
};

export default NewPatientCheckInForm;

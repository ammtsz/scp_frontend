"use client";

import React, { useState } from "react";
import { Search } from "react-feather";
import { Priority, AttendanceType } from "@/types/types";
import { createPatient } from "@/api/patients";
import {
  createAttendance,
  checkInAttendance,
  getAttendancesByDate,
} from "@/api/attendances";
import { usePatients } from "@/hooks/usePatientQueries";
import { useAttendancesByDate } from "@/hooks/useAttendanceQueries";
import {
  transformPriorityToApi,
  transformAttendanceTypeToApi,
} from "@/utils/apiTransformers";
import {
  formatPhoneNumber,
  formatDateForInput,
  validatePatientForm,
} from "@/utils/formHelpers";
import Switch from "@/components/common/Switch";
import ErrorDisplay from "@/components/common/ErrorDisplay";

interface PatientWalkInFormProps {
  onRegisterNewAttendance?: (
    patientName: string,
    types: string[],
    isNew: boolean,
    priority: Priority
  ) => void;
  isDropdown?: boolean; // Controls whether to render with card styling
}

interface WalkInFormData {
  name: string;
  phone: string;
  birthDate: Date | null;
  priority: Priority;
  mainComplaint: string;
  selectedTypes: string[];
  isNewPatient: boolean;
  selectedPatient: string;
}

const attendanceTypes = [
  { value: "spiritual", label: "Consulta Espiritual" },
  { value: "lightBath", label: "Banho de Luz" },
  { value: "rod", label: "Bastão" },
];

const PatientWalkInForm: React.FC<PatientWalkInFormProps> = ({
  onRegisterNewAttendance,
  isDropdown = false,
}) => {
  const { data: patients = [], refetch: refreshPatients } = usePatients();
  const { refetch: refreshCurrentDate } = useAttendancesByDate(
    new Date().toISOString().split("T")[0]
  );

  const [formData, setFormData] = useState<WalkInFormData>({
    name: "",
    phone: "",
    birthDate: null,
    priority: "3",
    mainComplaint: "",
    selectedTypes: [],
    isNewPatient: false,
    selectedPatient: "",
  });

  const [showDropdown, setShowDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(formData.name.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;

    if (type === "date") {
      const dateValue = value ? new Date(value) : null;
      setFormData((prev) => ({ ...prev, [name]: dateValue }));
      return;
    }

    // Format phone number as user types
    if (name === "phone") {
      const formatted = formatPhoneNumber(value);
      setFormData((prev) => ({ ...prev, [name]: formatted }));
      return;
    }

    if (name === "name") {
      setFormData((prev) => ({ ...prev, name: value, selectedPatient: "" }));
      setShowDropdown(true);
      setError(null);
      setSuccess(null);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handlePatientSelect = (patientName: string) => {
    const selected = filteredPatients.find((p) => p.name === patientName);
    setFormData((prev) => ({
      ...prev,
      name: patientName,
      selectedPatient: patientName,
      priority: selected?.priority || "3",
    }));
    setShowDropdown(false);
    setError(null);
    setSuccess(null);
  };

  const handleTypeCheckbox = (type: string, checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      selectedTypes: checked
        ? [...prev.selectedTypes, type]
        : prev.selectedTypes.filter((t) => t !== type),
    }));
    setError(null);
    setSuccess(null);
  };

  const handleNewPatientToggle = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      isNewPatient: checked,
      name: "",
      selectedPatient: "",
      phone: "",
      birthDate: null,
      mainComplaint: "",
    }));
    setShowDropdown(false);
    setError(null);
    setSuccess(null);
  };

  const validateForm = (): boolean => {
    const name = formData.isNewPatient
      ? formData.name.trim()
      : formData.selectedPatient;

    if (!name) {
      setError("Nome do paciente é obrigatório");
      return false;
    }

    if (formData.selectedTypes.length === 0) {
      setError("Selecione pelo menos um tipo de atendimento");
      return false;
    }

    if (formData.isNewPatient) {
      // Use utility validation for patient form data
      const validationError = validatePatientForm(
        {
          name: formData.name,
          phone: formData.phone,
          birthDate: formData.birthDate,
        },
        false, // phone not required
        true // birthDate required for new patients
      );

      if (validationError) {
        setError(validationError);
        return false;
      }
    }

    return true;
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      birthDate: null,
      priority: "3",
      mainComplaint: "",
      selectedTypes: [],
      isNewPatient: false,
      selectedPatient: "",
    });
    setShowDropdown(false);
    setError(null);
    setSuccess(null);
  };

  const checkForDuplicateAttendances = async (
    patientId: string,
    selectedTypes: string[]
  ): Promise<string[]> => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const result = await getAttendancesByDate(today);

      if (!result.success || !result.value) {
        // If we can't check, proceed cautiously
        return [];
      }

      const existingAttendances = result.value.filter(
        (attendance) => attendance.patient_id === Number(patientId)
      );

      const duplicateTypes: string[] = [];

      selectedTypes.forEach((type) => {
        const apiType = transformAttendanceTypeToApi(type as AttendanceType);
        const hasDuplicate = existingAttendances.some(
          (attendance) => attendance.type === apiType
        );

        if (hasDuplicate) {
          const typeLabel =
            attendanceTypes.find((t) => t.value === type)?.label || type;
          duplicateTypes.push(typeLabel);
        }
      });

      return duplicateTypes;
    } catch (error) {
      console.error("Error checking for duplicate attendances:", error);
      return [];
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const name = formData.isNewPatient
        ? formData.name.trim()
        : formData.selectedPatient;
      let patientId: string;

      if (formData.isNewPatient) {
        // Check if patient already exists
        const existingPatient = patients.find(
          (p) => p.name.toLowerCase() === name.toLowerCase()
        );

        if (existingPatient) {
          setError(
            "Paciente já cadastrado. Desmarque 'Novo paciente' para selecioná-lo."
          );
          return;
        }

        // Create new patient with additional data
        const createPatientResult = await createPatient({
          name: name,
          priority: transformPriorityToApi(formData.priority),
          phone: formData.phone || undefined,
          birth_date: formData.birthDate
            ? formData.birthDate.toISOString().split("T")[0]
            : undefined,
          main_complaint: formData.mainComplaint.trim(),
        });

        if (!createPatientResult.success || !createPatientResult.value) {
          setError(createPatientResult.error || "Erro ao criar paciente");
          return;
        }

        patientId = String(createPatientResult.value.id);

        // Refresh patients list to include the new patient
        await refreshPatients();
      } else {
        // Find existing patient
        const selectedPatientData = patients.find((p) => p.name === name);
        if (!selectedPatientData) {
          setError("Paciente selecionado não encontrado.");
          return;
        }

        patientId = String(selectedPatientData.id);
      }

      // Check for duplicate attendances before creating new ones
      // (This check is more important for existing patients, but included for completeness)
      const duplicateTypes = await checkForDuplicateAttendances(
        patientId,
        formData.selectedTypes
      );

      if (duplicateTypes.length > 0) {
        const patientName = formData.isNewPatient
          ? formData.name
          : formData.selectedPatient;
        setError(
          `Agendamento duplicado! O paciente ${patientName} já possui atendimento(s) agendado(s) para hoje nos seguintes tipos: ${duplicateTypes.join(
            ", "
          )}.`
        );
        return;
      }

      // Get current date and time
      const today = new Date().toISOString().split("T")[0];
      const currentTime = "20:00"; // Default scheduled time

      // Create attendances for each selected type
      const attendancePromises = formData.selectedTypes.map(async (type) => {
        const notes = formData.isNewPatient
          ? `Check-in sem agendamento - Novo paciente`
          : `Check-in sem agendamento - Paciente existente`;

        // First create the attendance
        const createResult = await createAttendance({
          patient_id: Number(patientId),
          type: transformAttendanceTypeToApi(type as AttendanceType),
          scheduled_date: today,
          scheduled_time: currentTime,
          notes: notes,
        });

        if (!createResult.success || !createResult.value) {
          return createResult;
        }

        // Immediately check them in (move from scheduled to checked-in)
        try {
          const checkInResult = await checkInAttendance(
            createResult.value.id.toString()
          );

          if (!checkInResult.success) {
            console.warn(
              `Failed to check in attendance ${createResult.value.id}:`,
              checkInResult.error
            );
            // Return the original creation result even if check-in fails
          }
        } catch (error) {
          console.warn(
            `Error during check-in for attendance ${createResult.value.id}:`,
            error
          );
          // Continue with the original creation result
        }

        return createResult;
      });

      const results = await Promise.all(attendancePromises);

      // Check if all attendances were created successfully
      const failedCreations = results.filter((result) => !result.success);

      if (failedCreations.length > 0) {
        setError(
          `Erro ao criar ${failedCreations.length} atendimento(s). Algumas podem ter sido criadas com sucesso.`
        );
        // Refresh attendances to show any successful records
        await refreshCurrentDate();
        return false;
      } else {
        setSuccess(
          `Check-in realizado com sucesso! ${formData.selectedTypes.length} atendimento(s) agendado(s) para hoje.`
        );

        // Refresh attendances to show the new records
        await refreshCurrentDate();

        // Call parent callback if provided
        if (onRegisterNewAttendance) {
          onRegisterNewAttendance(
            name,
            formData.selectedTypes,
            formData.isNewPatient,
            formData.priority
          );
        }

        // Reset form only on complete success
        resetForm();

        return true;
      }
    } catch (error) {
      console.error("Error in handleSubmit:", error);
      setError("Erro inesperado ao processar check-in. Tente novamente.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={isDropdown ? "" : "card-shadow"}>
      {!isDropdown && (
        <div className="p-4 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">
            Pacientes não Agendados
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Registro de pacientes não agendados para atendimento imediato
          </p>
        </div>
      )}

      <ErrorDisplay error={error} />

      {success && (
        <div
          className={`${
            isDropdown ? "mx-0 mt-0" : "mx-4 mt-4"
          } p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm`}
        >
          {success}
        </div>
      )}

      <form className="p-4" onSubmit={handleSubmit} autoComplete="off">
        {/* New Patient Toggle */}
        <label className="block font-bold mb-1">Nome do Paciente</label>
        <Switch
          id="new-patient-switch"
          checked={formData.isNewPatient}
          onChange={handleNewPatientToggle}
          disabled={isSubmitting}
          label="Novo paciente"
          labelPosition="right"
          size="sm"
          className="mb-2"
        />

        {/* Patient Name Input */}
        <div className="relative mb-4">
          {formData.isNewPatient ? (
            <input
              name="name"
              className="input w-full pr-10"
              placeholder="Nome do novo paciente..."
              value={formData.name}
              onChange={handleInputChange}
              required
              disabled={isSubmitting}
            />
          ) : (
            <>
              <input
                name="name"
                className="input w-full pr-10"
                placeholder="Buscar paciente pelo nome..."
                value={formData.name}
                onChange={handleInputChange}
                onFocus={() => setShowDropdown(true)}
                required
                disabled={isSubmitting}
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
              {showDropdown && formData.name && filteredPatients.length > 0 && (
                <ul className="absolute z-10 bg-white border border-gray-200 w-full max-h-40 overflow-y-auto rounded shadow">
                  {filteredPatients.map((p) => (
                    <li
                      key={p.id}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                      onClick={() => handlePatientSelect(p.name)}
                    >
                      {p.name}
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </div>

        {/* Additional fields for new patients */}
        {formData.isNewPatient && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="text-sm font-medium text-blue-800 mb-3">
              Informações do Novo Paciente
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Telefone
                </label>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="input w-full text-sm"
                  placeholder="(XX) XXXXX-XXXX"
                />
              </div>

              <div>
                <label
                  htmlFor="birthDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Data de Nascimento *
                </label>
                <input
                  id="birthDate"
                  name="birthDate"
                  type="date"
                  value={formatDateForInput(formData.birthDate)}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  className="input w-full text-sm"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="mainComplaint"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Queixa Principal
                </label>
                <textarea
                  id="mainComplaint"
                  name="mainComplaint"
                  value={formData.mainComplaint}
                  onChange={handleTextareaChange}
                  disabled={isSubmitting}
                  rows={2}
                  className="input w-full text-sm resize-y"
                  placeholder="Descreva a queixa principal do paciente..."
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="priority"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Prioridade
                </label>
                <select
                  id="priority"
                  name="priority"
                  className="input w-full h-10 text-sm"
                  value={formData.priority}
                  onChange={handleSelectChange}
                  disabled={isSubmitting}
                >
                  <option value="3">3 - Padrão</option>
                  <option value="2">2 - Idoso/crianças</option>
                  <option value="1">1 - Exceção</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Attendance Types */}
        <div className="mb-4">
          <label className="block font-bold mb-2">Tipo de atendimento</label>
          <div className="flex flex-col gap-3">
            {attendanceTypes.map((type) => (
              <Switch
                key={type.value}
                id={`attendance-type-${type.value}`}
                checked={formData.selectedTypes.includes(type.value)}
                onChange={(checked) => handleTypeCheckbox(type.value, checked)}
                disabled={isSubmitting}
                label={type.label}
                labelPosition="right"
                size="sm"
              />
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="w-full">
          <button
            type="submit"
            className="button button-primary mt-6 w-full"
            disabled={
              isSubmitting ||
              !formData.name.trim() ||
              formData.selectedTypes.length === 0 ||
              (formData.isNewPatient && !formData.birthDate)
            }
          >
            {isSubmitting ? "Processando..." : "Fazer Check-in"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientWalkInForm;

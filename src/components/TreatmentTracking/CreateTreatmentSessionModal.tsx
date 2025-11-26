"use client";

import React, { useState, useEffect } from "react";
import { X } from "react-feather";
import type {
  CreateTreatmentSessionRequest,
  PatientResponseDto,
} from "@/api/types";

interface CreateTreatmentSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTreatmentSessionRequest) => Promise<void>;
  patients: PatientResponseDto[];
  isLoading?: boolean;
}

interface FormData {
  patient_id: number | null;
  attendance_id: number | null;
  treatment_record_id: number | null;
  treatment_type: "light_bath" | "rod";
  body_location: string;
  start_date: string;
  planned_sessions: number;
  end_date: string;
  duration_minutes: number | null;
  color: string;
  notes: string;
}

const BODY_LOCATIONS = [
  "Coronário",
  "Cerebral",
  "Umbilical",
  "Renal",
  "Hepático",
  "Gástrico",
  "Pulmonar",
  "Cardíaco",
  "Frontal",
  "Occipital",
  "Temporal",
  "Parietal",
  "Cervical",
  "Dorsal",
  "Lombar",
  "Sacral",
  "Coccígeo",
];

const LIGHT_BATH_COLORS = [
  "azul",
  "verde",
  "amarelo",
  "laranja",
  "vermelho",
  "violeta",
  "rosa",
  "branco",
];

// Helper functions to convert enum values to display text
const getPriorityLabel = (priority: string) => {
  switch (priority) {
    case "1":
      return "1";
    case "2":
      return "2";
    case "3":
      return "3";
    default:
      return priority;
  }
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "N":
      return "N";
    case "T":
      return "T";
    case "A":
      return "A";
    case "F":
      return "F";
    default:
      return status;
  }
};

export function CreateTreatmentSessionModal({
  isOpen,
  onClose,
  onSubmit,
  patients,
  isLoading = false,
}: CreateTreatmentSessionModalProps) {
  const [formData, setFormData] = useState<FormData>({
    patient_id: null,
    attendance_id: null,
    treatment_record_id: null,
    treatment_type: "light_bath",
    body_location: "",
    start_date: new Date().toISOString().split("T")[0],
    planned_sessions: 10,
    end_date: "",
    duration_minutes: 3,
    color: "azul",
    notes: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {}
  );
  const [selectedPatient, setSelectedPatient] =
    useState<PatientResponseDto | null>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        patient_id: null,
        attendance_id: null,
        treatment_record_id: null,
        treatment_type: "light_bath",
        body_location: "",
        start_date: new Date().toISOString().split("T")[0],
        planned_sessions: 10,
        end_date: "",
        duration_minutes: 3,
        color: "azul",
        notes: "",
      });
      setErrors({});
      setSelectedPatient(null);
    }
  }, [isOpen]);

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (!formData.patient_id) {
      newErrors.patient_id = "Selecione um paciente";
    }

    if (!formData.body_location.trim()) {
      newErrors.body_location = "Local do corpo é obrigatório";
    }

    if (formData.planned_sessions < 1 || formData.planned_sessions > 50) {
      newErrors.planned_sessions = "Número de sessões deve estar entre 1 e 50";
    }

    if (!formData.start_date) {
      newErrors.start_date = "Data de início é obrigatória";
    }

    // Light bath specific validations
    if (formData.treatment_type === "light_bath") {
      if (
        !formData.duration_minutes ||
        formData.duration_minutes < 1 ||
        formData.duration_minutes > 10
      ) {
        newErrors.duration_minutes =
          "Duração deve estar entre 1 e 10 unidades (7min cada)";
      }
      if (!formData.color) {
        newErrors.color = "Cor é obrigatória para banho de luz";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      // For now, we'll use placeholder IDs since we need proper attendance and treatment record integration
      // In a real implementation, these would come from the consultation workflow
      const sessionData: CreateTreatmentSessionRequest = {
        patient_id: formData.patient_id!,
        attendance_id: 1, // Placeholder - would be created/selected during consultation
        treatment_record_id: 1, // Placeholder - would be created during consultation
        treatment_type: formData.treatment_type,
        body_location: formData.body_location,
        start_date: formData.start_date,
        planned_sessions: formData.planned_sessions,
        end_date: formData.end_date || undefined,
        duration_minutes:
          formData.treatment_type === "light_bath"
            ? formData.duration_minutes!
            : undefined,
        color:
          formData.treatment_type === "light_bath" ? formData.color : undefined,
        notes: formData.notes || undefined,
      };

      await onSubmit(sessionData);
      onClose();
    } catch (error) {
      console.error("Error creating treatment session:", error);
    }
  };

  const handlePatientChange = (patientId: string) => {
    const patient = patients.find((p) => p.id.toString() === patientId);
    setSelectedPatient(patient || null);
    setFormData((prev) => ({
      ...prev,
      patient_id: patient ? patient.id : null,
    }));
    setErrors((prev) => ({ ...prev, patient_id: undefined }));
  };

  useEffect(() => {
    if (formData.start_date && formData.planned_sessions) {
      const startDate = new Date(formData.start_date);
      const endDate = new Date(startDate);
      endDate.setDate(
        startDate.getDate() + (formData.planned_sessions - 1) * 7
      ); // Weekly sessions
      setFormData((prev) => ({
        ...prev,
        end_date: endDate.toISOString().split("T")[0],
      }));
    }
  }, [formData.start_date, formData.planned_sessions]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Criar Nova Sessão de Tratamento
          </h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Patient Selection */}
          <div>
            <label
              htmlFor="patient-select"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Paciente *
            </label>
            <select
              id="patient-select"
              value={formData.patient_id || ""}
              onChange={(e) => handlePatientChange(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.patient_id ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isLoading}
            >
              <option value="">Selecione um paciente</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.name} (ID: {patient.id})
                </option>
              ))}
            </select>
            {errors.patient_id && (
              <p className="mt-1 text-sm text-red-600">{errors.patient_id}</p>
            )}
            {selectedPatient && (
              <p className="mt-1 text-sm text-gray-600">
                Prioridade: {getPriorityLabel(selectedPatient.priority)} |
                Status: {getStatusLabel(selectedPatient.treatment_status)}
              </p>
            )}
          </div>

          {/* Treatment Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Tratamento *
            </label>
            <div className="flex gap-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="treatment_type"
                  value="light_bath"
                  checked={formData.treatment_type === "light_bath"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      treatment_type: e.target.value as "light_bath" | "rod",
                      duration_minutes:
                        e.target.value === "light_bath" ? 3 : null,
                      color: e.target.value === "light_bath" ? "azul" : "",
                    }))
                  }
                  disabled={isLoading}
                  className="mr-2"
                />
                Banho de Luz
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="treatment_type"
                  value="rod"
                  checked={formData.treatment_type === "rod"}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      treatment_type: e.target.value as "light_bath" | "rod",
                      duration_minutes: null,
                      color: "",
                    }))
                  }
                  disabled={isLoading}
                  className="mr-2"
                />
                Bastão
              </label>
            </div>
          </div>

          {/* Body Location */}
          <div>
            <label
              htmlFor="body-location-select"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Local do Corpo *
            </label>
            <select
              id="body-location-select"
              value={formData.body_location}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  body_location: e.target.value,
                }))
              }
              className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.body_location ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isLoading}
            >
              <option value="">Selecione o local</option>
              {BODY_LOCATIONS.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
            {errors.body_location && (
              <p className="mt-1 text-sm text-red-600">
                {errors.body_location}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Start Date */}
            <div>
              <label
                htmlFor="start-date-input"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Data de Início *
              </label>
              <input
                id="start-date-input"
                type="date"
                value={formData.start_date}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    start_date: e.target.value,
                  }))
                }
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.start_date ? "border-red-500" : "border-gray-300"
                }`}
                disabled={isLoading}
              />
              {errors.start_date && (
                <p className="mt-1 text-sm text-red-600">{errors.start_date}</p>
              )}
            </div>

            {/* Planned Sessions */}
            <div>
              <label
                htmlFor="planned-sessions-input"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Número de Sessões *
              </label>
              <input
                id="planned-sessions-input"
                type="number"
                min="1"
                max="50"
                value={formData.planned_sessions}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    planned_sessions: parseInt(e.target.value) || 1,
                  }))
                }
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                  errors.planned_sessions ? "border-red-500" : "border-gray-300"
                }`}
                disabled={isLoading}
              />
              {errors.planned_sessions && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.planned_sessions}
                </p>
              )}
            </div>
          </div>

          {/* Light Bath Specific Fields */}
          {formData.treatment_type === "light_bath" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="duration-input"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Duração (unidades de 7min) *
                </label>
                <input
                  id="duration-input"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.duration_minutes || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      duration_minutes: parseInt(e.target.value) || null,
                    }))
                  }
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.duration_minutes
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  disabled={isLoading}
                />
                {errors.duration_minutes && (
                  <p className="mt-1 text-sm text-red-600">
                    {errors.duration_minutes}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {formData.duration_minutes
                    ? `${formData.duration_minutes * 7} minutos total`
                    : ""}
                </p>
              </div>

              <div>
                <label
                  htmlFor="color-select"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Cor *
                </label>
                <select
                  id="color-select"
                  value={formData.color}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, color: e.target.value }))
                  }
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors.color ? "border-red-500" : "border-gray-300"
                  }`}
                  disabled={isLoading}
                >
                  <option value="">Selecione a cor</option>
                  {LIGHT_BATH_COLORS.map((color) => (
                    <option key={color} value={color}>
                      {color.charAt(0).toUpperCase() + color.slice(1)}
                    </option>
                  ))}
                </select>
                {errors.color && (
                  <p className="mt-1 text-sm text-red-600">{errors.color}</p>
                )}
              </div>
            </div>
          )}

          {/* End Date (Auto-calculated) */}
          <div>
            <label
              htmlFor="end-date-input"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Data de Término Prevista
            </label>
            <input
              id="end-date-input"
              type="date"
              value={formData.end_date}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, end_date: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-gray-50"
              disabled={isLoading}
            />
            <p className="mt-1 text-xs text-gray-500">
              Calculada automaticamente baseada em sessões semanais
            </p>
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="notes-textarea"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Observações
            </label>
            <textarea
              id="notes-textarea"
              value={formData.notes}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notes: e.target.value }))
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Observações sobre o tratamento..."
              disabled={isLoading}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <span className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Criando...
                </span>
              ) : (
                "Criar Sessão"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

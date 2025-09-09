import React, { useCallback, useMemo, useState, useEffect } from "react";
import { useFormHandler } from "@/hooks/useFormHandler";
import { getPatientById } from "@/api/patients";
import ErrorDisplay from "@/components/common/ErrorDisplay";
import LoadingButton from "@/components/common/LoadingButton";
import TreatmentRecommendationsSection from "./TreatmentRecommendationsSection";
import type { TreatmentRecommendation } from "./types";
import type { PatientResponseDto } from "@/api/types";

// Treatment status options as per requirements
export type TreatmentStatus = "N" | "T" | "A" | "F";

export interface SpiritualTreatmentData {
  // Main form fields from requirements
  mainComplaint: string;
  treatmentStatus: TreatmentStatus;
  attendanceDate: Date;
  startDate: Date;
  returnWeeks: number;

  // Recommendations section (reusing existing structure)
  food: string;
  water: string;
  ointments: string;
  recommendations: TreatmentRecommendation;
  notes: string;
}
interface SpiritualTreatmentFormProps {
  attendanceId: number;
  patientId: number;
  patientName: string;
  currentTreatmentStatus: TreatmentStatus;
  onSubmit: (data: SpiritualTreatmentData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<SpiritualTreatmentData>;
}

const SpiritualTreatmentForm: React.FC<SpiritualTreatmentFormProps> = ({
  attendanceId,
  patientId,
  patientName,
  currentTreatmentStatus,
  onSubmit,
  onCancel,
  isLoading: externalLoading = false,
  initialData,
}) => {
  // State for patient data fetching
  const [patientData, setPatientData] = useState<PatientResponseDto | null>(
    null
  );
  const [fetchingPatient, setFetchingPatient] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // Get current date for default values (memoized to prevent dependency changes)
  const today = useMemo(() => new Date(), []);

  // Fetch patient data when component mounts
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setFetchingPatient(true);
        setFetchError(null);

        const response = await getPatientById(patientId.toString());
        if (response.success && response.value) {
          setPatientData(response.value);
        } else {
          setFetchError(response.error || "Erro ao carregar dados do paciente");
        }
      } catch (error) {
        setFetchError("Erro ao carregar dados do paciente");
        console.error("Error fetching patient data:", error);
      } finally {
        setFetchingPatient(false);
      }
    };

    fetchPatientData();
  }, [patientId]);

  // Validation for spiritual treatment form
  const validateTreatment = useCallback(
    (data: SpiritualTreatmentData): string | null => {
      // Main complaint is required
      if (!data.mainComplaint.trim()) {
        return "Principal queixa é obrigatória";
      }

      // Return weeks validation
      if (data.returnWeeks < 1 || data.returnWeeks > 52) {
        return "Semanas para retorno deve estar entre 1 e 52";
      }

      // Start date validation
      if (data.startDate > today) {
        return "Data de início não pode ser futura";
      }

      // Attendance date validation
      if (data.attendanceDate > today) {
        return "Data da consulta não pode ser futura";
      }

      // If light bath is recommended, validate required fields
      if (data.recommendations.lightBath) {
        const { treatments } = data.recommendations.lightBath;
        if (treatments.length === 0) {
          return "Selecione pelo menos um local para o banho de luz";
        }

        // Validate each treatment
        for (const treatment of treatments) {
          if (!treatment.location) {
            return "Todos os locais do banho de luz devem ser especificados";
          }
          if (!treatment.color) {
            return "Cor do banho de luz é obrigatória para todos os locais";
          }
          if (treatment.duration < 1 || treatment.duration > 5) {
            return "Duração do banho deve estar entre 1 e 5 unidades (7-35 minutos)";
          }
          if (treatment.quantity < 1 || treatment.quantity > 20) {
            return "Quantidade de banho de luz deve estar entre 1 e 20";
          }
        }
      }

      // If rod is recommended, validate required fields
      if (data.recommendations.rod) {
        const { treatments } = data.recommendations.rod;
        if (treatments.length === 0) {
          return "Selecione pelo menos um local para o tratamento com bastão";
        }

        // Validate each treatment
        for (const treatment of treatments) {
          if (!treatment.location) {
            return "Todos os locais do tratamento com bastão devem ser especificados";
          }
          if (treatment.quantity < 1 || treatment.quantity > 20) {
            return "Quantidade de tratamentos com bastão deve estar entre 1 e 20";
          }
        }
      }

      return null;
    },
    [today]
  );

  const {
    formData,
    setFormData,
    handleChange,
    handleSubmit,
    isLoading: formLoading,
    error,
    clearError,
  } = useFormHandler<SpiritualTreatmentData>({
    initialState: {
      mainComplaint: initialData?.mainComplaint || "",
      treatmentStatus: initialData?.treatmentStatus || "T", // Default to "T - Em tratamento"
      attendanceDate: initialData?.attendanceDate || today,
      startDate: initialData?.startDate || today,
      returnWeeks: initialData?.returnWeeks || 1, // Default to 1 week
      food: initialData?.food || "",
      water: initialData?.water || "",
      ointments: initialData?.ointments || "",
      recommendations: {
        returnWeeks: initialData?.recommendations?.returnWeeks || 1,
        spiritualMedicalDischarge:
          initialData?.recommendations?.spiritualMedicalDischarge || false,
        ...initialData?.recommendations,
      },
      notes: initialData?.notes || "",
    },
    onSubmit,
    validate: validateTreatment,
    formatters: {
      returnWeeks: (value: unknown) =>
        Math.max(1, Math.min(52, parseInt(String(value)) || 1)),
    },
  });

  const isLoading = externalLoading || formLoading || fetchingPatient;

  // Update form data when patient data is loaded
  useEffect(() => {
    if (patientData && !fetchingPatient) {
      setFormData((prev) => ({
        ...prev,
        // 1. Queixa Principal - recovery notes from the attendance (using patient's main_complaint for now)
        mainComplaint: patientData.main_complaint || prev.mainComplaint,
        // 4. Data de Início - if patient is new, set for current date, otherwise set for patient start date and disable
        startDate: patientData.start_date
          ? new Date(patientData.start_date)
          : currentTreatmentStatus === "N"
          ? today
          : prev.startDate,
      }));
    }
  }, [
    patientData,
    fetchingPatient,
    setFormData,
    currentTreatmentStatus,
    today,
  ]);

  const handleRecommendationsChange = useCallback(
    (recommendations: TreatmentRecommendation) => {
      setFormData((prev) => ({
        ...prev,
        recommendations,
        returnWeeks: recommendations.returnWeeks, // Sync return weeks
      }));
      if (error) clearError();
    },
    [setFormData, error, clearError]
  );

  const handleDateChange = useCallback(
    (field: "attendanceDate" | "startDate") =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value ? new Date(e.target.value) : new Date();
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (error) clearError();
      },
    [setFormData, error, clearError]
  );

  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split("T")[0];
  };

  // Get treatment status label
  const getTreatmentStatusLabel = (status: TreatmentStatus) => {
    const labels: Record<TreatmentStatus, string> = {
      N: "Novo paciente",
      T: "Em tratamento",
      A: "Alta médica espiritual",
      F: "Faltas consecutivas",
    };
    return labels[status];
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">
          Formulário de Tratamento Espiritual - {patientName}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Atendimento #{attendanceId} • Paciente #{patientId}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {error && (
          <ErrorDisplay
            error={error}
            dismissible={true}
            onDismiss={clearError}
          />
        )}

        {fetchError && (
          <ErrorDisplay
            error={fetchError}
            dismissible={true}
            onDismiss={() => setFetchError(null)}
          />
        )}

        {/* Main Complaint */}
        <div>
          <label
            htmlFor="mainComplaint"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Principal Queixa *
          </label>
          <textarea
            id="mainComplaint"
            name="mainComplaint"
            value={formData.mainComplaint}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="Descreva a principal queixa do paciente..."
            required
          />
        </div>

        {/* Treatment Status */}
        <div>
          <label
            htmlFor="treatmentStatus"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Status do Tratamento
          </label>
          <select
            id="treatmentStatus"
            name="treatmentStatus"
            value={formData.treatmentStatus}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="N">N - Novo paciente</option>
            <option value="T">T - Em tratamento</option>
            <option value="A">A - Alta médica espiritual</option>
            <option value="F">F - Faltas consecutivas</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Status atual: {getTreatmentStatusLabel(currentTreatmentStatus)}
          </p>
        </div>

        {/* Date Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Attendance Date */}
          <div>
            <label
              htmlFor="attendanceDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Data da Consulta
            </label>
            <input
              type="date"
              id="attendanceDate"
              value={formatDateForInput(formData.attendanceDate)}
              onChange={handleDateChange("attendanceDate")}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Start Date */}
          <div>
            <label
              htmlFor="startDate"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Data de Início
            </label>
            <input
              type="date"
              id="startDate"
              value={formatDateForInput(formData.startDate)}
              onChange={handleDateChange("startDate")}
              disabled={patientData?.start_date ? true : false}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            {patientData?.start_date && (
              <p className="text-xs text-gray-500 mt-1">
                Data de início já estabelecida (somente leitura)
              </p>
            )}
            {!patientData?.start_date && currentTreatmentStatus === "N" && (
              <p className="text-xs text-gray-500 mt-1">
                Data de início será definida nesta consulta
              </p>
            )}
          </div>
        </div>

        {/* Return Weeks */}
        <div>
          <label
            htmlFor="returnWeeks"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Semanas para Retorno
          </label>
          <input
            type="number"
            id="returnWeeks"
            name="returnWeeks"
            value={formData.returnWeeks}
            onChange={handleChange}
            min="1"
            max="52"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="text-xs text-gray-500 mt-1">
            Uma nova consulta espiritual será agendada automaticamente para{" "}
            {formData.returnWeeks} semana(s) a partir de hoje
          </p>
        </div>

        {/* General Recommendations */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium text-gray-800 border-b pb-2">
            Recomendações Gerais
          </h3>

          <div>
            <label
              htmlFor="food"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Alimentação
            </label>
            <textarea
              id="food"
              name="food"
              value={formData.food}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={2}
              placeholder="Recomendações alimentares..."
            />
          </div>

          <div>
            <label
              htmlFor="water"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Água
            </label>
            <input
              type="text"
              id="water"
              name="water"
              value={formData.water}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ex: 2L de água fluidificada por dia"
            />
          </div>

          <div>
            <label
              htmlFor="ointments"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Pomadas
            </label>
            <input
              type="text"
              id="ointments"
              name="ointments"
              value={formData.ointments}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Pomadas recomendadas..."
            />
          </div>
        </div>

        {/* Treatment Recommendations (Lightbath and Rod) */}
        <TreatmentRecommendationsSection
          recommendations={formData.recommendations}
          onChange={handleRecommendationsChange}
        />

        {/* Additional Notes */}
        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Observações Adicionais
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="Observações sobre o atendimento..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 transition-colors"
          >
            Cancelar
          </button>
          <LoadingButton
            type="submit"
            isLoading={isLoading}
            loadingText="Salvando..."
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
          >
            Finalizar Tratamento
          </LoadingButton>
        </div>
      </form>
    </div>
  );
};

export default SpiritualTreatmentForm;

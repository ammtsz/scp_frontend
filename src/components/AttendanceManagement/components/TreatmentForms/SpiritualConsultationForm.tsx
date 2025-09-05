import React, { useCallback } from "react";
import { useFormHandler } from "@/hooks/useFormHandler";
import ErrorDisplay from "@/components/common/ErrorDisplay";
import LoadingButton from "@/components/common/LoadingButton";
import TreatmentRecommendationsSection from "./TreatmentRecommendationsSection";

export interface TreatmentRecommendation {
  lightBath?: {
    startDate: Date;
    bodyLocation: string[];
    color: string;
    duration: number; // in 7-minute units (1 = 7min, 2 = 14min, etc.)
    quantity: number;
  };
  rod?: {
    startDate: Date;
    bodyLocation: string[];
    quantity: number;
  };
  returnWeeks: number; // 1-52 weeks for next spiritual consultation
  spiritualMedicalDischarge: boolean;
}

export interface SpiritualConsultationData {
  food: string;
  water: string;
  ointments: string;
  spiritualTreatment: boolean;
  recommendations: TreatmentRecommendation;
  notes: string;
}

interface SpiritualConsultationFormProps {
  attendanceId: number;
  patientName: string;
  onSubmit: (data: SpiritualConsultationData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<SpiritualConsultationData>;
}

const SpiritualConsultationForm: React.FC<SpiritualConsultationFormProps> = ({
  attendanceId,
  patientName,
  onSubmit,
  onCancel,
  isLoading: externalLoading = false,
  initialData,
}) => {
  // Validation for spiritual consultation form
  const validateConsultation = useCallback(
    (data: SpiritualConsultationData): string | null => {
      // Basic return weeks validation
      if (
        data.recommendations.returnWeeks < 1 ||
        data.recommendations.returnWeeks > 52
      ) {
        return "Data de retorno deve estar entre 1 e 52 semanas";
      }

      // If light bath is recommended, validate required fields
      if (data.recommendations.lightBath) {
        const { bodyLocation, duration, quantity } =
          data.recommendations.lightBath;
        if (bodyLocation.length === 0) {
          return "Selecione pelo menos um local para o banho de luz";
        }
        if (duration < 1 || duration > 5) {
          return "Duração do banho deve estar entre 1 e 5 unidades (7-35 minutos)";
        }
        if (quantity < 1 || quantity > 20) {
          return "Quantidade de banho de luz deve estar entre 1 e 20";
        }
      }

      // If rod is recommended, validate required fields
      if (data.recommendations.rod) {
        const { bodyLocation, quantity } = data.recommendations.rod;
        if (bodyLocation.length === 0) {
          return "Selecione pelo menos um local para o tratamento com bastão";
        }
        if (quantity < 1 || quantity > 20) {
          return "Quantidade de tratamentos com bastão deve estar entre 1 e 20";
        }
      }

      return null;
    },
    []
  );

  const {
    formData,
    setFormData,
    handleChange,
    handleSubmit,
    isLoading: formLoading,
    error,
    clearError,
  } = useFormHandler<SpiritualConsultationData>({
    initialState: {
      food: initialData?.food || "",
      water: initialData?.water || "",
      ointments: initialData?.ointments || "",
      spiritualTreatment: initialData?.spiritualTreatment || true,
      recommendations: {
        returnWeeks: initialData?.recommendations?.returnWeeks || 2,
        spiritualMedicalDischarge:
          initialData?.recommendations?.spiritualMedicalDischarge || false,
        ...initialData?.recommendations,
      },
      notes: initialData?.notes || "",
    },
    onSubmit,
    validate: validateConsultation,
    formatters: {
      // No formatters needed for this complex form
    },
  });

  const isLoading = externalLoading || formLoading;

  const handleRecommendationsChange = useCallback(
    (recommendations: TreatmentRecommendation) => {
      setFormData((prev) => ({ ...prev, recommendations }));
      if (error) clearError();
    },
    [setFormData, error, clearError]
  );

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800">
          Consulta Espiritual - {patientName}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Atendimento #{attendanceId}
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

        {/* Treatment Recommendations */}
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
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
          >
            Cancelar
          </button>
          <LoadingButton
            type="submit"
            isLoading={isLoading}
            loadingText="Salvando..."
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          >
            Salvar Consulta
          </LoadingButton>
        </div>
      </form>
    </div>
  );
};

export default SpiritualConsultationForm;

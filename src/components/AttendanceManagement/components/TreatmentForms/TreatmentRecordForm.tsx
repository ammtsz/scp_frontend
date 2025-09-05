import React, { useCallback } from "react";
import { useFormHandler } from "@/hooks/useFormHandler";
import LocationSelector from "./LocationSelector";
import ErrorDisplay from "@/components/common/ErrorDisplay";
import LoadingButton from "@/components/common/LoadingButton";

interface TreatmentRecordData {
  treatmentType: "spiritual" | "light_bath" | "rod";
  locations: string[];
  customLocation: string;
  quantity: number;
  notes: string;
  startTime?: Date;
  endTime?: Date;
}

interface TreatmentRecordFormProps {
  attendanceId: number;
  treatmentType: "spiritual" | "light_bath" | "rod";
  onSubmit: (data: TreatmentRecordData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<TreatmentRecordData>;
}

const TreatmentRecordForm: React.FC<TreatmentRecordFormProps> = ({
  treatmentType,
  onSubmit,
  onCancel,
  isLoading: externalLoading = false,
  initialData,
}) => {
  // Custom validation function for treatment records
  const validateTreatmentRecord = useCallback(
    (data: TreatmentRecordData): string | null => {
      if (data.locations.length === 0) {
        return "Selecione pelo menos um local de tratamento";
      }

      if (data.quantity < 1 || data.quantity > 10) {
        return "Quantidade deve estar entre 1 e 10";
      }

      if (data.startTime && data.endTime && data.startTime >= data.endTime) {
        return "Horário de término deve ser posterior ao início";
      }

      return null;
    },
    []
  );

  // Custom formatter for time fields
  const timeFormatter = useCallback((value: unknown): Date | undefined => {
    if (typeof value === "string" && value) {
      return new Date(`1970-01-01T${value}:00`);
    }
    return undefined;
  }, []);

  const {
    formData,
    setFormData,
    handleChange,
    handleSubmit,
    isLoading: formLoading,
    error,
    clearError,
  } = useFormHandler<TreatmentRecordData>({
    initialState: {
      treatmentType,
      locations: initialData?.locations || [],
      customLocation: initialData?.customLocation || "",
      quantity: initialData?.quantity || 1,
      notes: initialData?.notes || "",
      startTime: initialData?.startTime,
      endTime: initialData?.endTime,
    },
    onSubmit,
    validate: validateTreatmentRecord,
    formatters: {
      quantity: (value: unknown) => {
        const numValue =
          typeof value === "string" ? parseInt(value) || 1 : value;
        return Math.max(1, Math.min(10, numValue as number));
      },
    },
  });

  const isLoading = externalLoading || formLoading;

  const handleLocationChange = useCallback(
    (locations: string[]) => {
      setFormData((prev) => ({ ...prev, locations }));
      if (error) clearError();
    },
    [setFormData, error, clearError]
  );

  const handleCustomLocationChange = useCallback(
    (customLocation: string) => {
      setFormData((prev) => ({ ...prev, customLocation }));
    },
    [setFormData]
  );

  const handleTimeChange = useCallback(
    (field: "startTime" | "endTime", value: string) => {
      const time = timeFormatter(value);
      setFormData((prev) => ({ ...prev, [field]: time }));
      if (error) clearError();
    },
    [setFormData, timeFormatter, error, clearError]
  );

  const formatTimeForInput = (date?: Date): string => {
    if (!date) return "";
    return date.toISOString().substring(11, 16); // HH:MM format
  };

  const getTreatmentTypeLabel = (type: string): string => {
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
  };

  return (
    <div className="bg-white rounded-lg shadow-lg max-w-2xl mx-auto">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800">
          Registro de Tratamento - {getTreatmentTypeLabel(treatmentType)}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Registre os detalhes do tratamento realizado
        </p>
      </div>

      <ErrorDisplay error={error} className="mx-6 mt-4" />

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Location Selection */}
        <div>
          <LocationSelector
            selectedLocations={formData.locations}
            customLocation={formData.customLocation}
            onLocationChange={handleLocationChange}
            onCustomLocationChange={handleCustomLocationChange}
            disabled={isLoading}
          />
        </div>

        {/* Quantity and Time */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label
              htmlFor="quantity"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Quantidade
            </label>
            <input
              id="quantity"
              name="quantity"
              type="number"
              min="1"
              max="10"
              value={formData.quantity}
              onChange={handleChange}
              disabled={isLoading}
              className="input w-full"
            />
          </div>

          <div>
            <label
              htmlFor="startTime"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Horário de Início
            </label>
            <input
              id="startTime"
              type="time"
              value={formatTimeForInput(formData.startTime)}
              onChange={(e) => handleTimeChange("startTime", e.target.value)}
              disabled={isLoading}
              className="input w-full"
            />
          </div>

          <div>
            <label
              htmlFor="endTime"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Horário de Término
            </label>
            <input
              id="endTime"
              type="time"
              value={formatTimeForInput(formData.endTime)}
              onChange={(e) => handleTimeChange("endTime", e.target.value)}
              disabled={isLoading}
              className="input w-full"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Observações
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            disabled={isLoading}
            rows={3}
            placeholder="Observações sobre o tratamento (opcional)..."
            className="input w-full resize-y"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <LoadingButton
            type="submit"
            variant="primary"
            isLoading={isLoading}
            loadingText="Salvando..."
          >
            Salvar Registro
          </LoadingButton>
        </div>
      </form>
    </div>
  );
};

export default TreatmentRecordForm;

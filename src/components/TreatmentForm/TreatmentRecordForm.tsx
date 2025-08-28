import React, { useState, useCallback } from "react";
import LocationSelector from "./LocationSelector";

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
  isLoading = false,
  initialData,
}) => {
  const [formData, setFormData] = useState<TreatmentRecordData>({
    treatmentType,
    locations: initialData?.locations || [],
    customLocation: initialData?.customLocation || "",
    quantity: initialData?.quantity || 1,
    notes: initialData?.notes || "",
    startTime: initialData?.startTime,
    endTime: initialData?.endTime,
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof TreatmentRecordData, string>>
  >({});

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof TreatmentRecordData, string>> = {};

    if (formData.locations.length === 0) {
      newErrors.locations = "Selecione pelo menos um local de tratamento";
    }

    if (formData.quantity < 1 || formData.quantity > 10) {
      newErrors.quantity = "Quantidade deve estar entre 1 e 10";
    }

    if (
      formData.startTime &&
      formData.endTime &&
      formData.startTime >= formData.endTime
    ) {
      newErrors.endTime = "Horário de término deve ser posterior ao início";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleLocationChange = useCallback(
    (locations: string[]) => {
      setFormData((prev) => ({ ...prev, locations }));
      if (errors.locations) {
        setErrors((prev) => ({ ...prev, locations: undefined }));
      }
    },
    [errors.locations]
  );

  const handleCustomLocationChange = useCallback((customLocation: string) => {
    setFormData((prev) => ({ ...prev, customLocation }));
  }, []);

  const handleQuantityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const quantity = parseInt(e.target.value) || 1;
      setFormData((prev) => ({ ...prev, quantity }));
      if (errors.quantity) {
        setErrors((prev) => ({ ...prev, quantity: undefined }));
      }
    },
    [errors.quantity]
  );

  const handleNotesChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, notes: e.target.value }));
    },
    []
  );

  const handleTimeChange = useCallback(
    (field: "startTime" | "endTime", value: string) => {
      const time = value ? new Date(`1970-01-01T${value}:00`) : undefined;
      setFormData((prev) => ({ ...prev, [field]: time }));
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) return;

      try {
        await onSubmit(formData);
      } catch (error) {
        console.error("Error submitting treatment record:", error);
      }
    },
    [formData, validateForm, onSubmit]
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
          {errors.locations && (
            <p className="mt-1 text-sm text-red-600">{errors.locations}</p>
          )}
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
              type="number"
              min="1"
              max="10"
              value={formData.quantity}
              onChange={handleQuantityChange}
              disabled={isLoading}
              className="input w-full"
            />
            {errors.quantity && (
              <p className="mt-1 text-sm text-red-600">{errors.quantity}</p>
            )}
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
            {errors.endTime && (
              <p className="mt-1 text-sm text-red-600">{errors.endTime}</p>
            )}
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
            value={formData.notes}
            onChange={handleNotesChange}
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
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? "Salvando..." : "Salvar Registro"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default TreatmentRecordForm;

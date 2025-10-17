import React from "react";
import { LIGHT_BATH_COLORS } from "@/utils/treatmentColors";
import type {
  LightBathLocationTreatment,
  RodLocationTreatment,
} from "../../types";

interface BodyLocationTreatmentCardProps {
  locations: string[];
  treatmentType: "lightBath" | "rod";
  treatment: LightBathLocationTreatment | RodLocationTreatment;
  onChange: (
    treatment: LightBathLocationTreatment | RodLocationTreatment
  ) => void;
  onRemove: () => void;
  disabled?: boolean;
}

const BodyLocationTreatmentCard: React.FC<BodyLocationTreatmentCardProps> = ({
  locations,
  treatmentType,
  treatment,
  onChange,
  onRemove,
  disabled = false,
}) => {
  const handleChange = (field: string, value: string | number) => {
    onChange({
      ...treatment,
      [field]: value,
    });
  };

  const handleDateChange = (dateString: string) => {
    handleChange("startDate", dateString);
  };

  const formatDateForInput = (date: string): string => {
    return date; // Already in YYYY-MM-DD format
  };

  const isLightBath = treatmentType === "lightBath";
  const lightBathTreatment = treatment as LightBathLocationTreatment;

  return (
    <div className="p-4 border border-gray-200 rounded-md bg-white">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h5 className="text-sm font-medium text-gray-800 mb-1">
            {locations.length === 1 ? "Local:" : "Locais:"}
          </h5>
          <div className="flex flex-wrap gap-1">
            {locations.map((location, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full capitalize"
              >
                {location}
              </span>
            ))}
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
        >
          Remover
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Data de Início *
          </label>
          <input
            type="date"
            value={formatDateForInput(treatment.startDate)}
            onChange={(e) => handleDateChange(e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            required
          />
        </div>

        {/* Color Selection (only for light bath) */}
        {isLightBath && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Cor *
            </label>
            <select
              value={lightBathTreatment.color || ""}
              onChange={(e) => handleChange("color", e.target.value)}
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              required
            >
              <option value="">Selecione uma cor...</option>
              {LIGHT_BATH_COLORS.map((color) => (
                <option key={color} value={color}>
                  {color}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Duration (only for light bath) */}
        {isLightBath && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Duração *
            </label>
            <select
              value={lightBathTreatment.duration || 1}
              onChange={(e) =>
                handleChange("duration", parseInt(e.target.value))
              }
              disabled={disabled}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
              required
            >
              <option value={1}>1 unidade (7 min)</option>
              <option value={2}>2 unidades (14 min)</option>
              <option value={3}>3 unidades (21 min)</option>
              <option value={4}>4 unidades (28 min)</option>
              <option value={5}>5 unidades (35 min)</option>
              <option value={6}>6 unidades (42 min)</option>
              <option value={7}>7 unidades (49 min)</option>
              <option value={8}>8 unidades (56 min)</option>
              <option value={9}>9 unidades (63 min)</option>
              <option value={10}>10 unidades (70 min)</option>
            </select>
          </div>
        )}

        {/* Quantity */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Quantidade *
          </label>
          <input
            type="number"
            value={treatment.quantity || 1}
            onChange={(e) =>
              handleChange("quantity", parseInt(e.target.value) || 1)
            }
            disabled={disabled}
            min="1"
            max="20"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
            required
          />
        </div>
      </div>
    </div>
  );
};

export default BodyLocationTreatmentCard;

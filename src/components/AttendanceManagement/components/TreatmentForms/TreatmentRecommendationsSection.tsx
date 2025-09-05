import React, { useCallback } from "react";
import LocationSelector from "./LocationSelector";
import type { TreatmentRecommendation } from "./SpiritualConsultationForm";

// Light bath colors available for treatment
const LIGHT_BATH_COLORS = [
  "azul",
  "verde",
  "amarelo",
  "vermelho",
  "violeta",
  "branco",
  "laranja",
] as const;

interface TreatmentRecommendationsSectionProps {
  recommendations: TreatmentRecommendation;
  onChange: (recommendations: TreatmentRecommendation) => void;
}

const TreatmentRecommendationsSection: React.FC<
  TreatmentRecommendationsSectionProps
> = ({ recommendations, onChange }) => {
  const handleReturnWeeksChange = useCallback(
    (weeks: number) => {
      onChange({
        ...recommendations,
        returnWeeks: Math.max(1, Math.min(52, weeks)),
      });
    },
    [recommendations, onChange]
  );

  const handleDischargeChange = useCallback(
    (discharged: boolean) => {
      onChange({
        ...recommendations,
        spiritualMedicalDischarge: discharged,
      });
    },
    [recommendations, onChange]
  );

  const handleLightBathToggle = useCallback(
    (enabled: boolean) => {
      if (enabled) {
        onChange({
          ...recommendations,
          lightBath: {
            startDate: new Date(),
            bodyLocation: [],
            color: "azul",
            duration: 1,
            quantity: 1,
          },
        });
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { lightBath, ...rest } = recommendations;
        onChange(rest);
      }
    },
    [recommendations, onChange]
  );

  const handleRodToggle = useCallback(
    (enabled: boolean) => {
      if (enabled) {
        onChange({
          ...recommendations,
          rod: {
            startDate: new Date(),
            bodyLocation: [],
            quantity: 1,
          },
        });
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { rod, ...rest } = recommendations;
        onChange(rest);
      }
    },
    [recommendations, onChange]
  );

  const handleLightBathChange = useCallback(
    (
      field: keyof NonNullable<TreatmentRecommendation["lightBath"]>,
      value: unknown
    ) => {
      if (!recommendations.lightBath) return;

      onChange({
        ...recommendations,
        lightBath: {
          ...recommendations.lightBath,
          [field]: value,
        },
      });
    },
    [recommendations, onChange]
  );

  const handleRodChange = useCallback(
    (
      field: keyof NonNullable<TreatmentRecommendation["rod"]>,
      value: unknown
    ) => {
      if (!recommendations.rod) return;

      onChange({
        ...recommendations,
        rod: {
          ...recommendations.rod,
          [field]: value,
        },
      });
    },
    [recommendations, onChange]
  );

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-800 border-b pb-2">
        Recomendações de Tratamento
      </h3>

      {/* Return Schedule */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="returnWeeks"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Retorno em (semanas)
          </label>
          <input
            type="number"
            id="returnWeeks"
            min="1"
            max="52"
            value={recommendations.returnWeeks}
            onChange={(e) =>
              handleReturnWeeksChange(parseInt(e.target.value) || 2)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            id="spiritualDischarge"
            checked={recommendations.spiritualMedicalDischarge}
            onChange={(e) => handleDischargeChange(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="spiritualDischarge"
            className="ml-2 text-sm text-gray-700"
          >
            Alta espiritual/médica
          </label>
        </div>
      </div>

      {/* Light Bath Treatment */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="lightBathEnabled"
            checked={!!recommendations.lightBath}
            onChange={(e) => handleLightBathToggle(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="lightBathEnabled"
            className="ml-2 text-sm font-medium text-gray-700"
          >
            Banho de Luz
          </label>
        </div>

        {recommendations.lightBath && (
          <div className="space-y-4 ml-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="lightBathStartDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Data de Início
                </label>
                <input
                  type="date"
                  id="lightBathStartDate"
                  value={
                    recommendations.lightBath.startDate
                      .toISOString()
                      .split("T")[0]
                  }
                  onChange={(e) =>
                    handleLightBathChange("startDate", new Date(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cor
                </label>
                <select
                  value={recommendations.lightBath.color}
                  onChange={(e) =>
                    handleLightBathChange("color", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {LIGHT_BATH_COLORS.map((color) => (
                    <option key={color} value={color}>
                      {color.charAt(0).toUpperCase() + color.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Duração (7min = 1)
                </label>
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={recommendations.lightBath.duration}
                  onChange={(e) =>
                    handleLightBathChange(
                      "duration",
                      parseInt(e.target.value) || 1
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Quantidade de Sessões
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={recommendations.lightBath.quantity}
                onChange={(e) =>
                  handleLightBathChange(
                    "quantity",
                    parseInt(e.target.value) || 1
                  )
                }
                className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Locais do Corpo
              </label>
              <LocationSelector
                selectedLocations={recommendations.lightBath.bodyLocation}
                customLocation=""
                onLocationChange={(locations) =>
                  handleLightBathChange("bodyLocation", locations)
                }
                onCustomLocationChange={() => {}} // Not used in this context
              />
            </div>
          </div>
        )}
      </div>

      {/* Rod Treatment */}
      <div className="border border-gray-200 rounded-lg p-4">
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="rodEnabled"
            checked={!!recommendations.rod}
            onChange={(e) => handleRodToggle(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="rodEnabled"
            className="ml-2 text-sm font-medium text-gray-700"
          >
            Tratamento com Bastão
          </label>
        </div>

        {recommendations.rod && (
          <div className="space-y-4 ml-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="rodStartDate"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Data de Início
                </label>
                <input
                  type="date"
                  id="rodStartDate"
                  value={
                    recommendations.rod.startDate.toISOString().split("T")[0]
                  }
                  onChange={(e) =>
                    handleRodChange("startDate", new Date(e.target.value))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantidade de Sessões
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={recommendations.rod.quantity}
                  onChange={(e) =>
                    handleRodChange("quantity", parseInt(e.target.value) || 1)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Locais do Corpo
              </label>
              <LocationSelector
                selectedLocations={recommendations.rod.bodyLocation}
                customLocation=""
                onLocationChange={(locations) =>
                  handleRodChange("bodyLocation", locations)
                }
                onCustomLocationChange={() => {}} // Not used in this context
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TreatmentRecommendationsSection;

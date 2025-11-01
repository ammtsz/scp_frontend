import React from "react";
import type { SpiritualTreatmentData } from "../hooks/usePostAttendanceForm";

interface GeneralRecommendationsTabProps {
  formData: SpiritualTreatmentData;
  onFormDataChange: (
    field: keyof SpiritualTreatmentData,
    value: string
  ) => void;
}

const GeneralRecommendationsTab: React.FC<GeneralRecommendationsTabProps> = ({
  formData,
  onFormDataChange,
}) => {
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    onFormDataChange(name as keyof SpiritualTreatmentData, value);
  };

  return (
    <div className="space-y-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Recomendações Gerais
        </h3>
        <p className="text-sm text-gray-600">
          Forneça orientações gerais sobre alimentação, hidratação e cuidados
          complementares.
        </p>
      </div>

      {/* Food Recommendations */}
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
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          placeholder="Recomendações alimentares (ex: evitar carnes vermelhas, priorizar vegetais, etc.)"
        />
        <p className="text-xs text-gray-500 mt-1">
          Orientações específicas sobre dieta e alimentação durante o tratamento
        </p>
      </div>

      {/* Water Recommendations */}
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
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Ex: 2L de água fluidificada por dia"
        />
        <p className="text-xs text-gray-500 mt-1">
          Quantidade e tipo de água recomendada
        </p>
      </div>

      {/* Ointments Recommendations */}
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
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder="Pomadas ou unguentos recomendados..."
        />
        <p className="text-xs text-gray-500 mt-1">
          Produtos tópicos para aplicação externa
        </p>
      </div>

      {/* Helper Text */}
      {/* <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          ✨ Dicas para Recomendações Gerais
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            • Seja específico nas quantidades (ex: &quot;2L por dia&quot;,
            &quot;3 vezes ao dia&quot;)
          </li>
          <li>• Inclua orientações sobre horários quando relevante</li>
          <li>• Considere alergias ou restrições alimentares do paciente</li>
          <li>• Estas recomendações complementam o tratamento espiritual</li>
        </ul>
      </div> */}
    </div>
  );
};

export default GeneralRecommendationsTab;

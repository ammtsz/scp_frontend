import React from "react";
import TreatmentRecommendationsSection from "./TreatmentRecommendationsSection";
import type { SpiritualTreatmentData } from "../../hooks/usePostAttendanceForm";
import type { TreatmentRecommendation } from "../../types";

interface TreatmentRecommendationsTabProps {
  formData: SpiritualTreatmentData;
  onRecommendationsChange: (recommendations: TreatmentRecommendation) => void;
}

const TreatmentRecommendationsTab: React.FC<
  TreatmentRecommendationsTabProps
> = ({ formData, onRecommendationsChange }) => {
  return (
    <div className="space-y-6">
      {/* Information Card */}
      <div className="bg-green-50 border border-green-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-green-900 mb-2">
          🔄 Agendamento Automático
        </h4>
        <ul className="text-sm text-green-800 space-y-1">
          <li>
            • Os tratamentos configurados aqui serão automaticamente agendados
          </li>
          <li>• Cada sessão será criada com intervalos semanais</li>
          {/* <li>• O paciente receberá um cronograma completo dos atendimentos</li> */}
          <li>• É possível ajustar datas individuais após a criação</li>
        </ul>
      </div>

      {/* Treatment Recommendations Component */}
      <TreatmentRecommendationsSection
        recommendations={formData.recommendations}
        onChange={onRecommendationsChange}
      />
    </div>
  );
};

export default TreatmentRecommendationsTab;

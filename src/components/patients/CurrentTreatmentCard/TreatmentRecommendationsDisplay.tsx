import React from "react";

interface Recommendations {
  date?: Date;
  food?: string;
  water?: string;
  ointment?: string;
  lightBath?: boolean;
  rod?: boolean;
  spiritualTreatment?: boolean;
  returnWeeks?: number;
}

interface TreatmentRecommendationsDisplayProps {
  recommendations: Recommendations;
}

export const TreatmentRecommendationsDisplay: React.FC<TreatmentRecommendationsDisplayProps> = ({
  recommendations,
}) => {
  return (
    <>
      <h3 className="font-semibold text-gray-900 mb-3">
        Últimas Recomendações (
        {recommendations.date?.toLocaleDateString?.("pt-BR") ??
          "Data não disponível"}
        )
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-1 gap-4">
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <span className="text-gray-600 text-nowrap mr-4">
              🍎 Alimentação:
            </span>
            <span className="text-gray-600 italic text-sm">
              {recommendations.food || "nenhuma"}
            </span>
          </div>
          <div className="flex items-start justify-between">
            <span className="text-gray-600 text-nowrap mr-4">
              💧 Água:
            </span>
            <span className="text-gray-600 italic text-sm">
              {recommendations.water || "nenhuma"}
            </span>
          </div>
          <div className="flex items-start justify-between">
            <span className="text-gray-600 text-nowrap mr-4">
              🧴 Pomada:
            </span>
            <span className="text-gray-600 italic text-sm">
              {recommendations.ointment || "nenhuma"}
            </span>
          </div>
          <div className="flex items-start justify-between">
            <span className="text-gray-600 text-nowrap mr-4">
              ✨ Banho de luz:
            </span>
            <span className="text-gray-600 italic text-sm">
              {recommendations.lightBath ? "Sim" : "nenhuma"}
            </span>
          </div>
          <div className="flex items-start justify-between">
            <span className="text-gray-600 text-nowrap mr-4">
              🪄 Bastão:
            </span>
            <span className="text-gray-600 italic text-sm">
              {recommendations.rod ? "Sim" : "nenhuma"}
            </span>
          </div>
          <div className="flex items-start justify-between">
            <span className="text-gray-600 text-nowrap mr-4">
              🧬 Trat. Espiritual:
            </span>
            <span className="text-gray-600 italic text-sm">
              {recommendations.spiritualTreatment ? "Sim" : "nenhuma"}
            </span>
          </div>
        </div>
      </div>
      <div className="mt-3 pt-3 border-t">
        <div className="flex items-center justify-between">
          <span className="text-gray-600">📅 Retorno:</span>
          <span className="font-medium">
            {recommendations.returnWeeks
              ? `${recommendations.returnWeeks} semanas`
              : "Não definido"}
          </span>
        </div>
      </div>
    </>
  );
};
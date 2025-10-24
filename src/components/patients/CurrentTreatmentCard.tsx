import React from "react";
import { Patient, AttendanceType } from "@/types/types";
import { formatDateBR } from "@/utils/dateHelpers";
import { TreatmentStatusBadge } from "./TreatmentStatusBadge";

interface CurrentTreatmentCardProps {
  patient: Patient;
}

export const CurrentTreatmentCard: React.FC<CurrentTreatmentCardProps> = ({
  patient,
}) => {
  // Determine the primary treatment type based on patient's attendance history and future appointments
  const getPrimaryTreatmentType = (): AttendanceType => {
    // Check if there are upcoming appointments
    if (patient.nextAttendanceDates.length > 0) {
      return patient.nextAttendanceDates[0].type;
    }

    // Check most recent attendance
    if (patient.previousAttendances.length > 0) {
      // Sort by date descending and get the most recent
      const sortedAttendances = [...patient.previousAttendances].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      return sortedAttendances[0].type;
    }

    // Default to spiritual if no data available
    return "spiritual";
  };

  const getTreatmentTitle = (
    type: AttendanceType
  ): { title: string; icon: string } => {
    const treatmentTitles = {
      spiritual: { title: "Consulta Espiritual", icon: "🔮" },
      lightBath: { title: "Banho de Luz", icon: "💡" },
      rod: { title: "Tratamento com Bastão", icon: "🔮" },
      combined: { title: "Tratamento Combinado", icon: "✨" },
    };

    return treatmentTitles[type] || treatmentTitles.spiritual;
  };

  const primaryTreatmentType = getPrimaryTreatmentType();
  const { title, icon } = getTreatmentTitle(primaryTreatmentType);

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      <div className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          {icon} {title}
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-600 font-medium">
              Início do Tratamento
            </div>
            <div className="text-lg font-semibold text-blue-900">
              {formatDateBR(
                patient.startDate.toISOString?.() ?? String(patient.startDate)
              )}
            </div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="text-sm text-green-600 font-medium">
              Próximo Atendimento
            </div>
            <div className="text-lg font-semibold text-green-900">
              {patient.nextAttendanceDates[0]?.date ? (
                <>
                  <div>
                    {formatDateBR(
                      patient.nextAttendanceDates[0].date.toISOString?.() ??
                        String(patient.nextAttendanceDates[0].date)
                    )}
                  </div>
                  <div className="text-xs text-green-600 font-normal mt-1">
                    {
                      getTreatmentTitle(patient.nextAttendanceDates[0].type)
                        .title
                    }
                  </div>
                </>
              ) : (
                <div className="text-sm text-orange-600 font-normal">
                  Não agendado
                </div>
              )}
            </div>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-sm text-gray-600 font-medium">
              Alta Prevista
            </div>
            <div className="text-lg font-semibold text-gray-900">
              {patient.dischargeDate
                ? formatDateBR(
                    patient.dischargeDate.toISOString?.() ??
                      String(patient.dischargeDate)
                  )
                : "Não definida"}
            </div>
          </div>
        </div>

        {/* Treatment Types Summary */}
        {patient.previousAttendances.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Tipos de Tratamento Realizados
            </h3>
            <div className="flex flex-wrap gap-2">
              {Array.from(
                new Set(patient.previousAttendances.map((att) => att.type))
              ).map((type) => {
                const { title, icon } = getTreatmentTitle(type);
                const count = patient.previousAttendances.filter(
                  (att) => att.type === type
                ).length;
                return (
                  <div
                    key={type}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-xs font-medium border border-blue-200"
                  >
                    <span>{icon}</span>
                    <span>{title}</span>
                    <span className="bg-blue-200 text-blue-900 rounded-full px-1.5 py-0.5 text-xs ml-1">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Current Recommendations */}
        <div className="border-t pt-4">
          {patient.currentRecommendations ? (
            <>
              <h3 className="font-semibold text-gray-900 mb-3">
                Últimas Recomendações (
                {patient.currentRecommendations.date?.toLocaleDateString?.(
                  "pt-BR"
                ) ?? "Data não disponível"}
                )
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">🍎 Alimentação:</span>
                    <span className="font-medium">
                      {patient.currentRecommendations.food ||
                        "Não especificado"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">💧 Água:</span>
                    <span className="font-medium">
                      {patient.currentRecommendations.water ||
                        "Não especificado"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">🧴 Pomada:</span>
                    <span className="font-medium">
                      {patient.currentRecommendations.ointment ||
                        "Não especificado"}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">💡 Banho de luz:</span>
                    <TreatmentStatusBadge
                      isActive={patient.currentRecommendations.lightBath}
                      label={
                        patient.currentRecommendations.lightBath ? "Sim" : "Não"
                      }
                      icon="💡"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">🔮 Bastão:</span>
                    <TreatmentStatusBadge
                      isActive={patient.currentRecommendations.rod}
                      label={patient.currentRecommendations.rod ? "Sim" : "Não"}
                      icon="🔮"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">✨ Trat. Espiritual:</span>
                    <TreatmentStatusBadge
                      isActive={
                        patient.currentRecommendations.spiritualTreatment
                      }
                      label={
                        patient.currentRecommendations.spiritualTreatment
                          ? "Sim"
                          : "Não"
                      }
                      icon="✨"
                    />
                  </div>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">📅 Retorno:</span>
                  <span className="font-medium">
                    {patient.currentRecommendations.returnWeeks
                      ? `${patient.currentRecommendations.returnWeeks} semanas`
                      : "Não definido"}
                  </span>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-6">
              <div className="bg-yellow-50 rounded-full w-12 h-12 flex items-center justify-center mx-auto mb-3">
                <div className="text-lg">⚠️</div>
              </div>
              <div className="font-medium text-gray-900 mb-2">
                Recomendações não disponíveis
              </div>
              <div className="text-sm text-gray-600 mb-4">
                Este paciente ainda não possui recomendações de tratamento
                registradas.
              </div>
              <button
                className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors"
                onClick={() => {
                  // TODO: Navigate to create recommendations
                  console.log(
                    "Create recommendations for patient:",
                    patient.id
                  );
                }}
              >
                ✨ Criar Recomendações
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

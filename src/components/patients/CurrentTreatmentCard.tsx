import React from "react";
import { Patient, AttendanceType } from "@/types/types";
import { formatDateBR } from "@/utils/dateHelpers";
import { TreatmentStatusBadge } from "./TreatmentStatusBadge";
import { TreatmentProgressBar } from "./TreatmentProgressBar";
import { TreatmentCompletionBadge } from "./TreatmentCompletionBadge";
import { useTreatmentSessions } from "@/hooks/useTreatmentSessions";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

interface CurrentTreatmentCardProps {
  patient: Patient;
}

export const CurrentTreatmentCard: React.FC<CurrentTreatmentCardProps> = ({
  patient,
}) => {
  // Fetch treatment sessions for progress tracking
  const { treatmentSessions, loading: sessionsLoading } = useTreatmentSessions(
    Number(patient.id)
  );
  const getTreatmentTitle = (
    type: AttendanceType
  ): { title: string; icon: string } => {
    const treatmentTitles = {
      spiritual: { title: "Consulta Espiritual", icon: "🔮" },
      lightBath: { title: "Banho de Luz", icon: "💡" },
      rod: { title: "Tratamento com Bastão", icon: "⚡" },
      combined: { title: "Tratamento Combinado", icon: "✨" },
    };

    return treatmentTitles[type] || treatmentTitles.spiritual;
  };

  // Get active treatment sessions grouped by type
  const getActiveTreatmentSessions = () => {
    const activeSessions = treatmentSessions.filter(
      (session) =>
        session.status === "scheduled" ||
        session.status === "active" ||
        session.status === "in_progress"
    );

    return {
      light_bath: activeSessions.filter(
        (session) => session.treatment_type === "light_bath"
      ),
      rod: activeSessions.filter((session) => session.treatment_type === "rod"),
    };
  };

  // Get session details for progress display
  const getSessionDetails = (sessionRecords?: Array<{ status: string }>) => {
    if (!sessionRecords) return { upcoming: 0, missed: 0, cancelled: 0 };

    return {
      upcoming: sessionRecords.filter((record) => record.status === "scheduled")
        .length,
      missed: sessionRecords.filter((record) => record.status === "missed")
        .length,
      cancelled: sessionRecords.filter(
        (record) => record.status === "cancelled"
      ).length,
    };
  };

  // Static title for the card (always Spiritual Consultation)
  const cardTitle = "Consulta Espiritual";
  const cardIcon = "🔮";
  const groupedActiveSessions = getActiveTreatmentSessions();

  return (
    <div className="ds-card">
      <div className="ds-card-body">
        <h2 className="ds-text-heading-2 mb-4 flex items-center">
          {cardIcon} {cardTitle}
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

        {/* Active Treatment Progress - Grouped by Type */}
        {!sessionsLoading &&
          (groupedActiveSessions.light_bath.length > 0 ||
            groupedActiveSessions.rod.length > 0) && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center gap-2">
                📊 Progresso dos Tratamentos Ativos
                {sessionsLoading && <LoadingSpinner size="small" />}
              </h3>

              {/* Light Bath Treatments */}
              {groupedActiveSessions.light_bath.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-yellow-700 mb-2 flex items-center gap-2">
                    💡 Banho de Luz
                    <span className="text-xs text-gray-500">
                      ({groupedActiveSessions.light_bath.length} ativo
                      {groupedActiveSessions.light_bath.length > 1 ? "s" : ""})
                    </span>
                  </h4>
                  <div className="space-y-2">
                    {groupedActiveSessions.light_bath.map((session) => (
                      <div
                        key={session.id}
                        className="bg-yellow-50 rounded-lg p-3 border border-yellow-100"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">
                              {session.body_location ||
                                "Local não especificado"}
                            </span>
                            {session.color && (
                              <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full">
                                {session.color}
                              </span>
                            )}
                            {session.duration_minutes && (
                              <span className="text-xs text-gray-500">
                                {session.duration_minutes}min
                              </span>
                            )}
                          </div>
                          <TreatmentCompletionBadge
                            completionPercentage={Math.round(
                              (session.completed_sessions /
                                session.planned_sessions) *
                                100
                            )}
                            status={
                              session.status as
                                | "scheduled"
                                | "active"
                                | "in_progress"
                                | "completed"
                                | "suspended"
                                | "cancelled"
                            }
                            size="sm"
                            showMilestone={false}
                          />
                        </div>
                        <TreatmentProgressBar
                          completed={session.completed_sessions}
                          total={session.planned_sessions}
                          treatmentType="light_bath"
                          sessionDetails={getSessionDetails(
                            session.sessionRecords
                          )}
                          size="sm"
                          showDetails={true}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rod Treatments */}
              {groupedActiveSessions.rod.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-purple-700 mb-2 flex items-center gap-2">
                    ⚡ Tratamento com Bastão
                    <span className="text-xs text-gray-500">
                      ({groupedActiveSessions.rod.length} ativo
                      {groupedActiveSessions.rod.length > 1 ? "s" : ""})
                    </span>
                  </h4>
                  <div className="space-y-2">
                    {groupedActiveSessions.rod.map((session) => (
                      <div
                        key={session.id}
                        className="bg-purple-50 rounded-lg p-3 border border-purple-100"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-700">
                              {session.body_location ||
                                "Local não especificado"}
                            </span>
                          </div>
                          <TreatmentCompletionBadge
                            completionPercentage={Math.round(
                              (session.completed_sessions /
                                session.planned_sessions) *
                                100
                            )}
                            status={
                              session.status as
                                | "scheduled"
                                | "active"
                                | "in_progress"
                                | "completed"
                                | "suspended"
                                | "cancelled"
                            }
                            size="sm"
                            showMilestone={false}
                          />
                        </div>
                        <TreatmentProgressBar
                          completed={session.completed_sessions}
                          total={session.planned_sessions}
                          treatmentType="rod"
                          sessionDetails={getSessionDetails(
                            session.sessionRecords
                          )}
                          size="sm"
                          showDetails={true}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

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
                    <TreatmentStatusBadge
                      isActive={!!patient.currentRecommendations.food}
                      label={
                        patient.currentRecommendations.food ||
                        "Não especificado"
                      }
                      icon="🍎"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">💧 Água:</span>
                    <TreatmentStatusBadge
                      isActive={!!patient.currentRecommendations.water}
                      label={
                        patient.currentRecommendations.water ||
                        "Não especificado"
                      }
                      icon="💧"
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">🧴 Pomada:</span>
                    <TreatmentStatusBadge
                      isActive={!!patient.currentRecommendations.ointment}
                      label={
                        patient.currentRecommendations.ointment ||
                        "Não especificado"
                      }
                      icon="🧴"
                    />
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
                className="ds-button-primary"
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

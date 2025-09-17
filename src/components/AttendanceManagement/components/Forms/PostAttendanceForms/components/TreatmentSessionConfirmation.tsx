import React from "react";
import { formatDateBR } from "@/utils/dateHelpers";

// Interface matching the actual backend TreatmentSessionResponseDto
export interface CreatedTreatmentSession {
  id: number;
  treatment_record_id: number;
  attendance_id: number;
  patient_id: number;
  treatment_type: "light_bath" | "rod";
  body_location: string;
  start_date: string; // Will be converted to Date by backend
  planned_sessions: number;
  completed_sessions: number;
  end_date?: string;
  status: string;
  duration_minutes?: number;
  color?: string;
  notes?: string;
  sessionRecords?: unknown[];
  created_at: string;
  updated_at: string;
}

interface TreatmentSessionConfirmationProps {
  /** Array of created treatment sessions */
  sessions: CreatedTreatmentSession[];
  /** Patient name for personalized messaging */
  patientName: string;
  /** Callback when user acknowledges the confirmation */
  onAcknowledge: () => void;
  /** Optional custom message */
  customMessage?: string;
}

/**
 * TreatmentSessionConfirmation - Displays detailed confirmation of created treatment sessions
 * and their automatically scheduled attendances
 */
const TreatmentSessionConfirmation: React.FC<
  TreatmentSessionConfirmationProps
> = ({ sessions, patientName, onAcknowledge, customMessage }) => {
  // Helper function to get the next Tuesday from a start date
  const getNextTuesday = (startDate: Date): Date => {
    const tuesday = 2; // Tuesday = 2 (Monday = 1, Sunday = 0)
    const dayOfWeek = startDate.getDay();
    let daysUntilTuesday = tuesday - dayOfWeek;

    // If today is Tuesday or we've passed Tuesday this week, go to next week
    if (daysUntilTuesday <= 0) {
      daysUntilTuesday += 7;
    }

    const nextTuesday = new Date(startDate);
    nextTuesday.setDate(startDate.getDate() + daysUntilTuesday);
    return nextTuesday;
  };

  // Helper function to add weeks to a date
  const addWeeks = (date: Date, weeks: number): Date => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + weeks * 7);
    return newDate;
  };

  // Generate scheduled appointment dates for a session
  const getScheduledDates = (session: CreatedTreatmentSession): Date[] => {
    const startDate = new Date(session.start_date);
    const firstTuesday = getNextTuesday(startDate);
    const dates: Date[] = [];

    for (let i = 0; i < session.planned_sessions; i++) {
      dates.push(addWeeks(firstTuesday, i));
    }

    return dates;
  };

  // Group sessions by treatment type
  const lightBathSessions = sessions.filter(
    (s) => s.treatment_type === "light_bath"
  );
  const rodSessions = sessions.filter((s) => s.treatment_type === "rod");

  // Calculate total appointments
  const totalAppointments = sessions.reduce(
    (sum, session) => sum + session.planned_sessions,
    0
  );

  const formatDuration = (durationInUnits?: number): string => {
    if (!durationInUnits) return "";
    const minutes = durationInUnits * 7;
    return `${minutes} min`;
  };

  const getTreatmentTypeIcon = (type: "light_bath" | "rod") => {
    if (type === "light_bath") {
      return (
        <div className="w-6 h-6 rounded-full bg-yellow-100 flex items-center justify-center">
          <span className="text-sm">💡</span>
        </div>
      );
    } else {
      return (
        <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
          <span className="text-sm">🔮</span>
        </div>
      );
    }
  };

  const getTreatmentTypeBadge = (type: "light_bath" | "rod") => {
    if (type === "light_bath") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          💡 Banho de Luz
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          🔮 Bastão
        </span>
      );
    }
  };

  const renderSessionGroup = (
    sessionGroup: CreatedTreatmentSession[],
    title: string
  ) => {
    if (sessionGroup.length === 0) return null;

    return (
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <h4 className="font-medium text-gray-900 flex items-center space-x-2">
          {getTreatmentTypeIcon(sessionGroup[0].treatment_type)}
          <span>{title}</span>
          <span className="text-sm text-gray-500">
            ({sessionGroup.length}{" "}
            {sessionGroup.length === 1 ? "série" : "séries"})
          </span>
        </h4>

        <div className="space-y-3">
          {sessionGroup.map((session) => {
            const scheduledDates = getScheduledDates(session);
            return (
              <div
                key={session.id}
                className="bg-white rounded border border-gray-200 p-3"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      {getTreatmentTypeBadge(session.treatment_type)}
                      <span className="text-sm font-medium text-gray-900">
                        {session.body_location}
                      </span>
                    </div>

                    {session.treatment_type === "light_bath" && (
                      <div className="flex items-center space-x-3 text-sm text-gray-600">
                        {session.color && (
                          <span className="flex items-center space-x-1">
                            <div
                              className="w-3 h-3 rounded-full border border-gray-300"
                              style={{
                                backgroundColor: session.color.toLowerCase(),
                              }}
                            ></div>
                            <span>{session.color}</span>
                          </span>
                        )}
                        {session.duration_minutes && (
                          <span className="flex items-center space-x-1">
                            <span className="text-xs">⏰</span>
                            <span>
                              {formatDuration(session.duration_minutes)}
                            </span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-medium text-blue-600">
                      {session.planned_sessions}{" "}
                      {session.planned_sessions === 1 ? "sessão" : "sessões"}
                    </div>
                    <div className="text-xs text-gray-500">
                      Início: {formatDateBR(session.start_date)}
                    </div>
                  </div>
                </div>

                {/* Scheduled appointments preview */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="text-xs text-gray-600 mb-2 flex items-center space-x-1">
                    <span className="text-sm">📅</span>
                    <span>Agendamentos automáticos (às terças-feiras):</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {scheduledDates.slice(0, 3).map((date, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded text-xs bg-blue-50 text-blue-700 border border-blue-200"
                      >
                        {formatDateBR(date.toISOString())}
                      </span>
                    ))}
                    {scheduledDates.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 rounded text-xs bg-gray-100 text-gray-600">
                        +{scheduledDates.length - 3} mais
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Success header */}
      <div className="flex items-center space-x-3 mb-6">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <span className="text-green-600 text-lg">✅</span>
          </div>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Tratamento registrado com sucesso!
          </h3>
          <p className="text-sm text-gray-600">
            {customMessage ||
              `Tratamento para ${patientName} foi registrado e os agendamentos foram criados automaticamente.`}
          </p>
        </div>
      </div>

      {/* Summary statistics */}
      <div className="bg-blue-50 rounded-lg p-4 mb-6">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {sessions.length}
            </div>
            <div className="text-sm text-blue-800">
              {sessions.length === 1 ? "Série criada" : "Séries criadas"}
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {totalAppointments}
            </div>
            <div className="text-sm text-blue-800">
              Agendamentos automáticos
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">Terças</div>
            <div className="text-sm text-blue-800">Dia da semana</div>
          </div>
        </div>
      </div>

      {/* Treatment session details */}
      <div className="space-y-4 mb-6">
        {renderSessionGroup(lightBathSessions, "Banhos de Luz")}
        {renderSessionGroup(rodSessions, "Tratamentos com Bastão")}
      </div>

      {/* Information note */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <span className="text-amber-600 text-lg">📅</span>
          </div>
          <div className="text-sm text-amber-800">
            <p className="font-medium mb-1">Agendamentos automáticos criados</p>
            <p>
              Todos os agendamentos foram criados automaticamente para as
              terças-feiras, começando na próxima terça após a data de início.
              Os pacientes podem ver seus agendamentos na agenda e realizar
              check-in normalmente.
            </p>
          </div>
        </div>
      </div>

      {/* Action button */}
      <div className="flex justify-end">
        <button
          onClick={onAcknowledge}
          className="px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Entendi
        </button>
      </div>
    </div>
  );
};

export default TreatmentSessionConfirmation;

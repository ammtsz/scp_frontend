import React from "react";
import { TreatmentProgressBar } from "../TreatmentProgressBar";
import { TreatmentCompletionBadge } from "../TreatmentCompletionBadge";

interface TreatmentSession {
  id: number;
  treatment_type: "light_bath" | "rod";
  body_location: string;
  planned_sessions: number;
  completed_sessions: number;
  status: string;
  duration_minutes?: number;
  color?: string;
  sessionRecords?: Array<{ status: string }>;
}

interface TreatmentSessionCardProps {
  session: TreatmentSession;
  onDelete: (sessionId: string, sessionType: string) => void;
  isDeleting: boolean;
}

const getSessionDetails = (sessionRecords?: Array<{ status: string }>) => {
  if (!sessionRecords) return { upcoming: 0, missed: 0, cancelled: 0 };

  return {
    upcoming: sessionRecords.filter((record) => record.status === "scheduled")
      .length,
    missed: sessionRecords.filter((record) => record.status === "missed")
      .length,
    cancelled: sessionRecords.filter((record) => record.status === "cancelled")
      .length,
  };
};

const getTreatmentConfig = (type: "light_bath" | "rod") => {
  const configs = {
    light_bath: {
      name: "Banho de Luz",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-50",
      badgeColor: "bg-yellow-100 text-yellow-800",
    },
    rod: {
      name: "Bastão",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-100",
      badgeColor: "",
    },
  };

  return configs[type];
};

export const TreatmentSessionCard: React.FC<TreatmentSessionCardProps> = ({
  session,
  onDelete,
  isDeleting,
}) => {
  const config = getTreatmentConfig(session.treatment_type);

  return (
    <div
      className={`${config.bgColor} rounded-lg p-3 border ${config.borderColor}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">
            {session.body_location || "Local não especificado"}
          </span>
          {session.color && (
            <span
              className={`text-xs ${config.badgeColor} px-2 py-0.5 rounded-full`}
            >
              {session.color}
            </span>
          )}
          {session.duration_minutes && (
            <span className="text-xs text-gray-500">
              {session.duration_minutes}min
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <TreatmentCompletionBadge
            completionPercentage={Math.round(
              (session.completed_sessions / session.planned_sessions) * 100
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
          <button
            onClick={() => onDelete(session.id.toString(), config.name)}
            disabled={isDeleting}
            className="text-red-500 hover:text-red-700 text-xs px-2 py-1 rounded transition-colors disabled:opacity-50"
            title="Remover sessão"
          >
            ❌
          </button>
        </div>
      </div>
      <TreatmentProgressBar
        completed={session.completed_sessions}
        total={session.planned_sessions}
        treatmentType={session.treatment_type}
        sessionDetails={getSessionDetails(session.sessionRecords)}
        size="sm"
        showDetails={true}
      />
    </div>
  );
};

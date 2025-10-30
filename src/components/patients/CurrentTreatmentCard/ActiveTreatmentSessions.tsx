import React from "react";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { ShowMoreButton } from "@/components/common/ShowMoreButton";
import { TreatmentSessionCard } from "./TreatmentSessionCard";

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

interface ActiveTreatmentSessionsProps {
  lightBathSessions: TreatmentSession[];
  rodSessions: TreatmentSession[];
  visibleLightBathSessions: TreatmentSession[];
  visibleRodSessions: TreatmentSession[];
  hasMoreLightBath: boolean;
  hasMoreRod: boolean;
  showMoreLightBath: () => void;
  showMoreRod: () => void;
  totalLightBath: number;
  totalRod: number;
  visibleLightBathCount: number;
  visibleRodCount: number;
  sessionsLoading: boolean;
  onDeleteSession: (sessionId: string, sessionType: string) => void;
  isDeleting: boolean;
}

export const ActiveTreatmentSessions: React.FC<ActiveTreatmentSessionsProps> = ({
  lightBathSessions,
  rodSessions,
  visibleLightBathSessions,
  visibleRodSessions,
  hasMoreLightBath,
  hasMoreRod,
  showMoreLightBath,
  showMoreRod,
  totalLightBath,
  totalRod,
  visibleLightBathCount,
  visibleRodCount,
  sessionsLoading,
  onDeleteSession,
  isDeleting,
}) => {
  // Don't render if no active sessions
  if (!sessionsLoading && lightBathSessions.length === 0 && rodSessions.length === 0) {
    return null;
  }

  return (
    <div className="mb-6 mt-10">
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        📊 Progresso dos Tratamentos Ativos
        {sessionsLoading && <LoadingSpinner size="small" />}
      </h3>

      {/* Light Bath Treatments */}
      {lightBathSessions.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-yellow-700 mb-2 flex items-center gap-2">
            Banho de Luz
            <span className="text-xs text-gray-500">
              ({lightBathSessions.length} ativo
              {lightBathSessions.length > 1 ? "s" : ""})
            </span>
          </h4>
          <div className="space-y-2">
            {visibleLightBathSessions.map((session) => (
              <TreatmentSessionCard
                key={session.id}
                session={session}
                onDelete={onDeleteSession}
                isDeleting={isDeleting}
              />
            ))}

            {/* Show More Button for Light Bath */}
            {hasMoreLightBath && (
              <ShowMoreButton
                onClick={showMoreLightBath}
                totalItems={totalLightBath}
                visibleCount={visibleLightBathCount}
                itemLabel="sessões"
                disabled={sessionsLoading}
              />
            )}
          </div>
        </div>
      )}

      {/* Rod Treatments */}
      {rodSessions.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-blue-700 mb-2 flex items-center gap-2">
            Bastão
            <span className="text-xs text-gray-500">
              ({rodSessions.length} ativo
              {rodSessions.length > 1 ? "s" : ""})
            </span>
          </h4>
          <div className="space-y-2">
            {visibleRodSessions.map((session) => (
              <TreatmentSessionCard
                key={session.id}
                session={session}
                onDelete={onDeleteSession}
                isDeleting={isDeleting}
              />
            ))}

            {/* Show More Button for Rod */}
            {hasMoreRod && (
              <ShowMoreButton
                onClick={showMoreRod}
                totalItems={totalRod}
                visibleCount={visibleRodCount}
                itemLabel="sessões"
                disabled={sessionsLoading}
              />
            )}
          </div>
        </div>
      )}
    </div>
  );
};
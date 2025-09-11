import React, { useEffect, useState } from "react";
import { getTreatmentSessionsByPatient } from "@/api/treatment-sessions";
import { getTreatmentSessionRecordsByPatient } from "@/api/treatment-session-records";
import type {
  TreatmentSessionResponseDto,
  TreatmentSessionRecordResponseDto,
} from "@/api/types";

interface TreatmentSessionProgressProps {
  patientId: number;
  attendanceType: "light_bath" | "rod";
  showDetails?: boolean;
}

interface SessionProgress {
  totalSessions: number;
  completedSessions: number;
  nextSessionDate?: string;
  hasActiveSession: boolean;
}

const TreatmentSessionProgress: React.FC<TreatmentSessionProgressProps> = ({
  patientId,
  attendanceType,
  showDetails = false,
}) => {
  const [progress, setProgress] = useState<SessionProgress | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessionProgress = async () => {
      if (!patientId) return;

      setLoading(true);
      setError(null);

      try {
        // Fetch treatment sessions for this patient
        const sessionsResponse = await getTreatmentSessionsByPatient(
          patientId.toString()
        );

        if (!sessionsResponse.success || !sessionsResponse.value) {
          setProgress(null);
          return;
        }

        // Filter sessions by treatment type and find active sessions
        const relevantSessions = sessionsResponse.value.filter(
          (session: TreatmentSessionResponseDto) =>
            session.type === attendanceType && session.status === "active"
        );

        if (relevantSessions.length === 0) {
          setProgress(null);
          return;
        }

        // Get the most recent active session
        const activeSession = relevantSessions[0];

        // Fetch session records for this patient to get completion details
        const recordsResponse = await getTreatmentSessionRecordsByPatient(
          patientId.toString()
        );

        if (!recordsResponse.success || !recordsResponse.value) {
          setProgress({
            totalSessions: activeSession.total_sessions_recommended,
            completedSessions: activeSession.sessions_completed,
            hasActiveSession: true,
          });
          return;
        }

        // Filter records for this specific session
        const sessionRecords = recordsResponse.value.filter(
          (record: TreatmentSessionRecordResponseDto) =>
            record.treatment_session_id === activeSession.id
        );

        // Find next scheduled session
        const nextScheduledRecord = sessionRecords
          .filter((record) => record.status === "scheduled")
          .sort(
            (a, b) =>
              new Date(a.scheduled_date).getTime() -
              new Date(b.scheduled_date).getTime()
          )[0];

        setProgress({
          totalSessions: activeSession.total_sessions_recommended,
          completedSessions: activeSession.sessions_completed,
          nextSessionDate: nextScheduledRecord?.scheduled_date,
          hasActiveSession: true,
        });
      } catch (err) {
        console.error("Error fetching treatment session progress:", err);
        setError("Erro ao carregar progresso");
      } finally {
        setLoading(false);
      }
    };

    fetchSessionProgress();
  }, [patientId, attendanceType]);

  if (loading) return null;

  if (error) {
    return <div className="text-xs text-red-500">{error}</div>;
  }

  if (!progress) return null;

  const progressPercentage =
    progress.totalSessions > 0
      ? (progress.completedSessions / progress.totalSessions) * 100
      : 0;

  if (!showDetails) {
    // Compact version for attendance cards
    return (
      <div className="flex items-center gap-1 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <span className="text-gray-600">
            {progress.completedSessions}/{progress.totalSessions}
          </span>
        </div>
        {progress.nextSessionDate && (
          <span className="text-gray-500">
            • Próx:{" "}
            {new Date(progress.nextSessionDate).toLocaleDateString("pt-BR")}
          </span>
        )}
      </div>
    );
  }

  // Detailed version for modals or expanded views
  return (
    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-blue-800">
          Progresso do Tratamento{" "}
          {attendanceType === "light_bath" ? "Banho de Luz" : "Bastão"}
        </h4>
        <span className="text-sm text-blue-600">
          {progress.completedSessions}/{progress.totalSessions} sessões
        </span>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-blue-200 rounded-full h-2 mb-2">
        <div
          className="bg-blue-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      <div className="text-sm text-blue-700">
        <div>Progresso: {Math.round(progressPercentage)}%</div>
        {progress.nextSessionDate && (
          <div>
            Próxima sessão:{" "}
            {new Date(progress.nextSessionDate).toLocaleDateString("pt-BR")}
          </div>
        )}
      </div>
    </div>
  );
};

export default TreatmentSessionProgress;

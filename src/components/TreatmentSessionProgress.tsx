import React from "react";
import TreatmentProgressBadge from "./AttendanceManagement/components/TreatmentProgress/TreatmentProgressBadge";
import { useProgressTracking } from "./AttendanceManagement/components/TreatmentProgress/hooks/useProgressTracking";
import type { TreatmentProgress } from "./AttendanceManagement/components/TreatmentProgress/hooks/useProgressTracking";

interface TreatmentSessionProgressProps {
  patientId: number;
  attendanceType: "light_bath" | "rod";
  showDetails?: boolean;
  className?: string;
}

const TreatmentSessionProgress: React.FC<TreatmentSessionProgressProps> = ({
  patientId,
  attendanceType,
  showDetails = false,
  className,
}) => {
  const { treatmentProgress, isLoading, error } = useProgressTracking({
    patientId,
  });

  if (isLoading || error || !treatmentProgress) {
    return null;
  }

  // Find the treatment session matching this attendance type
  const matchingSession = treatmentProgress.find(
    (progress: TreatmentProgress) => progress.treatmentType === attendanceType
  );

  if (!matchingSession) {
    return null;
  }

  return (
    <TreatmentProgressBadge
      treatmentType={matchingSession.treatmentType}
      currentSession={matchingSession.currentSession}
      totalSessions={matchingSession.totalSessions}
      size={showDetails ? "md" : "sm"}
      showPercentage={showDetails}
      showProgressBar={showDetails}
      isCompleted={matchingSession.status === "completed"}
      compact={!showDetails}
      className={className}
    />
  );
};

export default TreatmentSessionProgress;

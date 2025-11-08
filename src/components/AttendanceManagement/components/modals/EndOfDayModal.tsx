import React, { Suspense } from "react";
import { useEndOfDayModal } from "@/stores/modalStore";
import LoadingFallback from "@/components/common/LoadingFallback";
import { useAttendanceData } from "../../hooks/useAttendanceData";
import { updateAttendanceStatus } from "@/api/attendanceSync";

// Lazy load the actual EndOfDayModal component
const EndOfDayContainer = React.lazy(
  () => import("../EndOfDay/EndOfDayContainer")
);

/**
 * Unified End of Day Modal - Combines store logic and lazy loading
 * Uses existing EndOfDayContainer component with Zustand store integration
 */
export const EndOfDayModal: React.FC = () => {
  const endOfDay = useEndOfDayModal();
  const { refreshData } = useAttendanceData();

  const handleCompletion = async (attendanceId: number) => {
    try {
      const result = await updateAttendanceStatus(attendanceId, "completed");
      if (result.success) {
        await refreshData();
      } else {
        throw new Error(result.error || "Failed to complete attendance");
      }
    } catch (error) {
      console.error("Error completing attendance:", error);
      throw error;
    }
  };

  const handleReschedule = async (attendanceId: number) => {
    try {
      const result = await updateAttendanceStatus(attendanceId, "missed");
      if (result.success) {
        await refreshData();
      } else {
        throw new Error(result.error || "Failed to reschedule attendance");
      }
    } catch (error) {
      console.error("Error rescheduling attendance:", error);
      throw error;
    }
  };

  // Don't render if modal is not open
  if (!endOfDay.isOpen) {
    return null;
  }

  return (
    <Suspense
      fallback={
        <LoadingFallback
          message="Carregando finalizador do dia..."
          size="small"
        />
      }
    >
      <EndOfDayContainer
        onHandleCompletion={handleCompletion}
        onReschedule={handleReschedule}
      />
    </Suspense>
  );
};

export default EndOfDayModal;

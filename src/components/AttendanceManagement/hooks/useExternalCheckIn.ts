import { useState, useEffect } from "react";
import { useAttendances } from "@/contexts/AttendancesContext";
import type { AttendanceType, Priority } from "@/types/types";

interface ExternalCheckIn {
  name: string;
  types: string[];
  isNew: boolean;
  priority?: Priority;
}

interface UseExternalCheckInProps {
  unscheduledCheckIn?: ExternalCheckIn | null;
  onCheckInProcessed?: () => void;
}

export const useExternalCheckIn = ({
  unscheduledCheckIn,
  onCheckInProcessed,
}: UseExternalCheckInProps = {}) => {
  const { attendancesByDate } = useAttendances();
  const [checkInProcessed, setCheckInProcessed] = useState(false);

  // Reset processed flag when unscheduledCheckIn changes
  useEffect(() => {
    if (unscheduledCheckIn) {
      setCheckInProcessed(false);
    }
  }, [unscheduledCheckIn]);

  // Inject unscheduledCheckIn into checkedIn columns if present
  useEffect(() => {
    if (
      unscheduledCheckIn &&
      attendancesByDate &&
      Array.isArray(unscheduledCheckIn.types) &&
      unscheduledCheckIn.types.length > 0 &&
      !checkInProcessed // Prevent re-processing
    ) {
      unscheduledCheckIn.types.forEach((type) => {
        if (
          attendancesByDate[type as AttendanceType] &&
          !attendancesByDate[type as AttendanceType].checkedIn.some(
            (p) => p.name === unscheduledCheckIn.name
          )
        ) {
          attendancesByDate[type as AttendanceType].checkedIn.push({
            name: unscheduledCheckIn.name,
            priority: unscheduledCheckIn.priority || "3",
            checkedInTime: new Date().toTimeString().split(' ')[0],
          });
        }
      });
      setCheckInProcessed(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unscheduledCheckIn, checkInProcessed]); // attendancesByDate intentionally excluded to prevent infinite loop

  // Call the callback only once when processing is complete
  useEffect(() => {
    if (checkInProcessed && onCheckInProcessed) {
      onCheckInProcessed();
      // Don't reset checkInProcessed here to avoid infinite loop
    }
  }, [checkInProcessed, onCheckInProcessed]);

  return {
    checkInProcessed,
  };
};

export default useExternalCheckIn;

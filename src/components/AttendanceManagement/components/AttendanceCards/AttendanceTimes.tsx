import React from "react";
import { AttendanceProgression } from "@/types/types";
import { useTimezone } from "@/contexts/TimezoneContext";
import { formatTime } from "@/utils/timezoneFormatters";

interface AttendanceTimesProps {
  status: AttendanceProgression;
  checkedInTime?: string | null;
  onGoingTime?: string | null;
  completedTime?: string | null;
}

const AttendanceTimes: React.FC<AttendanceTimesProps> = ({
  status,
  checkedInTime,
  onGoingTime,
}) => {
  const { userTimezone } = useTimezone();

  const formatTimeWithTimezone = (time: string | null | undefined) => {
    return formatTime(time, userTimezone, false); // Don't show timezone suffix in cards for cleaner look
  };

  const shouldShowCheckedIn = status !== "scheduled" && checkedInTime;
  const shouldShowOnGoing =
    !["scheduled", "checkedIn"].includes(status) && onGoingTime;

  return (
    <div className="absolute bottom-1.5 left-2 flex justify-between text-xs w-full">
      <span className="text-gray-500">
        {shouldShowCheckedIn &&
          `check-in: ${formatTimeWithTimezone(checkedInTime)}`}
      </span>
      <span className="mx-auto text-gray-500">
        {shouldShowOnGoing &&
          `atendimento: ${formatTimeWithTimezone(onGoingTime)}`}
      </span>
    </div>
  );
};

export default AttendanceTimes;

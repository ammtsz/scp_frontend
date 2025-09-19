import React from "react";
import { IAttendanceProgression } from "@/types/globals";

interface AttendanceTimesProps {
  status: IAttendanceProgression;
  checkedInTime?: string | null;
  onGoingTime?: string | null;
  completedTime?: string | null;
}

const AttendanceTimes: React.FC<AttendanceTimesProps> = ({
  status,
  checkedInTime,
  onGoingTime,
}) => {
  const formatTime = (time: string | null | undefined) => {
    if (!time) return "";
    return time.slice(0, 5); // Extract HH:mm from HH:mm:ss
  };

  const shouldShowCheckedIn = status !== "scheduled" && checkedInTime;
  const shouldShowOnGoing =
    !["scheduled", "checkedIn"].includes(status) && onGoingTime;

  return (
    <div className="absolute bottom-1.5 left-2 flex justify-between text-xs w-full">
      <span className="text-gray-500">
        {shouldShowCheckedIn && `check-in: ${formatTime(checkedInTime)}`}
      </span>
      <span className="mx-auto text-gray-500">
        {shouldShowOnGoing && `atendimento: ${formatTime(onGoingTime)}`}
      </span>
    </div>
  );
};

export default AttendanceTimes;

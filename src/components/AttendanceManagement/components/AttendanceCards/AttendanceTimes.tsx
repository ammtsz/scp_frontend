import React from "react";
import { IAttendanceProgression } from "@/types/globals";

interface AttendanceTimesProps {
  status: IAttendanceProgression;
  checkedInTime?: Date | null;
  onGoingTime?: Date | null;
  completedTime?: Date | null;
}

const AttendanceTimes: React.FC<AttendanceTimesProps> = ({
  status,
  checkedInTime,
  onGoingTime,
}) => {
  const formatTime = (time: Date | null | undefined) => {
    if (!time) return "";
    return new Date(time).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
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

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
  completedTime,
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
  const shouldShowCompleted = status === "completed" && completedTime;

  return (
    <div className="absolute bottom-2 left-2 right-2 flex justify-between text-xs w-[calc(100%-1rem)]">
      <span className="text-yellow-700">
        {shouldShowCheckedIn && formatTime(checkedInTime)}
      </span>
      <span className="mx-auto text-red-700">
        {shouldShowOnGoing && formatTime(onGoingTime)}
      </span>
      <span className="text-green-700">
        {shouldShowCompleted && formatTime(completedTime)}
      </span>
    </div>
  );
};

export default AttendanceTimes;

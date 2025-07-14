import React from "react";
import { IAttendanceProgression } from "@/types/db";

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
}) => (
  <div className="absolute bottom-2 left-2 right-2 flex justify-between text-xs text-gray-500 w-[calc(100%-1rem)]">
    <span>
      {(status !== "scheduled" || checkedInTime) &&
        checkedInTime &&
        new Date(checkedInTime).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })}
    </span>
    <span className="mx-auto">
      {status !== "scheduled" &&
        status !== "checkedIn" &&
        onGoingTime &&
        new Date(onGoingTime).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })}
    </span>
    <span>
      {status === "completed" &&
        completedTime &&
        new Date(completedTime).toLocaleTimeString("pt-BR", {
          hour: "2-digit",
          minute: "2-digit",
        })}
    </span>
  </div>
);

export default AttendanceTimes;

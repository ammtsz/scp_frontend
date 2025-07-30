import React from "react";
import {
  IAttendanceProgression,
  IAttendanceStatusDetail,
  IAttendanceType,
} from "@/types/globals";
import AttendanceTimes from "./AttendanceTimes";
import { IDraggedItem } from "./types";

interface AttendanceCardProps {
  patient: IAttendanceStatusDetail;
  status: IAttendanceProgression;
  type: IAttendanceType;
  idx: number;
  dragged: IDraggedItem | null;
  handleDragStart: (
    type: IAttendanceType,
    idx: number,
    status: IAttendanceProgression
  ) => void;
  handleDragEnd: () => void;
  isNextToBeAttended?: boolean; // NEW PROP
}

const AttendanceCard: React.FC<AttendanceCardProps> = ({
  patient,
  status,
  type,
  idx,
  dragged,
  handleDragStart,
  handleDragEnd,
  isNextToBeAttended = false,
}) => {
  const getStatusStyles = (status: IAttendanceProgression) => {
    const statusStyles = {
      scheduled: "border-gray-400",
      checkedIn: "border-yellow-400",
      onGoing: "border-red-400",
      completed: "border-green-400",
    };
    return statusStyles[status] || "border-gray-400";
  };

  const isDragged =
    dragged?.type === type &&
    dragged?.idx === idx &&
    dragged?.status === status;

  return (
    <li
      key={patient.name}
      draggable
      onDragStart={() => handleDragStart(type, idx, status)}
      onDragEnd={handleDragEnd}
      className={`relative h-20 w-full flex items-center justify-center p-2 rounded border-2 
        ${getStatusStyles(status)}
        bg-[color:var(--surface-light)] text-center font-medium transition-all cursor-move select-none
        ${isDragged ? "opacity-60" : ""}`}
    >
      {isNextToBeAttended && (
        <span className="absolute top-1 left-1 text-red-700 text-xs font-bold px-1 py-0 rounded z-10">
          Próximo a ser atendido
        </span>
      )}
      <span>
        {status === "checkedIn" ? `${idx + 1}. ` : ""}
        {patient.name} ({patient.priority})
      </span>
      <AttendanceTimes
        status={status}
        checkedInTime={patient.checkedInTime ?? undefined}
        onGoingTime={patient.onGoingTime ?? undefined}
        completedTime={patient.completedTime ?? undefined}
      />
    </li>
  );
};

export default AttendanceCard;

import React from "react";
import {
  IAttendanceProgression,
  IAttendanceStatusDetail,
  IAttendanceType,
} from "@/types/globas";
import AttendanceTimes from "./AttendanceTimes";
import { IDraggedItem } from "./useAttendanceList";

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
}) => (
  <li
    key={patient.name}
    draggable
    onDragStart={() => handleDragStart(type, idx, status)}
    onDragEnd={handleDragEnd}
    className={`relative h-20 w-full flex items-center justify-center p-2 rounded border-2 
      ${status === "scheduled" ? "border-gray-400" : ""}
      ${status === "checkedIn" ? "border-yellow-400" : ""}
      ${status === "onGoing" ? "border-red-400" : ""}
      ${status === "completed" ? "border-green-400" : ""}
      bg-[color:var(--surface-light)] text-center font-medium transition-all cursor-move select-none ${
        dragged &&
        dragged.type === type &&
        dragged.idx === idx &&
        dragged.status === status
          ? "opacity-60"
          : ""
      }`}
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

export default AttendanceCard;

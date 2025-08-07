import React from "react";
import { X } from "react-feather";
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
  onDelete?: (attendanceId: number, patientName: string) => void;
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
  onDelete,
  isNextToBeAttended = false,
}) => {
  const getStatusStyles = (status: IAttendanceProgression) => {
    const statusStyles = {
      scheduled:
        "shadow-[0_2px_6px_0_rgba(59,130,246,0.5)] border-l-4 border-l-blue-400",
      checkedIn:
        "shadow-[0_2px_6px_0_rgba(239,68,68,0.5)] border-l-4 border-l-red-400",
      onGoing:
        "shadow-[0_2px_6px_0_rgba(251,191,36,0.5)] border-l-4 border-l-yellow-400",
      completed:
        "shadow-[0_2px_6px_0_rgba(34,197,94,0.5)] border-l-4 border-l-green-400",
    };
    return (
      statusStyles[status] ||
      "shadow-[0_2px_6px_0_rgba(59,130,246,0.5)] border-l-4 border-l-blue-400"
    );
  };

  const isDragged =
    dragged?.type === type &&
    dragged?.idx === idx &&
    dragged?.status === status;

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent drag start
    if (onDelete && patient.attendanceId && patient.patientId) {
      onDelete(patient.attendanceId, patient.name);
    }
  };

  return (
    <li
      key={patient.name}
      draggable
      onDragStart={() => handleDragStart(type, idx, status)}
      onDragEnd={handleDragEnd}
      className={`relative h-20 w-full flex items-center justify-center p-2 rounded-lg
        ${getStatusStyles(status)}
        bg-white text-center font-medium transition-all cursor-move select-none
        ${isDragged ? "opacity-60" : ""}`}
    >
      {isNextToBeAttended && (
        <span className="absolute top-1 left-1 text-red-700 text-xs font-bold px-1 py-0 rounded z-10">
          Próximo a ser atendido
        </span>
      )}

      {/* Delete button - only show for scheduled status and if onDelete is provided */}
      {onDelete &&
        status === "scheduled" &&
        patient.attendanceId &&
        patient.patientId && (
          <button
            onClick={handleDeleteClick}
            className="absolute top-1 right-1 p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors z-10"
            title="Apagar"
          >
            <X className="w-3 h-3" />
          </button>
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

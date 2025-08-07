import React from "react";
import {
  IAttendanceProgression,
  IAttendanceType,
  IAttendanceStatusDetail,
} from "@/types/globals";
import AttendanceCard from "./AttendanceCard";
import { IDraggedItem } from "./types";

interface AttendanceColumnProps {
  status: IAttendanceProgression;
  type: IAttendanceType;
  patients: IAttendanceStatusDetail[];
  dragged: IDraggedItem | null;
  handleDragStart: (
    type: IAttendanceType,
    idx: number,
    status: IAttendanceProgression
  ) => void;
  handleDragEnd: () => void;
  handleDrop: (type: IAttendanceType, status: IAttendanceProgression) => void;
  onDelete?: (attendanceId: number, patientName: string) => void;
}

const AttendanceColumn: React.FC<AttendanceColumnProps> = ({
  status,
  type,
  patients,
  dragged,
  handleDragStart,
  handleDragEnd,
  handleDrop,
  onDelete,
}) => {
  const getStatusConfig = (status: IAttendanceProgression) => {
    const statusConfig = {
      scheduled: { color: "text-gray-700", label: "Agendados" },
      checkedIn: { color: "text-yellow-700", label: "Sala de Espera" },
      onGoing: { color: "text-red-700", label: "Em Atendimento" },
      completed: { color: "text-green-700", label: "Atendidos" },
    };
    return statusConfig[status] || statusConfig.scheduled;
  };

  const config = getStatusConfig(status);

  return (
    <div className="flex-1 min-w-[220px] max-w-[1fr] flex flex-col">
      <div className={`mb-2 font-semibold text-center ${config.color}`}>
        {config.label}
      </div>
      <div className="flex-1 flex items-stretch border-1 border-dashed border-gray-300 rounded p-2">
        <ul
          onDragOver={(e) => {
            // Allow drop only if:
            // 1. There's something being dragged
            // 2. It's the same consultation type
            // 3. It's not the exact same position (same type AND status)
            if (
              dragged &&
              dragged.type === type &&
              !(dragged.type === type && dragged.status === status)
            ) {
              e.preventDefault();
            }
          }}
          onDrop={() => handleDrop(type, status)}
          className="w-full flex flex-col gap-2 justify-start items-stretch bg-[color:var(--surface-light)] rounded min-h-[300px]"
          style={{ minHeight: "100%" }}
        >
          {patients.length === 0 && (
            <li className="flex items-center justify-center text-gray-400 italic select-none pointer-events-none h-full">
              Arraste aqui para mover
            </li>
          )}
          {patients.map((patient, idx) => (
            <AttendanceCard
              key={patient.name}
              patient={patient}
              status={status}
              type={type}
              idx={idx}
              dragged={dragged}
              handleDragStart={handleDragStart}
              handleDragEnd={handleDragEnd}
              onDelete={onDelete}
              isNextToBeAttended={status === "checkedIn" && idx === 0}
            />
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AttendanceColumn;

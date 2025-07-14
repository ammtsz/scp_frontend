import React from "react";
import {
  IAttendanceProgression,
  IAttendanceType,
  IAttendanceStatusDetail,
} from "@/types/db";
import AttendanceCard from "./AttendanceCard";
import { IDraggedItem } from "./useAttendanceList";

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
}

const AttendanceColumn: React.FC<AttendanceColumnProps> = ({
  status,
  type,
  patients,
  dragged,
  handleDragStart,
  handleDragEnd,
  handleDrop,
}) => (
  <div className="flex-1 min-w-[220px] max-w-[1fr]">
    <div
      className={`mb-2 font-semibold text-center
        ${status === "scheduled" ? "text-yellow-700" : ""}
        ${status === "checkedIn" ? "text-blue-700" : ""}
        ${status === "onGoing" ? "text-purple-700" : ""}
        ${status === "completed" ? "text-green-700" : ""}`}
    >
      {status === "scheduled"
        ? "Agendados"
        : status === "checkedIn"
        ? "Sala de Espera"
        : status === "onGoing"
        ? "Em Atendimento"
        : "Atendidos"}
    </div>
    <ul
      onDragOver={(e) => {
        if (dragged && dragged.type === type && dragged.status !== status) {
          e.preventDefault();
        }
      }}
      onDrop={() => handleDrop(type, status)}
      className="min-h-[60px] flex flex-col gap-2 justify-start items-stretch bg-[color:var(--surface-light)] rounded"
    >
      {patients.length === 0 && (
        <li className="h-20 flex items-center justify-center text-gray-400 italic border-2 border-dashed border-[color:var(--border)] rounded select-none pointer-events-none">
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
        />
      ))}
    </ul>
  </div>
);

export default AttendanceColumn;

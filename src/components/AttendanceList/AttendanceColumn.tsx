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
  <div className="flex-1 min-w-[220px] max-w-[1fr] flex flex-col">
    <div
      className={`mb-2 font-semibold text-center
        ${status === "scheduled" ? "text-gray-700" : ""}
        ${status === "checkedIn" ? "text-yellow-700" : ""}
        ${status === "onGoing" ? "text-red-700" : ""}
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
    <div className="flex-1 flex items-stretch border-1 border-dashed border-[color:var(--border)] rounded p-2">
      <ul
        onDragOver={(e) => {
          if (dragged && dragged.type === type && dragged.status !== status) {
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
            isNextToBeAttended={status === "checkedIn" && idx === 0}
          />
        ))}
      </ul>
    </div>
  </div>
);

export default AttendanceColumn;

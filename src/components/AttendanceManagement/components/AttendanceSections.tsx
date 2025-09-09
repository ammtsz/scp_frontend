import React from "react";
import AttendanceColumn from "./AttendanceColumn";
import {
  IAttendanceProgression,
  IAttendanceType,
  IAttendanceStatusDetail,
} from "@/types/globals";
import { IDraggedItem } from "../types";

interface AttendanceSectionsProps {
  collapsed: Record<string, boolean>;
  getPatients: (
    type: IAttendanceType,
    status: IAttendanceProgression
  ) => IAttendanceStatusDetail[];
  dragged: IDraggedItem | null;
  handleDragStart: (
    type: IAttendanceType,
    index: number,
    status: IAttendanceProgression,
    patientId?: number
  ) => void;
  handleDragEnd: () => void;
  handleDropWithConfirm: (
    type: IAttendanceType,
    status: IAttendanceProgression
  ) => void;
  onDelete: (attendanceId: number, patientName: string) => Promise<void>;
  toggleCollapsed: (type: IAttendanceType) => void;
  isDayFinalized?: boolean;
}

export const AttendanceSections: React.FC<AttendanceSectionsProps> = ({
  collapsed,
  getPatients,
  dragged,
  handleDragStart,
  handleDragEnd,
  handleDropWithConfirm,
  onDelete,
  toggleCollapsed,
  isDayFinalized = false,
}) => {
  return (
    <div className="flex flex-col w-full">
      {/* Spiritual Section */}
      <div key="spiritual" className="w-full">
        <button
          className="w-full text-left mb-2 px-2 py-1 rounded bg-[color:var(--surface-light)] border border-[color:var(--border)] font-semibold text-[color:var(--primary-dark)]"
          onClick={() => toggleCollapsed("spiritual")}
        >
          {collapsed.spiritual ? "▶ " : "▼ "}Consultas Espirituais
        </button>
        {!collapsed.spiritual && (
          <div className="flex flex-row gap-4 w-full mb-8">
            {(
              [
                "scheduled",
                "checkedIn",
                "onGoing",
                "completed",
              ] as IAttendanceProgression[]
            ).map((status) => {
              // For spiritual section, just spiritual patients
              const spiritualPatients = getPatients("spiritual", status).map(
                (patient) => ({
                  ...patient,
                  originalType: "spiritual" as IAttendanceType,
                })
              );

              return (
                <AttendanceColumn
                  key={status}
                  status={status}
                  patients={spiritualPatients}
                  dragged={dragged}
                  handleDragStart={handleDragStart}
                  handleDragEnd={handleDragEnd}
                  handleDrop={() => handleDropWithConfirm("spiritual", status)}
                  onDelete={onDelete}
                  isDayFinalized={isDayFinalized}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* LightBath + Rod Section */}
      <div key="mixed" className="w-full">
        <button
          className="w-full text-left mb-2 px-2 py-1 rounded bg-[color:var(--surface-light)] border border-[color:var(--border)] font-semibold text-[color:var(--primary-dark)]"
          onClick={() => {
            // Toggle both lightBath and rod together for mixed section
            toggleCollapsed("lightBath");
            toggleCollapsed("rod");
          }}
        >
          {collapsed.lightBath && collapsed.rod ? "▶ " : "▼ "}Banhos de Luz +
          Bastão
        </button>
        {!(collapsed.lightBath && collapsed.rod) && (
          <div className="flex flex-row gap-4 w-full mb-8">
            {(
              [
                "scheduled",
                "checkedIn",
                "onGoing",
                "completed",
              ] as IAttendanceProgression[]
            ).map((status) => {
              // Combine lightBath and rod patients with type information
              const lightBathPatients = getPatients("lightBath", status).map(
                (patient) => ({
                  ...patient,
                  originalType: "lightBath" as IAttendanceType,
                })
              );
              const rodPatients = getPatients("rod", status).map((patient) => ({
                ...patient,
                originalType: "rod" as IAttendanceType,
              }));
              const mixedPatients = [...lightBathPatients, ...rodPatients];

              return (
                <AttendanceColumn
                  key={status}
                  status={status}
                  patients={mixedPatients}
                  dragged={dragged}
                  handleDragStart={handleDragStart}
                  handleDragEnd={handleDragEnd}
                  handleDrop={() => {
                    // For mixed section, we need to determine the drop target based on drag source
                    if (dragged?.type === "lightBath") {
                      handleDropWithConfirm("lightBath", status);
                    } else if (dragged?.type === "rod") {
                      handleDropWithConfirm("rod", status);
                    }
                  }}
                  onDelete={onDelete}
                  isDayFinalized={isDayFinalized}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

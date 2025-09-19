import React from "react";
import AttendanceColumn from "./AttendanceColumn";
import {
  IAttendanceProgression,
  IAttendanceType,
  IAttendanceStatusDetail,
} from "@/types/globals";
import { IDraggedItem } from "../types";
import type { TreatmentInfo } from "@/hooks/useTreatmentIndicators";
import { groupPatientsByTreatments } from "../utils/patientGrouping";

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
  treatmentsByPatient?: Map<number, TreatmentInfo>;
  onTreatmentInfoClick?: (patientId: number) => void;
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
  treatmentsByPatient,
  onTreatmentInfoClick,
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
                  treatmentDataMap={treatmentsByPatient}
                  onTreatmentInfoClick={onTreatmentInfoClick}
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
          {collapsed.lightBath && collapsed.rod ? "▶ " : "▼ "}Banhos de Luz e
          Bastão
        </button>
        {/* Dynamic legend based on available types - only show for non-spiritual */}
        <div className="flex items-center gap-4 text-xs text-gray-800 my-4">
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-400 rounded"></div>
            Banho de Luz
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            Bastão
          </span>
          <span className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            Banho de Luz e Bastão
          </span>
        </div>
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
              // Get separate light bath and rod patients
              const lightBathPatients = getPatients("lightBath", status);
              const rodPatients = getPatients("rod", status);

              // Group patients by patientId and combine their treatments
              const groupedPatients = groupPatientsByTreatments(
                lightBathPatients,
                rodPatients
              );

              return (
                <AttendanceColumn
                  key={status}
                  status={status}
                  patients={groupedPatients}
                  dragged={dragged}
                  handleDragStart={handleDragStart}
                  handleDragEnd={handleDragEnd}
                  handleDrop={() => {
                    if (dragged?.type)
                      handleDropWithConfirm(dragged?.type, status);
                  }}
                  onDelete={onDelete}
                  isDayFinalized={isDayFinalized}
                  treatmentDataMap={treatmentsByPatient}
                  onTreatmentInfoClick={onTreatmentInfoClick}
                />
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

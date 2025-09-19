import React from "react";
import {
  IAttendanceProgression,
  IAttendanceType,
  IAttendanceStatusDetail,
} from "@/types/globals";
import { IDraggedItem } from "../types";
import AttendanceCard from "./AttendanceCards/AttendanceCard";
import { getStatusColor, getStatusLabel } from "../styles/cardStyles";
import type { TreatmentInfo } from "@/hooks/useTreatmentIndicators";
import type { IGroupedPatient } from "../utils/patientGrouping";

interface PatientWithType extends IAttendanceStatusDetail {
  originalType: IAttendanceType;
}

interface AttendanceColumnProps {
  status: IAttendanceProgression;
  patients: (PatientWithType | IGroupedPatient)[];
  dragged: IDraggedItem | null;
  handleDragStart: (
    type: IAttendanceType,
    index: number,
    status: IAttendanceProgression,
    patientId?: number
  ) => void;
  handleDragEnd: () => void;
  handleDrop: () => void;
  onDelete: (attendanceId: number, patientName: string) => void;
  isDayFinalized?: boolean;
  treatmentDataMap?: Map<number, TreatmentInfo>;
  onTreatmentInfoClick?: (patientId: number) => void;
}

const AttendanceColumn: React.FC<AttendanceColumnProps> = React.memo(
  ({
    status,
    patients,
    dragged,
    handleDragStart,
    handleDragEnd,
    handleDrop,
    onDelete,
    isDayFinalized = false,
    treatmentDataMap,
    onTreatmentInfoClick,
  }) => {
    // Sort patients by priority (1 = highest)
    const sortedPatients = React.useMemo(
      () =>
        patients.sort((a, b) => {
          const priorityA = parseInt(a.priority);
          const priorityB = parseInt(b.priority);
          return priorityA - priorityB;
        }),
      [patients]
    );

    // Get type counts for the legend
    const typeCounts = React.useMemo(
      () =>
        patients.reduce((acc, patient) => {
          // Check if this is a grouped patient with combined treatments
          if ("combinedType" in patient && "treatmentTypes" in patient) {
            const groupedPatient = patient as IGroupedPatient;
            // Count each treatment type the patient has
            groupedPatient.treatmentTypes.forEach((type) => {
              acc[type] = (acc[type] || 0) + 1;
            });
          } else {
            // Regular patient with single treatment type
            const regularPatient = patient as PatientWithType;
            acc[regularPatient.originalType] =
              (acc[regularPatient.originalType] || 0) + 1;
          }
          return acc;
        }, {} as Record<IAttendanceType, number>),
      [patients]
    );

    // Check if we should show the legend (only for non-spiritual types)
    const shouldShowLegend = patients.some(
      (p) => p.originalType !== "spiritual"
    );

    return (
      <div className="flex-1 min-h-[300px]">
        {/* Title outside the dashed box */}
        <div className="flex items-center justify-between mb-3">
          <h3 className={`font-semibold ${getStatusColor(status)}`}>
            {getStatusLabel(status)}
          </h3>
          {/* Dynamic legend based on available types - only show for non-spiritual */}
          {shouldShowLegend && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {typeCounts.lightBath > 0 && (
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-yellow-400 rounded"></div>(
                  {typeCounts.lightBath})
                </span>
              )}
              {typeCounts.rod > 0 && (
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>(
                  {typeCounts.rod})
                </span>
              )}
              {typeCounts.combined > 0 && (
                <span className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>(
                  {typeCounts.combined})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Grey dashed box for drag and drop */}
        <div
          className="bg-gray-100 p-4 rounded-lg border-2 border-dashed border-gray-300 min-h-[250px] h-[calc(100%-2rem)]"
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
        >
          <div className="space-y-2">
            {sortedPatients.map((patient, index) => {
              const treatmentInfo = patient.patientId
                ? treatmentDataMap?.get(patient.patientId)
                : undefined;

              // Determine the original type to use for the card
              const originalType =
                "originalType" in patient
                  ? (patient as PatientWithType).originalType
                  : "lightBath"; // Default fallback for grouped patients

              return (
                <AttendanceCard
                  key={`${originalType}-${
                    patient.attendanceId || patient.name
                  }-${index}`}
                  patient={patient}
                  type={originalType}
                  status={status}
                  dragged={dragged}
                  handleDragStart={(type, idx, status) =>
                    handleDragStart(type, idx, status, patient.patientId)
                  }
                  handleDragEnd={handleDragEnd}
                  onDelete={onDelete}
                  index={index}
                  isNextToBeAttended={status === "checkedIn" && index === 0}
                  isDayFinalized={isDayFinalized}
                  treatmentInfo={treatmentInfo}
                  onTreatmentInfoClick={
                    treatmentInfo && onTreatmentInfoClick && patient.patientId
                      ? () => onTreatmentInfoClick(patient.patientId!)
                      : undefined
                  }
                  groupedPatient={
                    "combinedType" in patient
                      ? (patient as IGroupedPatient)
                      : undefined
                  }
                />
              );
            })}

            {sortedPatients.length === 0 && (
              <div className="text-gray-400 text-center py-8 text-sm italic">
                Arraste para mover
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

AttendanceColumn.displayName = "AttendanceColumn";

export default AttendanceColumn;

import React from "react";
import {
  AttendanceStatusDetail,
  AttendanceProgression,
  AttendanceType,
} from "@/types/types";
import { IDraggedItem } from "../../types";
import { getTypeBasedStyles, getTooltipContent } from "../../styles/cardStyles";
import AttendanceTimes from "./AttendanceTimes";
import type { IGroupedPatient } from "../../utils/patientGrouping";
import type { TreatmentInfo } from "@/hooks/useTreatmentIndicators";

interface AttendanceCardProps {
  patient: AttendanceStatusDetail;
  type: AttendanceType;
  status: AttendanceProgression;
  dragged: IDraggedItem | null;
  handleDragStart: (
    type: AttendanceType,
    index: number,
    status: AttendanceProgression
  ) => void;
  handleDragEnd: () => void;
  onDelete: (attendanceId: number, patientName: string) => void;
  index: number;
  isNextToBeAttended?: boolean;
  isDayFinalized?: boolean;
  groupedPatient?: IGroupedPatient;
  treatmentInfo?: TreatmentInfo;
  onTreatmentInfoClick?: () => void;
}

const AttendanceCard: React.FC<AttendanceCardProps> = React.memo(
  ({
    patient,
    type,
    status,
    dragged,
    handleDragStart,
    handleDragEnd,
    onDelete,
    index,
    isNextToBeAttended = false,
    isDayFinalized = false,
    groupedPatient,
  }) => {
    const isBeingDragged =
      dragged?.patientId === patient.patientId &&
      dragged?.status === status &&
      (dragged?.type === type ||
        (dragged?.isCombinedTreatment &&
          dragged?.treatmentTypes?.includes(type)));

    // Determine styling based on whether this is a grouped patient with combined treatments
    const cardStyles = getTypeBasedStyles(
      groupedPatient ? groupedPatient.combinedType : type
    );

    const countAttendancesByType: () => Record<string, number> = () => {
      if (!groupedPatient) return { lightBath: 0, rod: 0 };

      const typeCounts: Record<string, number> = { lightBath: 0, rod: 0 };

      for (const treatmentType of groupedPatient.treatmentTypes) {
        if (treatmentType === "lightBath") {
          typeCounts.lightBath += 1;
        } else if (treatmentType === "rod") {
          typeCounts.rod += 1;
        }
      }
      return typeCounts;
    };

    return (
      <li
        className={`relative h-24 w-full flex items-center justify-center p-2 rounded-lg
        ${cardStyles}
        bg-white text-center font-medium transition-all select-none
        ${isBeingDragged ? "opacity-60" : ""}
        ${isDayFinalized ? "opacity-50 cursor-not-allowed" : "cursor-move"}`}
        draggable={!isDayFinalized}
        onDragStart={
          isDayFinalized
            ? undefined
            : () => handleDragStart(type, index, status)
        }
        onDragEnd={isDayFinalized ? undefined : handleDragEnd}
      >
        {/* Next to be attended indicator */}
        {isNextToBeAttended && (
          <span className="absolute top-1 right-1 text-red-700 text-xs px-1 py-0.5 rounded z-10 bg-red-100">
            Próximo
          </span>
        )}

        {/* Treatment type attendances amount */}
        {groupedPatient &&
          (() => {
            const typeCounts = countAttendancesByType();
            return (
              <div className="absolute top-1 left-1 text-xs px-1 flex gap-1">
                {typeCounts.lightBath > 0 && (
                  <span className="flex items-center justify-center gap-1 h-5 w-5 bg-yellow-200 text-yellow-800 rounded-4xl ">
                    {typeCounts.lightBath}
                  </span>
                )}
                {typeCounts.rod > 0 && (
                  <span className="flex items-center justify-center gap-1 h-5 w-5 bg-blue-200 text-blue-800 rounded-4xl ">
                    {typeCounts.rod}
                  </span>
                )}
              </div>
            );
          })()}

        {/* Tooltip */}
        <span
          className="line-clamp-2 leading-tight px-2"
          title={getTooltipContent(patient.name, patient.priority)}
        >
          {status === "checkedIn" ? `${index + 1}. ` : ""}
          {patient.name} ({patient.priority})
        </span>

        <AttendanceTimes
          status={status}
          checkedInTime={patient.checkedInTime ?? undefined}
          onGoingTime={patient.onGoingTime ?? undefined}
          completedTime={patient.completedTime ?? undefined}
        />

        {/* Delete button for scheduled items */}
        {status === "scheduled" && patient.attendanceId && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(patient.attendanceId!, patient.name);
            }}
            className="button absolute -top-1 -right-1 text-red-600 hover:text-red-800 text-xs"
            title="Remover"
          >
            ✕
          </button>
        )}
      </li>
    );
  }
);

AttendanceCard.displayName = "AttendanceCard";

export default AttendanceCard;

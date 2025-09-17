import React from "react";
import {
  IAttendanceStatusDetail,
  IAttendanceProgression,
  IAttendanceType,
} from "@/types/globals";
import { IDraggedItem } from "../../types";
import {
  getTypeBasedStyles,
  getTypeIndicatorConfig,
  shouldShowTypeIndicator,
  getTooltipContent,
} from "../../styles/cardStyles";
import AttendanceTimes from "./AttendanceTimes";
import TreatmentSessionProgress from "../../../TreatmentSessionProgress";

interface AttendanceCardProps {
  patient: IAttendanceStatusDetail;
  type: IAttendanceType;
  status: IAttendanceProgression;
  dragged: IDraggedItem | null;
  handleDragStart: (
    type: IAttendanceType,
    index: number,
    status: IAttendanceProgression
  ) => void;
  handleDragEnd: () => void;
  onDelete: (attendanceId: number, patientName: string) => void;
  index: number;
  isNextToBeAttended?: boolean;
  isDayFinalized?: boolean;
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
  }) => {
    const typeConfig = getTypeIndicatorConfig(type);

    const isBeingDragged =
      dragged?.type === type &&
      dragged?.patientId === patient.patientId &&
      dragged?.status === status;

    return (
      <li
        className={`relative h-24 w-full flex items-center justify-center p-2 rounded-lg
        ${getTypeBasedStyles(type)}
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
        {/* Type indicator badge - show for all types when using AttendanceCard */}
        {shouldShowTypeIndicator(type) && (
          <div
            className={`absolute top-1 left-1 rounded px-1 py-0.5 text-xs ${typeConfig.className}`}
          >
            {/* Treatment Session Progress for lightBath and rod types */}
            {(type === "lightBath" || type === "rod") && patient.patientId && (
              <div className="mr-2 inline-block align-middle">
                <TreatmentSessionProgress
                  patientId={patient.patientId}
                  attendanceType={type === "lightBath" ? "light_bath" : "rod"}
                  showDetails={false}
                />
              </div>
            )}
            {typeConfig.label}
          </div>
        )}

        {/* Next to be attended indicator */}
        {isNextToBeAttended && (
          <span className="absolute top-1 right-1 text-red-700 text-xs px-1 py-0.5 rounded z-10 bg-red-100">
            Próximo
          </span>
        )}

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
            className="absolute top-1 right-1 text-red-600 hover:text-red-800 text-xs"
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

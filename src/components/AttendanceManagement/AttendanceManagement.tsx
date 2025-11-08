"use client";

import React from "react";
import { Priority } from "../../types/types";
import { useOpenCancellation } from "@/stores/modalStore";
import { ModalRegistry } from "./components/Modals/ModalRegistry";

import { useAttendanceData } from "./hooks/useAttendanceData";
import { useDragAndDrop } from "./hooks/useDragAndDrop";
import { useAttendanceWorkflow } from "./hooks/useAttendanceWorkflow";
import { useExternalCheckIn } from "./hooks/useExternalCheckIn";
import { useTreatmentIndicators } from "@/hooks/useTreatmentIndicators";
import { useAttendanceManagement } from "@/hooks/useAttendanceManagement";

// Components
import { LoadingState, ErrorState } from "./components/StateComponents";
import { AttendanceHeader } from "./components/AttendanceHeader";
import { AttendanceSections } from "./components/AttendanceSections";
import { TreatmentWorkflowButtons } from "./components/TreatmentWorkflowButtons";

const AttendanceManagement: React.FC<{
  unscheduledCheckIn?: {
    name: string;
    types: string[];
    isNew: boolean;
    priority?: Priority;
  } | null;
  onCheckInProcessed?: () => void;
}> = ({ unscheduledCheckIn, onCheckInProcessed }) => {
  const { loading, error, refreshData } = useAttendanceData();

  const { selectedDate, setSelectedDate } = useAttendanceManagement();

  const { treatmentsByPatient } = useTreatmentIndicators(selectedDate);

  const handleTreatmentInfoClick = (patientId: number) => {
    // TODO: Open detailed treatment information modal for patient ID: ${patientId}
    console.debug(`Treatment info requested for patient ${patientId}`);
  };

  const {
    dragged,
    handleDragStart,
    handleDragEnd,
    handleDropWithConfirm,
    getPatients,
  } = useDragAndDrop();

  // Workflow management hook
  const {
    collapsed,
    isDayFinalized,
    finalizeDay,
    unFinalizeDay,
    toggleCollapsed,
  } = useAttendanceWorkflow();

  // External check-in hook
  useExternalCheckIn({
    unscheduledCheckIn,
    onCheckInProcessed,
  });

  const openCancellation = useOpenCancellation();

  const handleDelete = async (attendanceId: number, patientName: string) => {
    openCancellation(attendanceId, patientName);
  };

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={refreshData} />;
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <AttendanceHeader
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        isDayFinalized={isDayFinalized}
      />

      <AttendanceSections
        collapsed={collapsed}
        getPatients={getPatients}
        dragged={dragged}
        handleDragStart={isDayFinalized ? () => {} : handleDragStart}
        handleDragEnd={isDayFinalized ? () => {} : handleDragEnd}
        handleDropWithConfirm={
          isDayFinalized ? () => {} : handleDropWithConfirm
        }
        onDelete={isDayFinalized ? async () => {} : handleDelete}
        toggleCollapsed={toggleCollapsed}
        isDayFinalized={isDayFinalized}
        treatmentsByPatient={treatmentsByPatient}
        onTreatmentInfoClick={handleTreatmentInfoClick}
      />

      <TreatmentWorkflowButtons
        onUnFinalizeClick={unFinalizeDay}
        onFinalizeClick={finalizeDay}
        isDayFinalized={isDayFinalized}
        selectedDate={selectedDate}
      />

      <ModalRegistry />
    </div>
  );
};

export default AttendanceManagement;

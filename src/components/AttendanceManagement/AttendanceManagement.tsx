"use client";

import React from "react";
import { IPriority, IPatients } from "../../types/globals";
import { useAttendanceData } from "./hooks/useAttendanceData";
import { useDragAndDrop } from "./hooks/useDragAndDrop";
import { useModalManagement } from "./hooks/useModalManagement";
import { useAttendanceWorkflow } from "./hooks/useAttendanceWorkflow";
import { useNewPatientCheckIn } from "./hooks/useNewPatientCheckIn";
import { useTreatmentWorkflow } from "./hooks/useTreatmentWorkflow";
import { useExternalCheckIn } from "./hooks/useExternalCheckIn";
import { useAttendances } from "../../contexts/AttendancesContext";
import {
  getIncompleteAttendances,
  getCompletedAttendances,
  getScheduledAbsences,
} from "./utils/attendanceDataUtils";

// Components
import { LoadingState, ErrorState } from "./components/StateComponents";
import { AttendanceHeader } from "./components/AttendanceHeader";
import { AttendanceSections } from "./components/AttendanceSections";
import { TreatmentWorkflowButtons } from "./components/TreatmentWorkflowButtons";
import { AttendanceModals } from "./components/Modals/AttendanceModals";

const AttendanceManagement: React.FC<{
  unscheduledCheckIn?: {
    name: string;
    types: string[];
    isNew: boolean;
    priority?: IPriority;
  } | null;
  onCheckInProcessed?: () => void;
}> = ({ unscheduledCheckIn, onCheckInProcessed }) => {
  // Data management hook
  const {
    attendancesByDate,
    selectedDate,
    loading,
    error,
    refreshData,
    deleteAttendance,
  } = useAttendanceData();

  // AttendancesContext for additional functionality
  const { setSelectedDate } = useAttendances();

  // New patient check-in hook
  const {
    patientToCheckIn,
    attendanceId,
    openNewPatientCheckIn,
    closeNewPatientCheckIn,
    handleNewPatientSuccess,
  } = useNewPatientCheckIn();

  // Handle new patient detection from drag and drop
  const handleNewPatientDetected = (
    patient: IPatients,
    attendanceId?: number
  ) => {
    // Convert IPatients to IPatient for the check-in form
    const patientForCheckIn = {
      ...patient,
      birthDate: new Date(), // Default value since IPatients doesn't have birthDate
      mainComplaint: "", // Default value since IPatients doesn't have mainComplaint
      startDate: new Date(), // Default value since IPatients doesn't have startDate
      dischargeDate: null, // Default value since IPatients doesn't have dischargeDate
      nextAttendanceDates: [], // Default empty array
      currentRecommendations: {
        // Default recommendations
        date: new Date(),
        food: "",
        water: "",
        ointment: "",
        lightBath: false,
        rod: false,
        spiritualTreatment: false,
        returnWeeks: 0,
      },
      previousAttendances: [], // Default empty array
    };

    console.log(
      "New patient detected for check-in:",
      patientForCheckIn,
      "with attendanceId:",
      attendanceId
    );
    openNewPatientCheckIn(patientForCheckIn, attendanceId);
  };

  // Modal management hook
  const {
    editPatientModalOpen,
    patientToEdit,
    treatmentFormOpen,
    selectedAttendanceForTreatment,
    handleEditPatientCancel,
    handleEditPatientSuccess,
    handleTreatmentFormCancel,
    handleTreatmentFormSubmit,
    openTreatmentFormModal,
  } = useModalManagement({ refreshData });

  // Drag and drop hook
  const {
    dragged,
    confirmOpen,
    multiSectionModalOpen,
    handleDragStart,
    handleDragEnd,
    handleDropWithConfirm,
    handleConfirm,
    handleCancel,
    handleMultiSectionConfirm,
    handleMultiSectionCancel,
    getPatients,
  } = useDragAndDrop({
    onNewPatientDetected: handleNewPatientDetected,
    onTreatmentFormOpen: openTreatmentFormModal,
  });

  // Workflow management hook
  const {
    collapsed,
    isDayFinalized,
    finalizeDay,
    unFinalizeDay,
    toggleCollapsed,
    handleAttendanceCompletion,
    handleAttendanceReschedule,
  } = useAttendanceWorkflow();

  // External check-in hook
  useExternalCheckIn({
    unscheduledCheckIn,
    onCheckInProcessed,
  });

  // Treatment workflow hook (for end of day modal)
  const {
    endOfDayModalOpen,
    handleEndOfDaySubmit,
    openEndOfDayModal,
    closeEndOfDayModal,
  } = useTreatmentWorkflow(refreshData, finalizeDay);

  // Handle delete functionality
  const handleDelete = async (attendanceId: number) => {
    const success = await deleteAttendance(attendanceId);
    if (success) {
      // Refresh the attendance list to reflect the deletion
      refreshData();
    }
  };

  // Show loading state
  if (loading) {
    return <LoadingState />;
  }

  // Show error state
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
      />

      <TreatmentWorkflowButtons
        onEndOfDayClick={openEndOfDayModal}
        onUnFinalizeClick={unFinalizeDay}
        isDayFinalized={isDayFinalized}
      />
      {/* TODO: replace all *Open with an array of isOpen and all modal names inside that array will be opened. Then try to do the same for all on* props in order to reduce the amount of props */}
      <AttendanceModals
        confirmOpen={confirmOpen}
        multiSectionModalOpen={multiSectionModalOpen}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        onMultiSectionConfirm={handleMultiSectionConfirm}
        onMultiSectionCancel={handleMultiSectionCancel}
        editPatientModalOpen={editPatientModalOpen}
        patientToEdit={patientToEdit}
        onEditPatientCancel={handleEditPatientCancel}
        onEditPatientSuccess={handleEditPatientSuccess}
        patientToCheckIn={patientToCheckIn}
        attendanceId={attendanceId}
        onCloseNewPatientCheckIn={closeNewPatientCheckIn}
        onNewPatientSuccess={handleNewPatientSuccess}
        treatmentFormOpen={treatmentFormOpen}
        selectedAttendanceForTreatment={selectedAttendanceForTreatment}
        onTreatmentFormSubmit={handleTreatmentFormSubmit}
        onTreatmentFormCancel={handleTreatmentFormCancel}
        onTreatmentSessionsCreated={(sessionIds) => {
          console.log(
            `✅ Treatment sessions created: ${sessionIds.join(
              ", "
            )} - Refreshing attendance data`
          );
          refreshData();
        }}
        endOfDayModalOpen={endOfDayModalOpen}
        onEndOfDayClose={closeEndOfDayModal}
        onHandleCompletion={handleAttendanceCompletion}
        onReschedule={handleAttendanceReschedule}
        onEndOfDayFinalize={handleEndOfDaySubmit}
        incompleteAttendances={getIncompleteAttendances(attendancesByDate)}
        scheduledAbsences={getScheduledAbsences(attendancesByDate)}
        completedAttendances={getCompletedAttendances(attendancesByDate)}
        selectedDate={selectedDate}
      />
    </div>
  );
};

export default AttendanceManagement;

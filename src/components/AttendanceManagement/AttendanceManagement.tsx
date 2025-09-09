"use client";

import React from "react";
import { IPriority, IPatients } from "../../types/globals";
import { useAttendanceManagement } from "./hooks/useAttendanceManagement";
import { useAttendanceData } from "./hooks/useAttendanceData";
import { useNewPatientCheckIn } from "./components/WalkInForm/useNewPatientCheckIn";
import { useTreatmentWorkflow } from "./hooks/useTreatmentWorkflow";
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
import { AttendanceModals } from "./components/AttendanceModals";

const AttendanceManagement: React.FC<{
  unscheduledCheckIn?: {
    name: string;
    types: string[];
    isNew: boolean;
    priority?: IPriority;
  } | null;
  onCheckInProcessed?: () => void;
}> = ({ unscheduledCheckIn, onCheckInProcessed }) => {
  // New patient check-in hook
  const {
    patientToCheckIn,
    openNewPatientCheckIn,
    closeNewPatientCheckIn,
    handleNewPatientSuccess,
  } = useNewPatientCheckIn();

  // AttendancesContext for data
  const { attendancesByDate } = useAttendances();

  // Handle new patient detection from drag and drop
  const handleNewPatientDetected = (patient: IPatients) => {
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
    openNewPatientCheckIn(patientForCheckIn);
  };

  const {
    // Data
    selectedDate,
    setSelectedDate,
    loading,
    error,

    // State
    dragged,
    confirmOpen,
    multiSectionModalOpen,
    collapsed,
    editPatientModalOpen,
    patientToEdit,
    isDayFinalized,

    // Functions
    getPatients,
    handleDragStart,
    handleDragEnd,
    handleDropWithConfirm,
    handleConfirm,
    handleCancel,
    handleMultiSectionConfirm,
    handleMultiSectionCancel,
    toggleCollapsed,
    refreshCurrentDate,
    handleEditPatientCancel,
    handleEditPatientSuccess,
    handleAttendanceCompletion,
    handleAttendanceReschedule,
    finalizeDay,
    unFinalizeDay,
  } = useAttendanceManagement({
    unscheduledCheckIn,
    onCheckInProcessed,
    onNewPatientDetected: handleNewPatientDetected,
  });

  // Add delete functionality from data hook
  const { deleteAttendance } = useAttendanceData();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDelete = async (attendanceId: number, _patientName: string) => {
    const success = await deleteAttendance(attendanceId);
    if (success) {
      // Refresh the attendance list to reflect the deletion
      refreshCurrentDate();
    }
  };

  // Treatment workflow hook
  const {
    spiritualConsultationOpen,
    endOfDayModalOpen,
    selectedAttendanceForConsultation,
    handleSpiritualConsultationSubmit,
    handleEndOfDaySubmit,
    openEndOfDayModal,
    closeEndOfDayModal,
    closeSpiritualConsultation,
  } = useTreatmentWorkflow(refreshCurrentDate, finalizeDay);

  // Show loading state
  if (loading) {
    return <LoadingState />;
  }

  // Show error state
  if (error) {
    return <ErrorState error={error} onRetry={refreshCurrentDate} />;
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
        onCloseNewPatientCheckIn={closeNewPatientCheckIn}
        onNewPatientSuccess={handleNewPatientSuccess}
        spiritualConsultationOpen={spiritualConsultationOpen}
        selectedAttendanceForConsultation={selectedAttendanceForConsultation}
        onSpiritualConsultationSubmit={handleSpiritualConsultationSubmit}
        onSpiritualConsultationCancel={closeSpiritualConsultation}
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

"use client";

import React, { useState, Suspense, lazy } from "react";
import { IPriority, IPatients, IAttendanceType } from "../../types/globals";
import LoadingFallback from "@/components/common/LoadingFallback";
import { useAttendanceData } from "./hooks/useAttendanceData";
import { useDragAndDrop } from "./hooks/useDragAndDrop";
import { useModalManagement } from "./hooks/useModalManagement";
import { useAttendanceWorkflow } from "./hooks/useAttendanceWorkflow";
import { useNewPatientCheckIn } from "./hooks/useNewPatientCheckIn";
import { useTreatmentWorkflow } from "./hooks/useTreatmentWorkflow";
import { useExternalCheckIn } from "./hooks/useExternalCheckIn";
import { useTreatmentIndicators } from "@/hooks/useTreatmentIndicators";
import { useAttendances } from "../../contexts/AttendancesContext";
import {
  getTreatmentSessionsByPatient,
  updateTreatmentSession,
} from "@/api/treatment-sessions";
import type { TreatmentSessionResponseDto } from "@/api/types";
import {
  getIncompleteAttendances,
  getCompletedAttendances,
  getScheduledAbsences,
} from "./utils/attendanceDataUtils";

// Treatment session type for the modal (matches the interface in PostTreatmentModal)
interface TreatmentSession {
  id: number;
  treatmentType: "light_bath" | "rod";
  bodyLocations: string[];
  startDate: string;
  plannedSessions: number;
  completedSessions: number;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  color?: string;
  durationMinutes?: number;
}

// Transformer function to convert API response to modal interface
const transformTreatmentSession = (
  apiSession: TreatmentSessionResponseDto
): TreatmentSession => {
  // Map API status to modal status
  const statusMap: Record<
    string,
    "scheduled" | "in_progress" | "completed" | "cancelled"
  > = {
    active: "in_progress",
    completed: "completed",
    suspended: "cancelled",
    cancelled: "cancelled",
  };

  const transformed = {
    id: apiSession.id,
    treatmentType: apiSession.treatment_type,
    bodyLocations: [apiSession.body_location], // Convert single body_location to array
    startDate: apiSession.start_date,
    plannedSessions: apiSession.planned_sessions,
    completedSessions: apiSession.completed_sessions,
    status: statusMap[apiSession.status] || "scheduled",
    color: apiSession.color,
    durationMinutes: apiSession.duration_minutes,
  };

  return transformed;
};

// Components
import { LoadingState, ErrorState } from "./components/StateComponents";
import { AttendanceHeader } from "./components/AttendanceHeader";
import { AttendanceSections } from "./components/AttendanceSections";
import { TreatmentWorkflowButtons } from "./components/TreatmentWorkflowButtons";

// Lazy load heavy modal components
const AttendanceModals = lazy(() =>
  import("./components/Modals/AttendanceModals").then((module) => ({
    default: module.AttendanceModals,
  }))
);
const PostTreatmentModal = lazy(
  () => import("./components/Modals/PostTreatmentModal")
);

const AttendanceManagement: React.FC<{
  unscheduledCheckIn?: {
    name: string;
    types: string[];
    isNew: boolean;
    priority?: IPriority;
  } | null;
  onCheckInProcessed?: () => void;
}> = ({ unscheduledCheckIn, onCheckInProcessed }) => {
  // Treatment completion modal state
  const [treatmentCompletionModal, setPostTreatmentModal] = useState<{
    open: boolean;
    attendanceId?: number;
    patientId?: number;
    patientName?: string;
    attendanceType?: IAttendanceType;
    onComplete?: (success: boolean) => void;
  }>({
    open: false,
  });

  // Treatment sessions state for the modal
  const [treatmentSessions, setTreatmentSessions] = useState<
    TreatmentSession[]
  >([]);
  const [loadingTreatmentSessions, setLoadingTreatmentSessions] =
    useState(false);

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

  // Treatment indicators hook
  const { treatmentsByPatient } = useTreatmentIndicators(selectedDate);

  // Handle treatment info click - placeholder for future treatment modal
  const handleTreatmentInfoClick = (patientId: number) => {
    // TODO: Open detailed treatment information modal for patient ID: ${patientId}
    console.debug(`Treatment info requested for patient ${patientId}`);
  };

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

    openNewPatientCheckIn(patientForCheckIn, attendanceId);
  };

  // Handle treatment completion modal
  const handleTreatmentCompletionOpen = async (attendanceDetails: {
    attendanceId: number;
    patientId: number;
    patientName: string;
    attendanceType: IAttendanceType;
    onComplete: (success: boolean) => void;
  }) => {
    setPostTreatmentModal({
      open: true,
      ...attendanceDetails,
    });

    // Fetch treatment sessions for this patient
    setLoadingTreatmentSessions(true);
    try {
      const result = await getTreatmentSessionsByPatient(
        attendanceDetails.patientId.toString()
      );
      if (result.success && result.value) {
        // Transform API sessions to modal format
        const transformedSessions = result.value.map(transformTreatmentSession);
        setTreatmentSessions(transformedSessions);
      } else {
        console.error("Failed to fetch treatment sessions:", result.error);
        setTreatmentSessions([]);
      }
    } catch (error) {
      console.error("Error fetching treatment sessions:", error);
      setTreatmentSessions([]);
    } finally {
      setLoadingTreatmentSessions(false);
    }
  };

  const handleTreatmentCompletionClose = () => {
    setPostTreatmentModal({
      open: false,
    });
    setTreatmentSessions([]);
  };

  const handleTreatmentCompletionSubmit = async (
    completedLocations: Record<number, string[]>,
    notes: string
  ) => {
    if (!treatmentCompletionModal.patientId) {
      console.error("No patient ID available for treatment completion");
      treatmentCompletionModal.onComplete?.(false);
      return;
    }

    try {
      // Complete each treatment session that has completed locations
      const completionPromises = Object.entries(completedLocations).map(
        async ([sessionIdStr, locations]) => {
          const sessionId = parseInt(sessionIdStr);

          if (locations.length === 0) {
            return { success: true, sessionId }; // Skip sessions with no completed locations
          }

          // Find the session to get more details if needed
          const session = treatmentSessions.find((s) => s.id === sessionId);
          if (!session) {
            console.warn(`Session ${sessionId} not found`);
            return { success: false, sessionId, error: "Session not found" };
          }

          // Increment the completed sessions count
          const updateData = {
            completed_sessions: session.completedSessions + 1,
            notes: notes || undefined,
          };

          // Call the API to update the treatment session
          const result = await updateTreatmentSession(
            sessionId.toString(),
            updateData
          );

          if (result.success) {
            console.log(
              `Successfully completed session ${sessionId}:`,
              result.value
            );
            return { success: true, sessionId, data: result.value };
          } else {
            console.error(
              `Failed to complete session ${sessionId}:`,
              result.error
            );
            return { success: false, sessionId, error: result.error };
          }
        }
      );

      // Wait for all completion requests to finish
      const results = await Promise.all(completionPromises);

      // Check if all completions were successful
      const failedCompletions = results.filter((r) => !r.success);

      if (failedCompletions.length > 0) {
        console.error("Some treatment completions failed:", failedCompletions);
        // Still call onComplete(true) if at least some sessions were completed successfully
        const successCount = results.filter((r) => r.success).length;
        if (successCount > 0) {
          console.log(
            `${successCount} treatment sessions completed successfully`
          );
          treatmentCompletionModal.onComplete?.(true);
        } else {
          treatmentCompletionModal.onComplete?.(false);
        }
      } else {
        console.log("All treatment sessions completed successfully");
        treatmentCompletionModal.onComplete?.(true);
      }
    } catch (error) {
      console.error("Error completing treatment sessions:", error);
      treatmentCompletionModal.onComplete?.(false);
    } finally {
      handleTreatmentCompletionClose();
      // Refresh data to reflect changes
      refreshData();
    }
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
    onTreatmentCompletionOpen: handleTreatmentCompletionOpen,
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
        treatmentsByPatient={treatmentsByPatient}
        onTreatmentInfoClick={handleTreatmentInfoClick}
      />

      <TreatmentWorkflowButtons
        onEndOfDayClick={openEndOfDayModal}
        onUnFinalizeClick={unFinalizeDay}
        isDayFinalized={isDayFinalized}
      />
      {/* TODO: replace all *Open with an array of isOpen and all modal names inside that array will be opened. Then try to do the same for all on* props in order to reduce the amount of props */}
      <Suspense
        fallback={
          <LoadingFallback message="Carregando modais..." size="small" />
        }
      >
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
      </Suspense>

      {/* Treatment Completion Modal */}
      {treatmentCompletionModal.open && treatmentCompletionModal.patientId && (
        <Suspense
          fallback={
            <LoadingFallback
              message="Carregando modal de tratamento..."
              size="small"
            />
          }
        >
          <PostTreatmentModal
            isOpen={treatmentCompletionModal.open}
            onClose={handleTreatmentCompletionClose}
            onComplete={handleTreatmentCompletionSubmit}
            patientId={treatmentCompletionModal.patientId}
            patientName={treatmentCompletionModal.patientName!}
            treatmentInfo={
              treatmentsByPatient.get(treatmentCompletionModal.patientId) || {
                hasLightBath: false,
                hasRod: false,
                bodyLocations: [],
                treatmentType: "none",
              }
            }
            treatmentSessions={treatmentSessions}
            isLoadingSessions={loadingTreatmentSessions}
          />
        </Suspense>
      )}
    </div>
  );
};

export default AttendanceManagement;

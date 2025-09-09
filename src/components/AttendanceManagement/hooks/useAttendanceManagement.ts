import { useEffect, useState } from "react";
import { useAttendances } from "@/contexts/AttendancesContext";
import { usePatients } from "@/contexts/PatientsContext";
import {
  IAttendanceProgression,
  IAttendanceType,
  IPriority,
  IAttendanceStatusDetail,
  IPatients,
} from "@/types/globals";
import { sortPatientsByPriority } from "@/utils/businessRules";
import { updateAttendanceStatus } from "@/api/attendanceSync";
import { getIncompleteAttendances } from "../utils/attendanceDataUtils";
import { IDraggedItem } from "../types";

interface ExternalCheckIn {
  name: string;
  types: string[];
  isNew: boolean;
  priority?: IPriority;
}

interface UseAttendanceListProps {
  unscheduledCheckIn?: ExternalCheckIn | null;
  onCheckInProcessed?: () => void;
  onNewPatientDetected?: (patient: IPatients) => void;
}

export const useAttendanceManagement = ({
  unscheduledCheckIn,
  onCheckInProcessed,
  onNewPatientDetected,
}: UseAttendanceListProps = {}) => {
  const { patients } = usePatients();
  const {
    selectedDate,
    setSelectedDate,
    attendancesByDate,
    setAttendancesByDate,
    loading,
    error,
    refreshCurrentDate,
  } = useAttendances();

  // Local state for drag and drop functionality
  const [dragged, setDragged] = useState<IDraggedItem | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDrop, setPendingDrop] = useState<{
    toType: IAttendanceType;
    toStatus: IAttendanceProgression;
  } | null>(null);
  const [multiSectionModalOpen, setMultiSectionModalOpen] = useState(false);
  const [multiSectionPending, setMultiSectionPending] = useState<{
    patientId: number;
    fromStatus: IAttendanceProgression;
    toStatus: IAttendanceProgression;
    draggedType: IAttendanceType;
  } | null>(null);
  
  // Patient edit modal state
  const [editPatientModalOpen, setEditPatientModalOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<{ id: string; name: string } | null>(null);
  const [checkInProcessed, setCheckInProcessed] = useState(false);
  const [collapsed, setCollapsed] = useState<{
    [key in IAttendanceType]: boolean;
  }>({ spiritual: false, lightBath: false, rod: false });

  // Day finalization state
  const [isDayFinalized, setIsDayFinalized] = useState(false);

  // Load finalization state from localStorage when date changes
  useEffect(() => {
    if (selectedDate) {
      const key = `day-finalized-${selectedDate}`;
      const stored = localStorage.getItem(key);
      setIsDayFinalized(stored === 'true');
    }
  }, [selectedDate]);

  // Save finalization state to localStorage when it changes
  useEffect(() => {
    if (selectedDate) {
      const key = `day-finalized-${selectedDate}`;
      localStorage.setItem(key, isDayFinalized.toString());
    }
  }, [isDayFinalized, selectedDate]);

  // Function to finalize the day
  const finalizeDay = () => {
    setIsDayFinalized(true);
  };

  // Function to unfinalize the day (undo finalization)
  const unFinalizeDay = () => {
    setIsDayFinalized(false);
  };

  // Reset processed flag when unscheduledCheckIn changes
  useEffect(() => {
    if (unscheduledCheckIn) {
      setCheckInProcessed(false);
    }
  }, [unscheduledCheckIn]);

  // Inject unscheduledCheckIn into checkedIn columns if present
  useEffect(() => {
    if (
      unscheduledCheckIn &&
      attendancesByDate &&
      Array.isArray(unscheduledCheckIn.types) &&
      unscheduledCheckIn.types.length > 0 &&
      !checkInProcessed // Prevent re-processing
    ) {
      unscheduledCheckIn.types.forEach((type) => {
        if (
          attendancesByDate[type as IAttendanceType] &&
          !attendancesByDate[type as IAttendanceType].checkedIn.some(
            (p) => p.name === unscheduledCheckIn.name
          )
        ) {
          attendancesByDate[type as IAttendanceType].checkedIn.push({
            name: unscheduledCheckIn.name,
            priority: unscheduledCheckIn.priority || "3",
            checkedInTime: new Date(),
          });
        }
      });
      setCheckInProcessed(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unscheduledCheckIn, checkInProcessed]); // attendancesByDate intentionally excluded to prevent infinite loop

  // Helper function to find patient by ID
  const findPatient = (type: IAttendanceType, status: IAttendanceProgression, patientId: number): IAttendanceStatusDetail | undefined => {
    return attendancesByDate?.[type]?.[status]?.find(p => p.patientId === patientId);
  };

  // Helper function to update patient timestamps
  const updatePatientTimestamps = (patient: IAttendanceStatusDetail, status: IAttendanceProgression): IAttendanceStatusDetail => {
    const updates: Partial<IAttendanceStatusDetail> = {};
    if (status === "checkedIn") updates.checkedInTime = new Date();
    if (status === "onGoing") updates.onGoingTime = new Date();
    if (status === "completed") {
      updates.completedTime = new Date();
      // Trigger patient edit modal when attendance is completed
      // Find the patient in the patients list to get their ID
      const fullPatient = patients.find(p => p.name === patient.name);
      if (fullPatient) {
        setPatientToEdit({ id: fullPatient.id.toString(), name: patient.name });
        setEditPatientModalOpen(true);
      }
    }
    return { ...patient, ...updates };
  };

  // Get patients for a specific type and status
  const getPatients = (
    type: IAttendanceType,
    status: IAttendanceProgression
  ): IAttendanceStatusDetail[] => {
    if (!attendancesByDate) return [];
    
    const patients = attendancesByDate[type][status] || [];
    
    // Sort checkedIn patients by priority using business rules
    if (status === "checkedIn") {
      return sortPatientsByPriority(patients) as IAttendanceStatusDetail[];
    }
    
    return patients;
  };

  // Drag and drop handlers
  const handleDragStart = (
    type: IAttendanceType,
    idx: number,
    status: IAttendanceProgression,
    patientId?: number
  ) => {
    let patient;
    
    if (patientId) {
      patient = findPatient(type, status, patientId);
    } else {
      // Fallback to index-based lookup
      const patients = getPatients(type, status);
      patient = patients[idx];
    }
    
    if (!patient?.patientId) {
      console.error('Patient not found at index', idx, 'or patientId', patientId, 'or patient missing patientId');
      return;
    }
    setDragged({ type, status, idx, patientId: patient.patientId });
  };

  const handleDragEnd = () => {
    setDragged(null);
  };

  const handleDropWithConfirm = (
    toType: IAttendanceType,
    toStatus: IAttendanceProgression
  ) => {
    if (!dragged || !attendancesByDate) return;

    // Find patient by ID using helper function
    const patient = findPatient(dragged.type, dragged.status, dragged.patientId);
    if (!patient) return; // Patient not found

    // Prevent moves between different consultation types
    if (dragged.type !== toType) {
      setDragged(null);
      return;
    }

    // Check if this is a new patient (status 'N') being moved to 'checkedIn'
    if (toStatus === "checkedIn") {
      const patientData = patients.find(p => p.id === patient.patientId?.toString());
      if (patientData?.status === "N") {
        // This is a new patient - trigger new patient check-in modal
        onNewPatientDetected?.(patientData);
        setDragged(null);
        return;
      }
    }

    // Check if patient is scheduled in both consultation types
    const isInBothTypes = findPatient("spiritual", "scheduled", dragged.patientId) && 
                         findPatient("lightBath", "scheduled", dragged.patientId);

    // If patient is in both types and we're moving from scheduled to checkedIn, show multi-section modal
    if (isInBothTypes && dragged.status === "scheduled" && toStatus === "checkedIn") {
      setMultiSectionPending({
        patientId: dragged.patientId,
        fromStatus: dragged.status,
        toStatus: toStatus,
        draggedType: dragged.type,
      });
      setMultiSectionModalOpen(true);
      
      return;
    }

    // For same type moves (not involving multi-type scenarios), perform move directly
    if (dragged.type === toType && dragged.status !== toStatus) {
      performMove(toType, toStatus); // Note: not awaiting here to keep UI responsive
      setDragged(null);
      return;
    }

    // Same type and same status - no action needed
    setDragged(null);
  };

  // Helper function for performing the actual move
  const performMove = async (toType: IAttendanceType, toStatus: IAttendanceProgression) => {
    if (!dragged || !attendancesByDate || !setAttendancesByDate) return;

    // Find patient using helper function
    const patient = findPatient(dragged.type, dragged.status, dragged.patientId);
    if (!patient) return; // Patient not found

    // Sync with backend if attendanceId is available
    if (patient.attendanceId) {
      const result = await updateAttendanceStatus(patient.attendanceId, toStatus);
      if (!result.success) {
        console.warn('Backend sync failed, continuing with local update');
      }
    }

    // Create immutable update by spreading arrays
    let newAttendancesByDate = { ...attendancesByDate };
    
    // Update source type (remove patient)
    newAttendancesByDate = {
      ...newAttendancesByDate,
      [dragged.type]: {
        ...newAttendancesByDate[dragged.type],
        [dragged.status]: newAttendancesByDate[dragged.type][dragged.status].filter(p => p.patientId !== dragged.patientId)
      }
    };
    
    // Update destination type (add patient)
    newAttendancesByDate = {
      ...newAttendancesByDate,
      [toType]: {
        ...newAttendancesByDate[toType],
        [toStatus]: [
          ...newAttendancesByDate[toType][toStatus],
          updatePatientTimestamps(patient, toStatus)
        ]
      }
    };

    // Update state with new object
    setAttendancesByDate(newAttendancesByDate);
  };

  const handleConfirm = async () => {
    if (!dragged || !pendingDrop) return;

    // Use the helper function to perform the move
    await performMove(pendingDrop.toType, pendingDrop.toStatus);

    // Reset state
    setConfirmOpen(false);
    setPendingDrop(null);
    setDragged(null);

    // Note: Not calling refreshCurrentDate() to avoid overwriting our changes
    // Backend sync is handled in performMove()
  };

  const handleCancel = () => {
    setConfirmOpen(false);
    setPendingDrop(null);
    setDragged(null);
  };

  const handleMultiSectionConfirm = async () => {
    if (!multiSectionPending || !attendancesByDate || !setAttendancesByDate) return;

    // Find patient using helper function
    const patient = findPatient(multiSectionPending.draggedType, multiSectionPending.fromStatus, multiSectionPending.patientId);
    if (!patient) return; // Patient not found

    // Sync with backend for all types if attendanceIds are available
    const syncPromises = (["spiritual", "lightBath", "rod"] as IAttendanceType[])
      .map(type => findPatient(type, "scheduled", multiSectionPending.patientId))
      .filter(p => p?.attendanceId)
      .map(p => updateAttendanceStatus(p!.attendanceId!, "checkedIn"));

    // Wait for all backend syncs to complete
    if (syncPromises.length > 0) {
      try {
        await Promise.all(syncPromises);
      } catch {
        console.warn('Some backend syncs failed, continuing with local update');
      }
    }

    // Create immutable update for all consultation types
    let newAttendancesByDate = { ...attendancesByDate };
    
    (["spiritual", "lightBath", "rod"] as IAttendanceType[]).forEach((type) => {
      const patientToMove = findPatient(type, "scheduled", multiSectionPending.patientId);
      
      if (patientToMove) {
        newAttendancesByDate = {
          ...newAttendancesByDate,
          [type]: {
            ...newAttendancesByDate[type],
            scheduled: newAttendancesByDate[type].scheduled.filter(p => p.patientId !== multiSectionPending.patientId),
            checkedIn: [
              ...newAttendancesByDate[type].checkedIn,
              updatePatientTimestamps(patientToMove, "checkedIn")
            ]
          }
        };
      }
    });

    // Update state with new object
    setAttendancesByDate(newAttendancesByDate);

    // Reset state
    setMultiSectionModalOpen(false);
    setMultiSectionPending(null);
    setDragged(null);
  };

  const handleMultiSectionCancel = async () => {
    if (!multiSectionPending || !attendancesByDate || !setAttendancesByDate) return;

    // Find patient using helper function
    const patient = findPatient(multiSectionPending.draggedType, multiSectionPending.fromStatus, multiSectionPending.patientId);
    if (!patient) return;

    // Sync with backend if attendanceId is available
    if (patient.attendanceId) {
      const result = await updateAttendanceStatus(patient.attendanceId, multiSectionPending.toStatus);
      if (!result.success) {
        console.warn('Backend sync failed, continuing with local update');
      }
    }

    // Create immutable update (move only in the dragged type)
    const newAttendancesByDate = {
      ...attendancesByDate,
      [multiSectionPending.draggedType]: {
        ...attendancesByDate[multiSectionPending.draggedType],
        [multiSectionPending.fromStatus]: attendancesByDate[multiSectionPending.draggedType][multiSectionPending.fromStatus].filter(p => p.patientId !== multiSectionPending.patientId),
        [multiSectionPending.toStatus]: [
          ...attendancesByDate[multiSectionPending.draggedType][multiSectionPending.toStatus],
          updatePatientTimestamps(patient, multiSectionPending.toStatus)
        ]
      }
    };

    // Update state with new object
    setAttendancesByDate(newAttendancesByDate);

    // Reset state
    setMultiSectionModalOpen(false);
    setMultiSectionPending(null);
    setDragged(null);
  };

  const toggleCollapsed = (type: IAttendanceType) => {
    setCollapsed((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  // Patient edit modal handlers
  const handleEditPatientCancel = () => {
    setEditPatientModalOpen(false);
    setPatientToEdit(null);
  };

  const handleEditPatientSuccess = () => {
    setEditPatientModalOpen(false);
    setPatientToEdit(null);
    // Refresh current date to show updated data
    refreshCurrentDate();
  };

  const handleAttendanceCompletion = async (attendanceId: number) => {
    if (!attendancesByDate) {
      console.error("No attendance data available");
      return;
    }

    // Find the attendance in incomplete attendances
    const incompleteAttendances = getIncompleteAttendances(attendancesByDate);
    const attendance = incompleteAttendances.find(att => att.attendanceId === attendanceId);
    
    if (!attendance) {
      console.error("Attendance not found:", attendanceId);
      return;
    }

    // Use the existing updateAttendanceStatus function
    try {
      await updateAttendanceStatus(attendanceId, "completed");
      // Refresh the data to show the updated status
      refreshCurrentDate();
    } catch (error) {
      console.error("Error completing attendance:", error);
      throw error;
    }
  };

  const handleAttendanceReschedule = async (attendanceId: number) => {
    if (!attendancesByDate) {
      console.error("No attendance data available");
      return;
    }

    // Find the attendance in incomplete attendances
    const incompleteAttendances = getIncompleteAttendances(attendancesByDate);
    const attendance = incompleteAttendances.find(att => att.attendanceId === attendanceId);
    
    if (!attendance) {
      console.error("Attendance not found:", attendanceId);
      return;
    }

    // Use the existing updateAttendanceStatus function to move back to scheduled
    try {
      await updateAttendanceStatus(attendanceId, "scheduled");
      // Refresh the data to show the updated status
      refreshCurrentDate();
    } catch (error) {
      console.error("Error rescheduling attendance:", error);
      throw error;
    }
  };

  // Call the callback only once when processing is complete
  useEffect(() => {
    if (checkInProcessed && onCheckInProcessed) {
      onCheckInProcessed();
      // Don't reset checkInProcessed here to avoid infinite loop
    }
  }, [checkInProcessed, onCheckInProcessed]);

  return {
    // Data
    selectedDate,
    setSelectedDate,
    attendancesByDate,
    loading,
    error,
    
    // State
    dragged,
    confirmOpen,
    pendingDrop,
    multiSectionModalOpen,
    multiSectionPending,
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
  };
};

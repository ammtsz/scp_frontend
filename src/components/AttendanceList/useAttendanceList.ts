import { useEffect, useState } from "react";
import { useAttendances } from "@/contexts/AttendancesContext";
import {
  IAttendanceProgression,
  IAttendanceType,
  IPriority,
  IAttendanceStatusDetail,
} from "@/types/globals";
import { sortPatientsByPriority } from "@/utils/businessRules";
import { IDraggedItem } from "./types";

interface ExternalCheckIn {
  name: string;
  types: string[];
  isNew: boolean;
  priority?: IPriority;
}

interface UseAttendanceListProps {
  externalCheckIn?: ExternalCheckIn | null;
  onCheckInProcessed?: () => void;
}

export const useAttendanceList = ({
  externalCheckIn,
  onCheckInProcessed,
}: UseAttendanceListProps = {}) => {
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
    name: string;
    fromStatus: IAttendanceProgression;
    toStatus: IAttendanceProgression;
  } | null>(null);
  const [checkInProcessed, setCheckInProcessed] = useState(false);
  const [collapsed, setCollapsed] = useState<{
    [key in IAttendanceType]: boolean;
  }>({ spiritual: false, lightBath: false });

  // Reset processed flag when externalCheckIn changes
  useEffect(() => {
    if (externalCheckIn) {
      setCheckInProcessed(false);
    }
  }, [externalCheckIn]);

  // Inject externalCheckIn into checkedIn columns if present
  useEffect(() => {
    if (
      externalCheckIn &&
      attendancesByDate &&
      Array.isArray(externalCheckIn.types) &&
      externalCheckIn.types.length > 0 &&
      !checkInProcessed // Prevent re-processing
    ) {
      externalCheckIn.types.forEach((type) => {
        if (
          attendancesByDate[type as IAttendanceType] &&
          !attendancesByDate[type as IAttendanceType].checkedIn.some(
            (p) => p.name === externalCheckIn.name
          )
        ) {
          attendancesByDate[type as IAttendanceType].checkedIn.push({
            name: externalCheckIn.name,
            priority: externalCheckIn.priority || "3",
            checkedInTime: new Date(),
          });
        }
      });
      setCheckInProcessed(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [externalCheckIn, checkInProcessed]); // attendancesByDate intentionally excluded to prevent infinite loop

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
    status: IAttendanceProgression
  ) => {
    const patients = getPatients(type, status);
    const patient = patients[idx];
    setDragged({ type, status, idx, name: patient.name });
  };

  const handleDragEnd = () => {
    setDragged(null);
  };

  const handleDropWithConfirm = (
    toType: IAttendanceType,
    toStatus: IAttendanceProgression
  ) => {
    if (!dragged || !attendancesByDate) return;

    // Find patient by name in the original data structure
    const sourceArray = attendancesByDate[dragged.type][dragged.status];
    const patient = sourceArray.find(p => p.name === dragged.name);
    
    if (!patient) return; // Patient not found

    // Prevent moves between different consultation types
    if (dragged.type !== toType) {
      setDragged(null);
      return;
    }

    // Check if patient is scheduled in both consultation types
    const isInBothTypes = attendancesByDate.spiritual.scheduled.some(p => p.name === patient.name) &&
                         attendancesByDate.lightBath.scheduled.some(p => p.name === patient.name);

    // If patient is in both types and we're moving from scheduled to checkedIn, show multi-section modal
    if (isInBothTypes && dragged.status === "scheduled" && toStatus === "checkedIn") {
      setMultiSectionPending({
        name: patient.name,
        fromStatus: dragged.status,
        toStatus: toStatus,
      });
      setMultiSectionModalOpen(true);
      return;
    }

    // For same type moves (not involving multi-type scenarios), perform move directly
    if (dragged.type === toType && dragged.status !== toStatus) {
      performMove(toType, toStatus);
      setDragged(null);
      return;
    }

    // Same type and same status - no action needed
    setDragged(null);
  };

  // Helper function for performing the actual move
  const performMove = (toType: IAttendanceType, toStatus: IAttendanceProgression) => {
    if (!dragged || !attendancesByDate || !setAttendancesByDate) return;

    // Create a deep copy of attendancesByDate to avoid mutation
    const newAttendancesByDate = JSON.parse(JSON.stringify(attendancesByDate));

    // Find and remove patient from source by name (handles sorted lists correctly)
    const sourceArray = newAttendancesByDate[dragged.type][dragged.status];
    const patientIndex = sourceArray.findIndex((p: IAttendanceStatusDetail) => p.name === dragged.name);
    
    if (patientIndex === -1) return; // Patient not found
    
    const patient = sourceArray[patientIndex];
    sourceArray.splice(patientIndex, 1);

    // Add to destination with updated times
    const updatedPatient = { ...patient };
    if (toStatus === "checkedIn") {
      updatedPatient.checkedInTime = new Date();
    } else if (toStatus === "onGoing") {
      updatedPatient.onGoingTime = new Date();
    } else if (toStatus === "completed") {
      updatedPatient.completedTime = new Date();
    }

    newAttendancesByDate[toType][toStatus].push(updatedPatient);

    // Update state with new object
    setAttendancesByDate(newAttendancesByDate);
  };

  const handleConfirm = () => {
    if (!dragged || !pendingDrop) return;

    // Use the helper function to perform the move
    performMove(pendingDrop.toType, pendingDrop.toStatus);

    // Reset state
    setConfirmOpen(false);
    setPendingDrop(null);
    setDragged(null);

    // Note: Not calling refreshCurrentDate() to avoid overwriting our changes
    // TODO: In the future, we should update the backend and then refresh
  };

  const handleCancel = () => {
    setConfirmOpen(false);
    setPendingDrop(null);
    setDragged(null);
  };

  const handleMultiSectionConfirm = () => {
    if (!dragged || !multiSectionPending || !attendancesByDate || !setAttendancesByDate) return;

    // Find patient by name in the source array
    const sourceArray = attendancesByDate[dragged.type][dragged.status];
    const patient = sourceArray.find(p => p.name === dragged.name);
    
    if (!patient) return; // Patient not found

    // Create a deep copy of attendancesByDate to avoid mutation
    const newAttendancesByDate = JSON.parse(JSON.stringify(attendancesByDate));

    // Move patient in both consultation types
    ["spiritual", "lightBath"].forEach((type) => {
      const typeKey = type as IAttendanceType;
      // Find and remove patient from scheduled in this type
      const scheduledIndex = newAttendancesByDate[typeKey].scheduled.findIndex(
        (p: IAttendanceStatusDetail) => p.name === patient.name
      );
      if (scheduledIndex !== -1) {
        const patientToMove = newAttendancesByDate[typeKey].scheduled[scheduledIndex];
        newAttendancesByDate[typeKey].scheduled.splice(scheduledIndex, 1);

        // Add to checkedIn with updated time
        const updatedPatient = { ...patientToMove };
        updatedPatient.checkedInTime = new Date();
        newAttendancesByDate[typeKey].checkedIn.push(updatedPatient);
      }
    });

    // Update state with new object
    setAttendancesByDate(newAttendancesByDate);

    // Reset state
    setMultiSectionModalOpen(false);
    setMultiSectionPending(null);
    setDragged(null);
  };

  const handleMultiSectionCancel = () => {
    if (!dragged || !multiSectionPending) return;

    // Move only in the current type (the one being dragged)
    performMove(dragged.type, multiSectionPending.toStatus);

    // Reset state
    setMultiSectionModalOpen(false);
    setMultiSectionPending(null);
    setDragged(null);
  };

  const toggleCollapsed = (type: IAttendanceType) => {
    setCollapsed((prev) => ({ ...prev, [type]: !prev[type] }));
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
  };
};

import { useEffect, useState } from "react";
import { useAttendances } from "@/contexts/AttendancesContext";
import {
  IAttendanceProgression,
  IAttendanceType,
  IPriority,
  IAttendanceStatusDetail,
} from "@/types/globals";
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
    return attendancesByDate[type][status] || [];
  };

  // Drag and drop handlers
  const handleDragStart = (
    type: IAttendanceType,
    idx: number,
    status: IAttendanceProgression
  ) => {
    setDragged({ type, status, idx });
  };

  const handleDragEnd = () => {
    setDragged(null);
  };

  const handleDropWithConfirm = (
    toType: IAttendanceType,
    toStatus: IAttendanceProgression
  ) => {
    if (!dragged || !attendancesByDate) return;

    const fromPatients = getPatients(dragged.type, dragged.status);
    if (dragged.idx >= fromPatients.length) return;

    const patient = fromPatients[dragged.idx];

    // Check if moving between different sections of the same type
    if (dragged.type === toType && dragged.status !== toStatus) {
      setMultiSectionPending({
        name: patient.name,
        fromStatus: dragged.status,
        toStatus: toStatus,
      });
      setMultiSectionModalOpen(true);
      return;
    }

    // For moves between different types, show confirmation
    setPendingDrop({ toType, toStatus });
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    if (!dragged || !pendingDrop || !attendancesByDate) return;

    const fromPatients = getPatients(dragged.type, dragged.status);
    const patient = fromPatients[dragged.idx];

    // Remove from source
    fromPatients.splice(dragged.idx, 1);

    // Add to destination with updated times
    const updatedPatient = { ...patient };
    if (pendingDrop.toStatus === "checkedIn") {
      updatedPatient.checkedInTime = new Date();
    } else if (pendingDrop.toStatus === "onGoing") {
      updatedPatient.onGoingTime = new Date();
    } else if (pendingDrop.toStatus === "completed") {
      updatedPatient.completedTime = new Date();
    }

    attendancesByDate[pendingDrop.toType][pendingDrop.toStatus].push(
      updatedPatient
    );

    // Reset state
    setConfirmOpen(false);
    setPendingDrop(null);
    setDragged(null);

    // Refresh to sync with backend
    refreshCurrentDate();
  };

  const handleCancel = () => {
    setConfirmOpen(false);
    setPendingDrop(null);
    setDragged(null);
  };

  const handleMultiSectionConfirm = () => {
    if (!dragged || !multiSectionPending || !attendancesByDate) return;

    const fromPatients = getPatients(dragged.type, dragged.status);
    const patient = fromPatients[dragged.idx];

    // Remove from source
    fromPatients.splice(dragged.idx, 1);

    // Add to destination with updated times
    const updatedPatient = { ...patient };
    if (multiSectionPending.toStatus === "checkedIn") {
      updatedPatient.checkedInTime = new Date();
    } else if (multiSectionPending.toStatus === "onGoing") {
      updatedPatient.onGoingTime = new Date();
    } else if (multiSectionPending.toStatus === "completed") {
      updatedPatient.completedTime = new Date();
    }

    attendancesByDate[dragged.type][multiSectionPending.toStatus].push(
      updatedPatient
    );

    // Reset state
    setMultiSectionModalOpen(false);
    setMultiSectionPending(null);
    setDragged(null);

    // Refresh to sync with backend
    refreshCurrentDate();
  };

  const handleMultiSectionCancel = () => {
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

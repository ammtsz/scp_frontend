import { useAttendances } from "@/contexts/AttendancesContext";
import { useState, useEffect } from "react";
import { IAttendanceType, IAttendanceProgression, IAttendanceStatusDetail, IPriority } from "@/types/globals";

export interface IDraggedItem {
    type: IAttendanceType;
    status: IAttendanceProgression;
    idx: number;
  }
  
export function useAttendanceList(externalCheckIn?: { name: string; types: string[]; isNew: boolean; priority?: IPriority } | null, onCheckInProcessed?: () => void) {
  const { attendances } = useAttendances();

  // Find the closest attendance date
  const getClosestDate = () => {
    if (!attendances.length) return "";
    const today = new Date();
    let closest = attendances[0].date;
    let minDiff = Math.abs(today.getTime() - closest.getTime());
    for (const att of attendances) {
      const diff = Math.abs(today.getTime() - att.date.getTime());
      if (diff < minDiff) {
        closest = att.date;
        minDiff = diff;
      }
    }
    return closest.toISOString().slice(0, 10);
  };

  const [selectedDate, setSelectedDate] = useState<string>(getClosestDate());
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

  // Find attendance for selected date
  const attendanceByDate = attendances.find(
    (a) => a.date.toISOString().slice(0, 10) === selectedDate
  );

  // Inject externalCheckIn into checkedIn columns if present
  useEffect(() => {
    if (
      externalCheckIn &&
      attendanceByDate &&
      Array.isArray(externalCheckIn.types) &&
      externalCheckIn.types.length > 0
    ) {
      externalCheckIn.types.forEach((type) => {
        if (
          attendanceByDate[type as IAttendanceType] &&
          !attendanceByDate[type as IAttendanceType].checkedIn.some(
            (p) => p.name === externalCheckIn.name
          )
        ) {
          attendanceByDate[type as IAttendanceType].checkedIn.push({
            name: externalCheckIn.name,
            priority: externalCheckIn.priority || "3",
            checkedInTime: new Date(),
          });
        }
      });
      setCheckInProcessed(true);
      if (onCheckInProcessed) onCheckInProcessed();
    }
  }, [externalCheckIn, attendanceByDate, onCheckInProcessed]);

  // Helper to get patients for a status and type
  const getPatients = (type: IAttendanceType, status: IAttendanceProgression) => {
    if (!attendanceByDate) return [];
    const patients = attendanceByDate[type][status] || [];
    if (status === "checkedIn") {
      // Sort by priority then check-in time
      const priorityOrder: Record<string, number> = { "1": 0, "2": 1, "3": 2 };
      return [...patients].sort((a, b) => {
        const pa = priorityOrder[a.priority] ?? 99;
        const pb = priorityOrder[b.priority] ?? 99;
        if (pa !== pb) return pa - pb;
        if (a.checkedInTime && b.checkedInTime) {
          return new Date(a.checkedInTime).getTime() - new Date(b.checkedInTime).getTime();
        }
        return 0;
      });
    }
    return patients;
  };

  // Drag handlers
  const handleDragStart = (
    type: IAttendanceType,
    idx: number,
    status: IAttendanceProgression
  ) => {
    setDragged({ type, idx, status });
  };

  const handleDragEnd = () => {
    if (!pendingDrop && !multiSectionModalOpen) {
      setDragged(null);
    }
  };

  // Helper to determine if drop is backward
  const isBackwardDrop = (
    from: IAttendanceProgression,
    to: IAttendanceProgression
  ) => {
    const order = ["scheduled", "checkedIn", "onGoing", "completed"];
    return order.indexOf(to) < order.indexOf(from);
  };

  // Main drop logic
  const handleDrop = (
    toType: IAttendanceType,
    toStatus: IAttendanceProgression
  ) => {
    if (!attendanceByDate || !dragged) return;
    if (dragged.type === toType && dragged.status === toStatus) return;
    if (dragged.type !== toType) return;

    // Find patient by name in the unsorted array
    const sourcePatients = attendanceByDate[dragged.type][dragged.status];
    const sortedPatients = getPatients(dragged.type, dragged.status);
    const patient = sortedPatients[dragged.idx];
    const realIdx = sourcePatients.findIndex((p: IAttendanceStatusDetail) => p.name === patient.name);
    if (realIdx === -1) return;
    sourcePatients.splice(realIdx, 1);

    // Add to new column at the bottom, with correct type
    if (toStatus === "scheduled") {
      const { name, priority } = patient;
      attendanceByDate[toType][toStatus].push({ name, priority });
    } else {
      const { name, priority, checkedInTime, onGoingTime, completedTime } = patient;
      attendanceByDate[toType][toStatus].push({
        name,
        priority,
        checkedInTime: toStatus === "checkedIn" ? new Date() : (checkedInTime || null),
        onGoingTime: toStatus === "onGoing" ? new Date() : (onGoingTime || null),
        completedTime: toStatus === "completed" ? new Date() : (completedTime || null),
      });
    }
    setDragged(null);
  };

  // Modified drop handler
  const handleDropWithConfirm = (
    toType: IAttendanceType,
    toStatus: IAttendanceProgression
  ) => {
    if (!dragged) return;
    // Check for multi-section move only when moving from scheduled to checkedIn
    if (dragged.status === "scheduled" && toStatus === "checkedIn" && attendanceByDate) {
      const patient = getPatients(dragged.type, dragged.status)[dragged.idx];
      if (!patient) return;
      // Check if patient exists in both sections
      const inSpiritual = attendanceByDate.spiritual.scheduled.some((p: IAttendanceStatusDetail) => p.name === patient.name);
      const inLightBath = attendanceByDate.lightBath.scheduled.some((p: IAttendanceStatusDetail) => p.name === patient.name);
      if (inSpiritual && inLightBath) {
        setMultiSectionPending({ name: patient.name, fromStatus: dragged.status, toStatus });
        setMultiSectionModalOpen(true);
        return;
      }
    }
    if (isBackwardDrop(dragged.status, toStatus)) {
      setPendingDrop({ toType, toStatus });
      setConfirmOpen(true);
    } else {
      handleDrop(toType, toStatus);
    }
  };

  // Multi-section modal handlers
  const handleMultiSectionConfirm = () => {
    if (!multiSectionPending || !attendanceByDate) return;
    // Move patient in both sections
    ["spiritual", "lightBath"].forEach((type) => {
      const sourcePatients = attendanceByDate[type as IAttendanceType]["scheduled"];
      const idx = sourcePatients.findIndex((p: IAttendanceStatusDetail) => p.name === multiSectionPending.name);
      if (idx !== -1) {
        const patient = sourcePatients[idx];
        sourcePatients.splice(idx, 1);
        attendanceByDate[type as IAttendanceType]["checkedIn"].push({
          ...patient,
          checkedInTime: new Date(),
        });
      }
    });
    setMultiSectionModalOpen(false);
    setMultiSectionPending(null);
    setDragged(null);
  };

  const handleMultiSectionCancel = () => {
    // Only move in dragged section
    if (dragged) {
      handleDrop(dragged.type, "checkedIn");
    }
    setMultiSectionModalOpen(false);
    setMultiSectionPending(null);
  };

  const handleConfirm = () => {
    if (pendingDrop && dragged) {
      handleDrop(pendingDrop.toType, pendingDrop.toStatus);
    }
    setConfirmOpen(false);
    setPendingDrop(null);
  };

  const handleCancel = () => {
    setConfirmOpen(false);
    setPendingDrop(null);
  };

  return {
    attendances,
    selectedDate,
    setSelectedDate,
    dragged,
    handleDragStart,
    handleDragEnd,
    handleDrop,
    getPatients,
    confirmOpen,
    pendingDrop,
    handleDropWithConfirm,
    handleConfirm,
    handleCancel,
    multiSectionModalOpen,
    multiSectionPending,
    handleMultiSectionConfirm,
    handleMultiSectionCancel,
    checkInProcessed,
    setCheckInProcessed,
  };
}

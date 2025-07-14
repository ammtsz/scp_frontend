import { useAttendances } from "@/contexts/AttendancesContext";
import { useState } from "react";
import { IAttendanceType, IAttendanceProgression, IAttendanceStatusDetail } from "@/types/db";

export interface IDraggedItem {
    type: IAttendanceType;
    status: IAttendanceProgression;
    idx: number;
  }
  

export function useAttendanceList(externalCheckIn?: { name: string; types: string[]; isNew: boolean } | null) {
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

  // Find attendance for selected date
  const attendanceByDate = attendances.find(
    (a) => a.date.toISOString().slice(0, 10) === selectedDate
  );

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
    setDragged(null);
  };

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

  return {
    attendances,
    selectedDate,
    setSelectedDate,
    dragged,
    handleDragStart,
    handleDragEnd,
    handleDrop,
    getPatients,
  };
}

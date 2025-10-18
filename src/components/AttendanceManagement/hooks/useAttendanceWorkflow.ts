import { useState, useEffect, useCallback } from "react";
import { useAttendances } from "@/contexts/AttendancesContext";
import { updateAttendanceStatus } from "@/api/attendanceSync";
import { getIncompleteAttendances } from "../utils/attendanceDataUtils";
import type { IAttendanceType } from "@/types/globals";

export const useAttendanceWorkflow = () => {
  const { selectedDate, attendancesByDate, refreshCurrentDate } = useAttendances();

  // Collapsed state for attendance sections
  const [collapsed, setCollapsed] = useState<{
    [key in IAttendanceType]: boolean;
  }>({ spiritual: false, lightBath: false, rod: false, combined: false });

  // Day finalization state
  const [isDayFinalized, setIsDayFinalized] = useState(false);

  // Load finalization state from localStorage when date changes
  useEffect(() => {
    if (selectedDate) {
      const key = `day-finalized-${selectedDate}`;
      const stored = localStorage.getItem(key);
      setIsDayFinalized(stored === "true");
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
  const finalizeDay = useCallback(() => {
    setIsDayFinalized(true);
  }, []);

  // Function to unfinalize the day (undo finalization)
  const unFinalizeDay = useCallback(() => {
    setIsDayFinalized(false);
  }, []);

  // Toggle collapsed state for attendance sections
  const toggleCollapsed = useCallback((type: IAttendanceType) => {
    setCollapsed((prev) => ({ ...prev, [type]: !prev[type] }));
  }, []);

  // Handle attendance completion
  const handleAttendanceCompletion = useCallback(
    async (attendanceId: number) => {
      if (!attendancesByDate) {
        console.error("No attendance data available");
        return;
      }

      // Find the attendance in incomplete attendances
      const incompleteAttendances = getIncompleteAttendances(attendancesByDate);
      const attendance = incompleteAttendances.find(
        (att) => att.attendanceId === attendanceId
      );

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
    },
    [attendancesByDate, refreshCurrentDate]
  );

  // Handle attendance rescheduling
  const handleAttendanceReschedule = useCallback(
    async (attendanceId: number) => {
      if (!attendancesByDate) {
        console.error("No attendance data available");
        return;
      }

      // Find the attendance in incomplete attendances
      const incompleteAttendances = getIncompleteAttendances(attendancesByDate);
      const attendance = incompleteAttendances.find(
        (att) => att.attendanceId === attendanceId
      );

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
    },
    [attendancesByDate, refreshCurrentDate]
  );

  return {
    // State
    collapsed,
    isDayFinalized,

    // Actions
    finalizeDay,
    unFinalizeDay,
    toggleCollapsed,
    handleAttendanceCompletion,
    handleAttendanceReschedule,
  };
};

export default useAttendanceWorkflow;

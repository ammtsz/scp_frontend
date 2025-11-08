import { useCallback, useState, useEffect, useMemo } from "react";
import type { AttendanceType } from "@/types/types";
import type { AbsenceJustification, ScheduledAbsence } from "./types";
import { useCloseModal } from "@/stores/modalStore";
import { useAttendanceData } from "../../hooks";
import { markAttendanceAsMissed } from "@/api/attendances";
import { useSetDayFinalized } from "@/stores";
import { useHandleAbsenceJustifications } from "@/hooks/useAttendanceQueries";

import {
  getIncompleteAttendances,
  getCompletedAttendances,
  getScheduledAbsences,
} from "../../utils/attendanceDataUtils";

interface UseEndOfDayProps {
  onHandleCompletion: (attendanceId: number) => void;
  onReschedule: (attendanceId: number) => void;
}

export const useEndOfDay = ({
  onHandleCompletion,
  onReschedule,
}: UseEndOfDayProps) => {
    const { attendancesByDate, refreshData } = useAttendanceData();
    const setDayFinalized = useSetDayFinalized();
    const handleAbsencesMutation = useHandleAbsenceJustifications();

  // Memoize all attendance data calculations to prevent infinite loops
  const incompleteAttendances = useMemo(() => 
    getIncompleteAttendances(attendancesByDate), 
    [attendancesByDate]
  );
  
  const completedAttendances = useMemo(() => 
    getCompletedAttendances(attendancesByDate), 
    [attendancesByDate]
  );
  
  const scheduledAbsencesOriginal = useMemo(() => 
    getScheduledAbsences(attendancesByDate), 
    [attendancesByDate]
  );
    
  // Memoize the transformation to prevent infinite loops
  const scheduledAbsences: ScheduledAbsence[] = useMemo(() => {
    return scheduledAbsencesOriginal.map((absence) => ({
      patientId: absence.patientId ?? 0,
      patientName: absence.name,
      attendanceType: absence.attendanceType,
    }));
  }, [scheduledAbsencesOriginal]);

  // Memoize the initial state to prevent recreating on every render
  const initialAbsenceJustifications = useMemo(() => {
    return scheduledAbsences.map((absence) => ({
      patientId: absence.patientId,
      patientName: absence.patientName,
      attendanceType: absence.attendanceType,
      // justified is undefined until user selects
    }));
  }, [scheduledAbsences]);
  
  const [currentStep, setCurrentStep] = useState<"incomplete" | "absences" | "confirm">("incomplete");
  const [absenceJustifications, setAbsenceJustifications] = useState<AbsenceJustification[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);


  const closeModal = useCloseModal();

  // Sync absenceJustifications when initialAbsenceJustifications changes
  useEffect(() => {
    setAbsenceJustifications(initialAbsenceJustifications);
  }, [initialAbsenceJustifications]);

  const handleJustificationChange = useCallback(
    (patientId: number, attendanceType: AttendanceType, justified: boolean, justification?: string) => {
      setAbsenceJustifications((prev) => {
        return prev.map((item) =>
          item.patientId === patientId && item.attendanceType === attendanceType
            ? { ...item, justified, justification }
            : item
        );
      });
    },
    []
  );

  const handleNext = useCallback(() => {
    switch (currentStep) {
      case "incomplete":
        setCurrentStep("absences");
        break;
      case "absences":
        setCurrentStep("confirm");
        break;
    }
  }, [currentStep]);

  const handleBack = useCallback(() => {
    switch (currentStep) {
      case "absences":
        setCurrentStep("incomplete");
        break;
      case "confirm":
        setCurrentStep("absences");
        break;
    }
  }, [currentStep]);

  const handleEndOfDaySubmit = useCallback(
    async () => {
    try {
      // Process all scheduled absences - mark them as missed with justifications
      if (scheduledAbsencesOriginal.length > 0) {
        const missedAttendancePromises = scheduledAbsencesOriginal.map(async (absence) => {
          // Find the justification for this absence
          const justification = absenceJustifications.find(
            (j) => j.patientId === (absence.patientId ?? 0) && j.attendanceType === absence.attendanceType
          );
          
          // Mark attendance as missed with justification if available
          const attendanceId = absence.attendanceId;
          if (attendanceId) {
            const justified = justification?.justified ?? false;
            const notes = justification?.justification ?? "";
            
            return markAttendanceAsMissed(attendanceId.toString(), justified, notes);
          }
          return { success: true }; // Skip if no attendanceId
        });
        
        // Wait for all missed attendance updates to complete
        const results = await Promise.all(missedAttendancePromises);
        
        // Check if any failed
        const failed = results.filter(result => !result.success);
        if (failed.length > 0) {
          throw new Error(`Failed to update ${failed.length} missed attendances`);
        }
      }
      
      // Handle absence justifications if any exist
      const justificationsToSend = absenceJustifications
        .filter(j => j.justified !== undefined)
        .map(j => ({
          attendanceId: j.patientId, // Map patientId to attendanceId (may need adjustment)
          patientName: j.patientName,
          justified: j.justified ?? false,
          notes: j.justification ?? "",
        }));
      
      if (justificationsToSend.length > 0) {
        await handleAbsencesMutation.mutateAsync(justificationsToSend);
      }
      
      // Mark the day as finalized
      setDayFinalized(true);
      
      // Close the modal after successful finalization
      closeModal("endOfDay");
      
      // Refresh data after finalization
      if (refreshData) {
        await refreshData();
      }
    } catch (error) {
      console.error("Error finalizing day:", error);
      // Handle error appropriately
      throw error; // Re-throw to allow proper error handling in the modal
    }
  }, [scheduledAbsencesOriginal, absenceJustifications, handleAbsencesMutation, setDayFinalized, refreshData, closeModal]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await handleEndOfDaySubmit();
    } finally {
      setIsSubmitting(false);
    }
  }, [handleEndOfDaySubmit]);

  const canProceedFromIncomplete = incompleteAttendances.length === 0;
  const canProceedFromAbsences = scheduledAbsences.length === 0 || 
    absenceJustifications.every((j) => j.justified !== undefined);

  return {
    currentStep,
    absenceJustifications,
    isSubmitting,
    canProceedFromIncomplete,
    canProceedFromAbsences,
    scheduledAbsences,
    completedAttendances,
    incompleteAttendances,
    handleJustificationChange,
    handleNext,
    handleBack,
    handleSubmit,
    handleCompletion: onHandleCompletion,
    handleReschedule: onReschedule,
  };
};

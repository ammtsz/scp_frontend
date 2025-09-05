import { useCallback, useState, useEffect, useMemo } from "react";
import type { IAttendanceStatusDetail, IAttendanceType } from "@/types/globals";
import type { AbsenceJustification, ScheduledAbsence } from "./types";

interface UseEndOfDayProps {
  incompleteAttendances: IAttendanceStatusDetail[];
  scheduledAbsences: ScheduledAbsence[];
  onHandleCompletion: (attendanceId: number) => void;
  onReschedule: (attendanceId: number) => void;
  onSubmitEndOfDay: (absenceJustifications: AbsenceJustification[]) => void;
}

export const useEndOfDay = ({
  incompleteAttendances,
  scheduledAbsences,
  onHandleCompletion,
  onReschedule,
  onSubmitEndOfDay,
}: UseEndOfDayProps) => {
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

  // Sync absenceJustifications when initialAbsenceJustifications changes
  useEffect(() => {
    setAbsenceJustifications(initialAbsenceJustifications);
  }, [initialAbsenceJustifications]);

  const handleJustificationChange = useCallback(
    (patientId: number, attendanceType: IAttendanceType, justified: boolean, justification?: string) => {
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

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    try {
      await onSubmitEndOfDay(absenceJustifications);
    } finally {
      setIsSubmitting(false);
    }
  }, [absenceJustifications, onSubmitEndOfDay]);

  const canProceedFromIncomplete = incompleteAttendances.length === 0;
  const canProceedFromAbsences = scheduledAbsences.length === 0 || 
    absenceJustifications.every((j) => j.justified !== undefined);

  return {
    currentStep,
    absenceJustifications,
    isSubmitting,
    canProceedFromIncomplete,
    canProceedFromAbsences,
    handleJustificationChange,
    handleNext,
    handleBack,
    handleSubmit,
    handleCompletion: onHandleCompletion,
    handleReschedule: onReschedule,
  };
};

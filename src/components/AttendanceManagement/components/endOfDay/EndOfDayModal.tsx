import React, { useState, useMemo } from "react";
import ErrorDisplay from "@/components/common/ErrorDisplay";
import type { IAttendanceStatusDetailWithType } from "../../utils/attendanceDataUtils";
import StepNavigation from "./StepNavigation";
import IncompleteAttendancesStep from "./IncompleteAttendancesStep";
import AbsenceJustificationStep from "./AbsenceJustificationStep";
import ConfirmationStep from "./ConfirmationStep";
import { useEndOfDay } from "./useEndOfDay";
import type { AbsenceJustification } from "./types";

interface EndOfDayModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDate: string;
  incompleteAttendances: IAttendanceStatusDetailWithType[];
  completedAttendances: IAttendanceStatusDetailWithType[];
  scheduledAbsences: IAttendanceStatusDetailWithType[];
  onHandleCompletion: (attendanceId: number) => void;
  onReschedule: (attendanceId: number) => void;
  onSubmitEndOfDay: (absenceJustifications: AbsenceJustification[]) => void;
}

const EndOfDayModal: React.FC<EndOfDayModalProps> = ({
  isOpen,
  onClose,
  selectedDate,
  incompleteAttendances,
  completedAttendances,
  scheduledAbsences,
  onHandleCompletion,
  onReschedule,
  onSubmitEndOfDay,
}) => {
  const [error, setError] = useState<string | null>(null);

  // Memoize the transformation to prevent infinite loops
  const transformedScheduledAbsences = useMemo(() => {
    return scheduledAbsences.map((absence) => ({
      patientId: absence.patientId || 0,
      patientName: absence.name,
      attendanceType: absence.attendanceType,
    }));
  }, [scheduledAbsences]);

  const {
    currentStep,
    absenceJustifications,
    isSubmitting,
    handleJustificationChange,
    handleNext,
    handleBack,
    handleSubmit,
    handleCompletion,
    handleReschedule,
  } = useEndOfDay({
    incompleteAttendances,
    scheduledAbsences: transformedScheduledAbsences,
    onHandleCompletion: async (attendanceId: number) => {
      try {
        setError(null);
        await onHandleCompletion(attendanceId);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao concluir atendimento"
        );
      }
    },
    onReschedule: async (attendanceId: number) => {
      try {
        setError(null);
        await onReschedule(attendanceId);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao reagendar atendimento"
        );
      }
    },
    onSubmitEndOfDay: async (absenceJustifications: AbsenceJustification[]) => {
      try {
        setError(null);
        await onSubmitEndOfDay(absenceJustifications);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Erro ao finalizar o dia"
        );
        throw err;
      }
    },
  });

  if (!isOpen) return null;

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "incomplete":
        return (
          <IncompleteAttendancesStep
            incompleteAttendances={incompleteAttendances}
            selectedDate={selectedDate}
            onHandleCompletion={handleCompletion}
            onReschedule={handleReschedule}
            onNext={handleNext}
          />
        );
      case "absences":
        return (
          <AbsenceJustificationStep
            scheduledAbsences={scheduledAbsences.map((absence) => ({
              patientId: absence.patientId || 0,
              patientName: absence.name,
              attendanceType: absence.attendanceType,
            }))}
            selectedDate={selectedDate}
            absenceJustifications={absenceJustifications}
            onJustificationChange={handleJustificationChange}
            onNext={handleNext}
            onBack={handleBack}
          />
        );
      case "confirm":
        return (
          <ConfirmationStep
            selectedDate={selectedDate}
            completedAttendances={completedAttendances}
            scheduledAbsences={scheduledAbsences.map((absence) => ({
              patientId: absence.patientId || 0,
              patientName: absence.name,
              attendanceType: absence.attendanceType,
            }))}
            absenceJustifications={absenceJustifications}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit}
            onBack={handleBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">
              Finalizar o Dia
            </h2>
            <button
              onClick={onClose}
              disabled={isSubmitting}
              className="text-gray-400 hover:text-gray-600 focus:outline-none disabled:opacity-50"
              aria-label="Fechar modal"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Step Navigation */}
          <StepNavigation
            currentStep={currentStep}
            incompleteAttendancesCount={incompleteAttendances.length}
            scheduledAbsencesCount={scheduledAbsences.length}
          />

          {/* Error Display */}
          {error && (
            <div className="mb-6">
              <ErrorDisplay error={error} />
            </div>
          )}

          {/* Current Step Content */}
          <div className="min-h-[400px]">{renderCurrentStep()}</div>
        </div>
      </div>
    </div>
  );
};

export default EndOfDayModal;

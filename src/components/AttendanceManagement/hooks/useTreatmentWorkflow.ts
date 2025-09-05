import { useState } from "react";
import { useAttendances } from "@/contexts/AttendancesContext";
import type { SpiritualConsultationData } from "../components/TreatmentForms/SpiritualConsultationForm";
import type { IAttendanceStatusDetail } from "@/types/globals";

export const useTreatmentWorkflow = (
  refreshCurrentDate: () => void,
  finalizeDay?: () => void
) => {
  // Treatment workflow state
  const [spiritualConsultationOpen, setSpiritualConsultationOpen] = useState(false);
  const [endOfDayModalOpen, setEndOfDayModalOpen] = useState(false);
  const [selectedAttendanceForConsultation, setSelectedAttendanceForConsultation] = 
    useState<{ id: number; patientName: string } | null>(null);

  // AttendancesContext for treatment workflow functions
  const { createSpiritualConsultationRecord, finalizeEndOfDay } = useAttendances();

  // Treatment workflow handlers
  const handleSpiritualConsultationSubmit = async (data: SpiritualConsultationData) => {
    if (!selectedAttendanceForConsultation) return;

    const success = await createSpiritualConsultationRecord(
      selectedAttendanceForConsultation.id,
      data
    );

    if (success) {
      setSpiritualConsultationOpen(false);
      setSelectedAttendanceForConsultation(null);
      refreshCurrentDate();
    }
  };

  const handleEndOfDaySubmit = async (data: {
    incompleteAttendances: IAttendanceStatusDetail[];
    scheduledAbsences: IAttendanceStatusDetail[];
    absenceJustifications: Array<{
      patientId: number;
      patientName: string;
      justified: boolean;
      notes: string;
    }>;
  }) => {
    const success = await finalizeEndOfDay(data);

    if (success) {
      setEndOfDayModalOpen(false);
      finalizeDay?.(); // Mark the day as finalized
      refreshCurrentDate();
    }
  };

  const openEndOfDayModal = () => setEndOfDayModalOpen(true);
  const closeEndOfDayModal = () => setEndOfDayModalOpen(false);

  const openSpiritualConsultation = (attendanceId: number, patientName: string) => {
    setSelectedAttendanceForConsultation({ id: attendanceId, patientName });
    setSpiritualConsultationOpen(true);
  };

  const closeSpiritualConsultation = () => {
    setSpiritualConsultationOpen(false);
    setSelectedAttendanceForConsultation(null);
  };

  return {
    // State
    spiritualConsultationOpen,
    endOfDayModalOpen,
    selectedAttendanceForConsultation,
    
    // Handlers
    handleSpiritualConsultationSubmit,
    handleEndOfDaySubmit,
    openEndOfDayModal,
    closeEndOfDayModal,
    openSpiritualConsultation,
    closeSpiritualConsultation,
  };
};

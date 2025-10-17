/**
 * Hook for managing end-of-day workflow
 */
import { useState } from "react";
import type { AbsenceJustification } from "../components/EndOfDay/types";

export const useTreatmentWorkflow = (
  refreshCurrentDate: () => void,
  finalizeDay: () => void
) => {
  const [endOfDayModalOpen, setEndOfDayModalOpen] = useState(false);

  const openEndOfDayModal = () => {
    setEndOfDayModalOpen(true);
  };

  const closeEndOfDayModal = () => {
    setEndOfDayModalOpen(false);
  };

  const handleEndOfDaySubmit = async (absenceJustifications: AbsenceJustification[]) => {
    try {
      // TODO: Process absence justifications if needed
      // This is where you could send absence justifications to backend
      console.log("Processing absence justifications:", absenceJustifications);
      
      finalizeDay();
      closeEndOfDayModal();
      refreshCurrentDate();
    } catch (error) {
      console.error("Error finalizing day:", error);
      // Handle error appropriately
      throw error; // Re-throw to allow proper error handling in the modal
    }
  };

  return {
    endOfDayModalOpen,
    handleEndOfDaySubmit,
    openEndOfDayModal,
    closeEndOfDayModal,
  };
};
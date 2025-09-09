/**
 * Hook for managing end-of-day workflow
 */
import { useState } from "react";

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

  const handleEndOfDaySubmit = async () => {
    try {
      finalizeDay();
      closeEndOfDayModal();
      refreshCurrentDate();
    } catch (error) {
      console.error("Error finalizing day:", error);
      // Handle error appropriately
    }
  };

  return {
    endOfDayModalOpen,
    handleEndOfDaySubmit,
    openEndOfDayModal,
    closeEndOfDayModal,
  };
};
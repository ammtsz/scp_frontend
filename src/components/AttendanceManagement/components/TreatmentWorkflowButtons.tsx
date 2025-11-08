import { useOpenEndOfDay } from "@/stores/modalStore";
import React from "react";

interface TreatmentWorkflowButtonsProps {
  onUnFinalizeClick: () => void;
  onFinalizeClick: () => void;
  isDayFinalized?: boolean;
  selectedDate: string;
}

export const TreatmentWorkflowButtons: React.FC<
  TreatmentWorkflowButtonsProps
> = ({
  onUnFinalizeClick,
  onFinalizeClick,
  isDayFinalized = false,
  selectedDate,
}) => {
  const openEndOfDayModal = useOpenEndOfDay();

  return (
    <div className="mt-6 flex gap-4 justify-center">
      {isDayFinalized ? (
        <>
          <button
            type="button"
            className="button bg-gray-400 text-gray-600 cursor-not-allowed transition-colors flex-1"
            disabled
          >
            Dia finalizado
          </button>
          <button
            type="button"
            className="button bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md transition-colors"
            onClick={onUnFinalizeClick}
          >
            Desfinalizar
          </button>
        </>
      ) : (
        <button
          type="button"
          className="button button-primary w-full transition-colors"
          onClick={() => openEndOfDayModal({ onFinalizeClick, selectedDate })}
        >
          Finalizar Dia
        </button>
      )}
    </div>
  );
};

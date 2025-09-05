import React from "react";

interface TreatmentWorkflowButtonsProps {
  onEndOfDayClick: () => void;
  onUnFinalizeClick?: () => void;
  isDayFinalized?: boolean;
}

export const TreatmentWorkflowButtons: React.FC<
  TreatmentWorkflowButtonsProps
> = ({ onEndOfDayClick, onUnFinalizeClick, isDayFinalized = false }) => {
  return (
    <div className="mt-6 flex gap-4 justify-center">
      {isDayFinalized ? (
        <>
          <button
            type="button"
            className="bg-gray-400 text-gray-600 cursor-not-allowed transition-colors flex-1"
            disabled
          >
            Dia finalizado
          </button>
          <button
            type="button"
            className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-md transition-colors text-sm"
            onClick={onUnFinalizeClick}
          >
            Desfinalizar
          </button>
        </>
      ) : (
        <button
          type="button"
          className="button-primary w-full transition-colors"
          onClick={onEndOfDayClick}
        >
          Finalizar Dia
        </button>
      )}
    </div>
  );
};

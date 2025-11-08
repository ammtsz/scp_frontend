import React from "react";
import { useMultiSectionModal, useCloseModal } from "@/stores/modalStore";

/**
 * Unified Multi-Section Modal - Combines store logic and UI in one component
 * Handles the specific case of moving patients in both sections
 */
export const MultiSectionModal: React.FC = () => {
  const multiSection = useMultiSectionModal();
  const closeModal = useCloseModal();

  const handleConfirm = () => {
    multiSection.onConfirm?.();
    closeModal("multiSection");
  };

  const handleCancel = () => {
    multiSection.onCancel?.();
    closeModal("multiSection");
  };

  // Don't render if modal is not open
  if (!multiSection.isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-600/60 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Múltiplas Seções
            </h3>
            <button
              onClick={handleCancel}
              className="text-gray-400 hover:text-gray-600 focus:outline-none"
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

          {/* Content */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-6">
              Este paciente está agendado nas duas consultas. Deseja mover para
              &apos;Sala de Espera&apos; em ambas?
            </p>

            {/* Actions */}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Apenas nesta seção
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Mover em ambas
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiSectionModal;

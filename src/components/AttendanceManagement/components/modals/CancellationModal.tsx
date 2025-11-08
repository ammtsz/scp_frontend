import React, { useState } from "react";
import {
  useCancellationModal,
  useCloseModal,
  useSetCancellationLoading,
} from "@/stores/modalStore";
import { useAttendanceData } from "../../hooks/useAttendanceData";

/**
 * Unified Cancellation Modal - Combines store logic and UI in one component
 * No more redundant renderer/modal separation
 */
export const CancellationModal: React.FC = () => {
  const cancellationModal = useCancellationModal();
  const closeModal = useCloseModal();
  const setCancellationLoading = useSetCancellationLoading();
  const { deleteAttendance, refreshData } = useAttendanceData();

  // Local UI state
  const [reason, setReason] = useState("");

  // Handle the actual cancellation with reason
  const handleConfirmCancellation = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cancellationModal.attendanceId) {
      console.error("No attendance ID available for cancellation");
      return;
    }

    setCancellationLoading(true);

    try {
      const success = await deleteAttendance(
        cancellationModal.attendanceId,
        reason.trim()
      );

      if (success) {
        handleClose();
        refreshData();
      }
    } catch (error) {
      console.error("Error cancelling attendance:", error);
    } finally {
      setCancellationLoading(false);
    }
  };

  const handleClose = () => {
    setReason("");
    closeModal("cancellation");
  };

  // Don't render if modal is not open
  if (!cancellationModal.isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-600/60 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
        <div className="mt-3">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Cancelar Agendamento
            </h3>
            <button
              onClick={handleClose}
              disabled={cancellationModal.isLoading}
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

          {/* Content */}
          <div className="mb-4">
            <p className="text-sm text-gray-600 mb-4">
              Você está prestes a cancelar o agendamento de{" "}
              <strong>{cancellationModal.patientName || ""}</strong>.
            </p>

            <form onSubmit={handleConfirmCancellation}>
              <div className="mb-4">
                <label
                  htmlFor="cancellation-reason"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Motivo do cancelamento
                </label>
                <textarea
                  id="cancellation-reason"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Informe o motivo do cancelamento (opcional)"
                  disabled={cancellationModal.isLoading}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={cancellationModal.isLoading}
                  className="button px-4 py-2 text-gray-600 border-2 border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={cancellationModal.isLoading}
                  className="button px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {cancellationModal.isLoading
                    ? "Cancelando..."
                    : "Confirmar Cancelamento"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancellationModal;

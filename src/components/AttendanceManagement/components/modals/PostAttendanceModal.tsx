import React, { useEffect } from "react";
import ErrorDisplay from "@/components/common/ErrorDisplay";
import LoadingButton from "@/components/common/LoadingButton";
import { TabbedModal } from "@/components/common/TabbedModal";
import { usePostAttendanceForm } from "../Forms/PostAttendanceForms/hooks/usePostAttendanceForm";
import {
  BasicInfoTab,
  GeneralRecommendationsTab,
  TreatmentRecommendationsTab,
} from "../Forms/PostAttendanceForms/Tabs";
import TreatmentSessionConfirmation from "../Forms/PostAttendanceForms/components/TreatmentSessionConfirmation";
import TreatmentSessionErrors from "../Forms/PostAttendanceForms/components/TreatmentSessionErrors";
import type { TreatmentStatus } from "../Forms/PostAttendanceForms/hooks/usePostAttendanceForm";
import { usePostAttendanceModal, useCloseModal } from "@/stores/modalStore";

const PostAttendanceModal: React.FC = () => {
  // // Get state from Zustand store
  const postAttendance = usePostAttendanceModal();
  const closeModal = useCloseModal();

  // // Extract values from store
  const { attendanceId, patientId, patientName, currentTreatmentStatus } =
    postAttendance;

  // Use the custom hook for all spiritual treatment logic
  const {
    formData,
    handleChange,
    handleSubmit,
    handleRecommendationsChange,
    handleDateChange,
    patientData,
    fetchError,
    setFetchError,
    isLoading,
    error,
    clearError,
    showConfirmation,
    createdSessions,
    resetConfirmation,
    showErrors,
    sessionErrors,
    resetErrors,
    retrySessionCreation,
    handleCancel,
  } = usePostAttendanceForm();

  // Tab validation logic - simplified for now
  const [activeTab, setActiveTab] = React.useState("basic");

  const tabs = [
    {
      id: "basic",
      label: "Informações Básicas",
      isValid: Boolean(formData.mainComplaint.trim()),
    },
    {
      id: "general",
      label: "Recomendações Gerais",
      isValid: true, // General recommendations are optional
    },
    {
      id: "treatment",
      label: "Recomendações de Tratamentos",
      isValid: true, // Treatment recommendations are optional
    },
  ];

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
  };

  // Handle confirmation acknowledgment
  const handleConfirmationAcknowledge = () => {
    resetConfirmation();
    handleCancel(); // Close modal after acknowledgment
  };

  // Handle error acknowledgment
  const handleErrorContinue = () => {
    resetErrors();
    handleCancel(); // Close modal after acknowledgment
  };

  // Handle error retry
  const handleErrorRetry = () => {
    retrySessionCreation();
    // The retry logic would depend on the specific implementation
    // For now, we'll just reset the error state
  };

  // Auto-scroll to top on error
  useEffect(() => {
    if (error || fetchError) {
      const modalContent = document.querySelector(
        ".flex-1.bg-white.px-6.py-6.overflow-y-auto"
      );
      if (modalContent) {
        modalContent.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }, [error, fetchError]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "basic":
        return (
          <BasicInfoTab
            formData={formData}
            currentTreatmentStatus={currentTreatmentStatus as TreatmentStatus}
            patientData={patientData}
            onFormDataChange={(field, value) => {
              const syntheticEvent = {
                target: { name: field, value },
              } as React.ChangeEvent<HTMLInputElement>;
              handleChange(syntheticEvent);
            }}
            onDateChange={handleDateChange}
          />
        );
      case "general":
        return (
          <GeneralRecommendationsTab
            formData={formData}
            onFormDataChange={(field, value) => {
              const syntheticEvent = {
                target: { name: field, value },
              } as React.ChangeEvent<HTMLInputElement>;
              handleChange(syntheticEvent);
            }}
          />
        );
      case "treatment":
        return (
          <TreatmentRecommendationsTab
            formData={formData}
            onRecommendationsChange={handleRecommendationsChange}
          />
        );
      default:
        return null;
    }
  };

  const actions = (
    <div className="flex justify-end space-x-3">
      <button
        type="button"
        onClick={() => closeModal("postAttendance")}
        disabled={isLoading}
        className="button text-gray-700 border border-gray-300 bg-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 transition-colors"
      >
        Cancelar
      </button>
      <LoadingButton
        onClick={handleSubmit}
        isLoading={isLoading}
        loadingText="Salvando..."
        className="button text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
      >
        Concluir atendimento
      </LoadingButton>
    </div>
  );

  // Don't render if modal is not open
  if (!postAttendance.isOpen || !postAttendance.attendanceId) {
    return null;
  }

  return (
    <TabbedModal
      isOpen={true}
      onClose={handleCancel}
      title={
        showConfirmation
          ? `Tratamento Concluído - ${patientName}`
          : showErrors
          ? `Problemas no Tratamento - ${patientName}`
          : `Formulário de Tratamento Espiritual - ${patientName}`
      }
      subtitle={
        showConfirmation
          ? "Agendamentos criados automaticamente"
          : showErrors
          ? "Alguns agendamentos não puderam ser criados"
          : `Atendimento #${attendanceId} • Paciente #${patientId}`
      }
      tabs={showConfirmation || showErrors ? [] : tabs} // Hide tabs in confirmation/error view
      activeTab={activeTab}
      onTabChange={handleTabChange}
      actions={showConfirmation || showErrors ? null : actions} // Hide actions in confirmation/error view
      maxWidth="2xl"
    >
      {/* Only show errors when not in confirmation or error mode */}
      {!showConfirmation && !showErrors && error && (
        <ErrorDisplay
          error={error}
          dismissible={true}
          onDismiss={clearError}
          className="mb-4"
        />
      )}

      {!showConfirmation && !showErrors && fetchError && (
        <ErrorDisplay
          error={fetchError}
          dismissible={true}
          onDismiss={() => setFetchError(null)}
          className="mb-4"
        />
      )}

      {/* Render confirmation, errors, or form content */}
      {showConfirmation ? (
        <TreatmentSessionConfirmation
          sessions={createdSessions}
          patientName={patientName || ""}
          onAcknowledge={handleConfirmationAcknowledge}
        />
      ) : showErrors ? (
        <TreatmentSessionErrors
          errors={sessionErrors}
          patientName={patientName || ""}
          onRetry={handleErrorRetry}
          onContinue={handleErrorContinue}
        />
      ) : (
        renderTabContent()
      )}
    </TabbedModal>
  );
};

export default PostAttendanceModal;

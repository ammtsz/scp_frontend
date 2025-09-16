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
import type {
  SpiritualTreatmentData,
  TreatmentStatus,
} from "../Forms/PostAttendanceForms/hooks/usePostAttendanceForm";

interface PostAttendanceModalProps {
  attendanceId: number;
  patientId: number;
  patientName: string;
  currentTreatmentStatus: TreatmentStatus;
  onSubmit: (
    data: SpiritualTreatmentData
  ) => Promise<{ treatmentRecordId: number }>;
  onCancel: () => void;
  isLoading?: boolean;
  initialData?: Partial<SpiritualTreatmentData>;
  onTreatmentSessionsCreated?: (sessionIds: number[]) => void;
}

const PostAttendanceModal: React.FC<PostAttendanceModalProps> = ({
  attendanceId,
  patientId,
  patientName,
  currentTreatmentStatus,
  onSubmit,
  onCancel,
  isLoading: externalLoading = false,
  initialData,
  onTreatmentSessionsCreated,
}) => {
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
  } = usePostAttendanceForm({
    attendanceId,
    patientId,
    currentTreatmentStatus,
    onSubmit,
    isLoading: externalLoading,
    initialData,
    onTreatmentSessionsCreated,
  });

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
    onCancel(); // Close the modal after confirmation
  };

  // Auto-scroll to top on error
  useEffect(() => {
    if (error) {
      const modalContent = document.querySelector(
        '[role="dialog"] .overflow-y-auto'
      );
      if (modalContent) {
        modalContent.scrollTo({ top: 0, behavior: "smooth" });
      }
    }
  }, [error]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "basic":
        return (
          <BasicInfoTab
            formData={formData}
            currentTreatmentStatus={currentTreatmentStatus}
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
        onClick={onCancel}
        disabled={isLoading}
        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 transition-colors"
      >
        Cancelar
      </button>
      <LoadingButton
        onClick={handleSubmit}
        isLoading={isLoading}
        loadingText="Salvando..."
        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
      >
        Concluir atendimento
      </LoadingButton>
    </div>
  );

  return (
    <TabbedModal
      isOpen={true}
      onClose={onCancel}
      title={showConfirmation ? 
        `Tratamento Concluído - ${patientName}` : 
        `Formulário de Tratamento Espiritual - ${patientName}`
      }
      subtitle={showConfirmation ? 
        "Agendamentos criados automaticamente" : 
        `Atendimento #${attendanceId} • Paciente #${patientId}`
      }
      tabs={showConfirmation ? [] : tabs} // Hide tabs in confirmation view
      activeTab={activeTab}
      onTabChange={handleTabChange}
      actions={showConfirmation ? null : actions} // Hide actions in confirmation view
      maxWidth="2xl"
    >
      {/* Only show errors when not in confirmation mode */}
      {!showConfirmation && error && (
        <ErrorDisplay error={error} dismissible={true} onDismiss={clearError} />
      )}

      {!showConfirmation && fetchError && (
        <ErrorDisplay
          error={fetchError}
          dismissible={true}
          onDismiss={() => setFetchError(null)}
        />
      )}

      {/* Render confirmation or form content */}
      {showConfirmation ? (
        <TreatmentSessionConfirmation
          sessions={createdSessions}
          patientName={patientName}
          onAcknowledge={handleConfirmationAcknowledge}
        />
      ) : (
        renderTabContent()
      )}
    </TabbedModal>
  );
};

export default PostAttendanceModal;

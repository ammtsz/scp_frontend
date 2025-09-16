"use client";

import React from "react";
import NewAttendanceForm from "../Forms/NewAttendanceForm";
import { IPriority } from "@/types/globals";
import BaseModal from "@/components/common/BaseModal";
import ErrorDisplay from "@/components/common/ErrorDisplay";

// ✅ FIXED: Multiple attendance creation issue resolved by removing duplicate API calls in useAgendaCalendar
// FIX: When try to schedule a new attendance for a patient that already has an appointment on a different day, it is showing the message saying that the patient already has an appointment for that day, even he/she doesn't.

interface NewAttendanceFormModalProps {
  onRegisterNewAttendance?: (
    patientName: string,
    types: string[],
    isNew: boolean,
    priority: IPriority,
    date?: string
  ) => void;
  onClose?: () => void;
  onSuccess?: () => void;
  title?: string;
  subtitle?: string;
  showDateField?: boolean;
  validationDate?: string;
}

const NewAttendanceFormModal: React.FC<NewAttendanceFormModalProps> = ({
  onRegisterNewAttendance,
  onClose,
  onSuccess,
  title = "Novo Agendamento",
  subtitle = "Agendar atendimento para paciente",
  showDateField = true,
  validationDate,
}) => {
  const [error, setError] = React.useState<string | null>(null);

  const handleSubmit = async (
    patientName: string,
    types: string[],
    isNew: boolean,
    priority: IPriority,
    date?: string
  ) => {
    try {
      setError(null);

      // Call the external callback if provided (for backward compatibility)
      if (onRegisterNewAttendance) {
        onRegisterNewAttendance(patientName, types, isNew, priority, date);
      }

      // Note: Form success is now handled internally by useAttendanceForm
      // Modal will be closed by the form's success handler
    } catch (error) {
      console.error("Error in form submission:", error);
      setError("Erro ao processar agendamento. Tente novamente.");
    }
  };

  const renderContent = () => (
    <>
      <ErrorDisplay error={error} />
      <NewAttendanceForm
        onRegisterNewAttendance={handleSubmit}
        showDateField={showDateField}
        validationDate={validationDate}
        onFormSuccess={onSuccess} // Pass the success handler for form completion
      />
    </>
  );

  // Always render as modal if onClose is provided
  if (onClose) {
    return (
      <BaseModal
        isOpen={true}
        onClose={onClose}
        title={title}
        subtitle={subtitle}
        maxWidth="lg"
      >
        <div className="p-6">{renderContent()}</div>
      </BaseModal>
    );
  }

  // Standalone mode (legacy support)
  return (
    <div className="card-shadow">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
        <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
      </div>
      <div className="p-4">{renderContent()}</div>
    </div>
  );
};

export default NewAttendanceFormModal;

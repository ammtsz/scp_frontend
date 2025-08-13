import React from "react";
import NewAttendanceForm from "../NewAttendanceForm";
import { IPriority } from "@/types/globals";

interface NewAttendanceModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (
    patient: string,
    types: string[],
    isNew: boolean,
    priority: IPriority,
    date?: string
  ) => void;
}

const NewAttendanceModal: React.FC<NewAttendanceModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  if (!open) return null;

  const handleSubmit = (
    patientName: string,
    types: string[],
    isNew: boolean,
    priority: IPriority,
    date?: string
  ) => {
    onSubmit(patientName, types, isNew, priority, date);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-lg max-w-lg border border-[color:var(--border)] pb-16">
        <div className="mb-4 text-lg font-bold text-[color:var(--primary-dark)]">
          Novo Agendamento
        </div>
        <NewAttendanceForm
          onRegisterNewAttendance={handleSubmit}
          submitLabel="Agendar"
          showDateField
          autoCheckIn={false}
          showNotesField={true}
        />
        <div className="absolute w-full pt-2 -translate-y-4 translate-x-4">
          <button
            type="button"
            className="button button-secondary w-[430px]"
            onClick={onClose}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewAttendanceModal;

import React from "react";
import NewAttendanceForm from "../NewAttendanceForm";
import { IPriority } from "@/types/globas";

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
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] border border-[color:var(--border)]">
        <div className="mb-4 text-lg font-bold text-[color:var(--primary-dark)]">
          Novo Agendamento
        </div>
        <NewAttendanceForm
          onRegisterNewAttendance={handleSubmit}
          submitLabel={undefined}
          showDateField
        />
        <div className="absolute pt-2 -translate-y-12">
          <button
            type="button"
            className="button button-secondary"
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

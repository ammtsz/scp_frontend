import React from "react";
import NewAttendanceForm from "../AttendanceManagement/components/Forms/NewAttendanceForm";

interface NewAttendanceFormModalProps {
  onClose: () => void;
  onSuccess: (success: boolean) => void;
  title: string;
  subtitle: string;
  showDateField?: boolean;
  validationDate?: string;
}

const NewAttendanceFormModal: React.FC<NewAttendanceFormModalProps> = ({
  onClose,
  onSuccess,
  title,
  subtitle,
  showDateField = false,
  validationDate,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
        <div className="mb-4">
          <h2 className="text-xl font-bold">{title}</h2>
          <p className="text-gray-600">{subtitle}</p>
        </div>
        <NewAttendanceForm
          showDateField={showDateField}
          validationDate={validationDate}
          onFormSuccess={() => {
            onSuccess(true);
            onClose();
          }}
        />
        <div className="mt-4 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default NewAttendanceFormModal;

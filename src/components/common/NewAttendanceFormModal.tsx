import React from "react";
import BaseModal from "./BaseModal";
import { PatientWalkInForm } from "../AttendanceManagement/components/WalkInForm";
import { IPriority } from "@/types/globals";

interface NewAttendanceFormModalProps {
  onRegisterNewAttendance: (
    patientName: string,
    types: string[],
    isNew: boolean,
    priority: IPriority
  ) => void;
  onClose: () => void;
  title: string;
  subtitle: string;
  showDateField: boolean;
  validationDate: string;
}

const NewAttendanceFormModal: React.FC<NewAttendanceFormModalProps> = ({
  onRegisterNewAttendance,
  onClose,
  title,
  subtitle,
}) => {
  return (
    <BaseModal
      isOpen={true}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      maxWidth="lg"
    >
      <PatientWalkInForm onRegisterNewAttendance={onRegisterNewAttendance} />
    </BaseModal>
  );
};

export default NewAttendanceFormModal;

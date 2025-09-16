"use client";

import React from "react";
import { IPatient } from "@/types/globals";
import BaseModal from "@/components/common/BaseModal";
import NewPatientCheckInForm from "../Forms/NewPatientCheckInForm";

interface NewPatientCheckInModalProps {
  patient: IPatient;
  attendanceId?: number; // Add attendance ID to check in existing attendance
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedPatient: IPatient) => void;
}

const NewPatientCheckInModal: React.FC<NewPatientCheckInModalProps> = ({
  patient,
  attendanceId,
  isOpen,
  onClose,
  onSuccess,
}) => {
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Check-in do Novo Paciente"
      maxWidth="md"
    >
      <NewPatientCheckInForm
        patient={patient}
        attendanceId={attendanceId}
        onSuccess={onSuccess}
        onCancel={onClose}
      />
    </BaseModal>
  );
};

export default NewPatientCheckInModal;

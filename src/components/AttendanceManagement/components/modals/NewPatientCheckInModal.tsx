"use client";

import React from "react";
import { Patient } from "@/types/types";
import BaseModal from "@/components/common/BaseModal";
import NewPatientCheckInForm from "../Forms/NewPatientCheckInForm";

interface NewPatientCheckInModalProps {
  patient: Patient;
  attendanceId?: number; // Add attendance ID to check in existing attendance
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updatedPatient: Patient) => void;
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

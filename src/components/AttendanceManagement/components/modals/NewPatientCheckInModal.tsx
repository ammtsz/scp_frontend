"use client";

import React from "react";
import { Patient, PatientBasic } from "@/types/types";
import BaseModal from "@/components/common/BaseModal";
import NewPatientCheckInForm from "../Forms/NewPatientCheckInForm";
import { useCloseModal, useNewPatientCheckInModal } from "@/stores/modalStore";

const NewPatientCheckInModal: React.FC = () => {
  const newPatientCheckIn = useNewPatientCheckInModal();
  const closeModal = useCloseModal();

  const { patient, attendanceId, isOpen, onComplete } = newPatientCheckIn;

  const patientForCheckIn: Patient = {
    ...(patient as PatientBasic),
    birthDate: new Date(), // Default value since PatientBasic doesn't have birthDate
    mainComplaint: "", // Default value since PatientBasic doesn't have mainComplaint
    startDate: new Date(), // Default value since PatientBasic doesn't have startDate
    dischargeDate: null, // Default value since PatientBasic doesn't have dischargeDate
    nextAttendanceDates: [], // Default empty array
    currentRecommendations: {
      // Default recommendations
      date: new Date(),
      food: "",
      water: "",
      ointment: "",
      lightBath: false,
      rod: false,
      spiritualTreatment: false,
      returnWeeks: 0,
    },
    previousAttendances: [], // Default empty array
  };

  const handleClose = () => {
    closeModal("newPatientCheckIn");
  };

  const handleSuccess = (updatedPatient: Patient) => {
    if (onComplete && updatedPatient) {
      onComplete(true);
    }
    closeModal("newPatientCheckIn");
    // TODO: Add refresh logic here if needed
    console.log("Patient check-in successful:", updatedPatient);
  };

  // Don't render if modal is not open
  if (!isOpen || !patient) {
    return null;
  }
  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Check-in do Novo Paciente"
      maxWidth="md"
    >
      <NewPatientCheckInForm
        patient={patientForCheckIn}
        attendanceId={attendanceId}
        onSuccess={handleSuccess}
        onCancel={handleClose}
      />
    </BaseModal>
  );
};

export default NewPatientCheckInModal;

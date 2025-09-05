import { useState, useCallback } from "react";
import { IPatient } from "@/types/globals";

interface UseNewPatientCheckInReturn {
  isNewPatientModalOpen: boolean;
  patientToCheckIn: IPatient | null;
  openNewPatientCheckIn: (patient: IPatient) => void;
  closeNewPatientCheckIn: () => void;
  handleNewPatientSuccess: (updatedPatient: IPatient) => void;
}

export const useNewPatientCheckIn = (): UseNewPatientCheckInReturn => {
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [patientToCheckIn, setPatientToCheckIn] = useState<IPatient | null>(null);

  const openNewPatientCheckIn = useCallback((patient: IPatient) => {
    setPatientToCheckIn(patient);
    setIsNewPatientModalOpen(true);
  }, []);

  const closeNewPatientCheckIn = useCallback(() => {
    setIsNewPatientModalOpen(false);
    setPatientToCheckIn(null);
  }, []);

  const handleNewPatientSuccess = useCallback((updatedPatient: IPatient) => {
    console.log("New patient check-in completed:", updatedPatient.name);
    // Patient automatically moved to checked-in column via context update
    // The modal will be closed automatically by the form
    setPatientToCheckIn(null);
  }, []);

  return {
    isNewPatientModalOpen,
    patientToCheckIn,
    openNewPatientCheckIn,
    closeNewPatientCheckIn,
    handleNewPatientSuccess,
  };
};

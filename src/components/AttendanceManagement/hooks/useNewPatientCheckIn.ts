import { useState, useCallback } from "react";
import { Patient } from "@/types/types";

interface UseNewPatientCheckInReturn {
  isNewPatientModalOpen: boolean;
  patientToCheckIn: Patient | null;
  attendanceId: number | undefined;
  openNewPatientCheckIn: (patient: Patient, attendanceId?: number) => void;
  closeNewPatientCheckIn: () => void;
  handleNewPatientSuccess: (updatedPatient: Patient) => void;
}

export const useNewPatientCheckIn = (): UseNewPatientCheckInReturn => {
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [patientToCheckIn, setPatientToCheckIn] = useState<Patient | null>(null);
  const [attendanceId, setAttendanceId] = useState<number | undefined>(undefined);

  const openNewPatientCheckIn = useCallback((patient: Patient, attendanceId?: number) => {
    setPatientToCheckIn(patient);
    setAttendanceId(attendanceId);
    setIsNewPatientModalOpen(true);
  }, []);

  const closeNewPatientCheckIn = useCallback(() => {
    setIsNewPatientModalOpen(false);
    setPatientToCheckIn(null);
    setAttendanceId(undefined);
  }, []);

  const handleNewPatientSuccess = useCallback(() => {
    // Patient automatically moved to checked-in column via context update
    // The modal will be closed automatically by the form
    setPatientToCheckIn(null);
  }, []);

  return {
    isNewPatientModalOpen,
    patientToCheckIn,
    attendanceId,
    openNewPatientCheckIn,
    closeNewPatientCheckIn,
    handleNewPatientSuccess,
  };
};

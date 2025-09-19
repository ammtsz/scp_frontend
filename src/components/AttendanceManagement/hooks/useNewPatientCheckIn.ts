import { useState, useCallback } from "react";
import { IPatient } from "@/types/globals";

interface UseNewPatientCheckInReturn {
  isNewPatientModalOpen: boolean;
  patientToCheckIn: IPatient | null;
  attendanceId: number | undefined;
  openNewPatientCheckIn: (patient: IPatient, attendanceId?: number) => void;
  closeNewPatientCheckIn: () => void;
  handleNewPatientSuccess: (updatedPatient: IPatient) => void;
}

export const useNewPatientCheckIn = (): UseNewPatientCheckInReturn => {
  const [isNewPatientModalOpen, setIsNewPatientModalOpen] = useState(false);
  const [patientToCheckIn, setPatientToCheckIn] = useState<IPatient | null>(null);
  const [attendanceId, setAttendanceId] = useState<number | undefined>(undefined);

  const openNewPatientCheckIn = useCallback((patient: IPatient, attendanceId?: number) => {
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

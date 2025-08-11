import { useState, useEffect, useMemo } from "react";
import { IAttendanceType, IPriority } from "@/types/globals";
import { usePatients } from "@/contexts/PatientsContext";
import { useAgenda } from "@/contexts/AgendaContext";
import { getNextAttendanceDate } from "@/api/attendances";
import { AttendanceType } from "@/api/types";

export const TABS: { key: IAttendanceType; label: string }[] = [
  { key: "spiritual", label: "Consultas Espirituais" },
  { key: "lightBath", label: "Banhos de Luz/Bastão" },
];

export function useAgendaCalendar() {
  const { agenda, loading, error, refreshAgenda, removePatientFromAgenda, addPatientToAgenda } = useAgenda();
  const { patients } = usePatients();
  const [selectedDate, setSelectedDate] = useState("");
  const [activeTab, setActiveTab] = useState<IAttendanceType>("spiritual");
  const [confirmRemove, setConfirmRemove] = useState<{
    id: string;
    date: Date;
    name: string;
    type: IAttendanceType;
    attendanceId?: number;
  } | null>(null);
  const [showNewAttendance, setShowNewAttendance] = useState(false);
  const [openAgendaIdx, setOpenAgendaIdx] = useState<number | null>(null);
  const [isTabTransitioning, setIsTabTransitioning] = useState(false);

  // Helper to convert a Date to 'YYYY-MM-DD' string for input[type=date] comparison
  function toInputDateString(date: Date) {
    return date.toISOString().slice(0, 10);
  }

  const filteredAgenda = useMemo(
    () => ({
      spiritual: agenda.spiritual.filter(
        (a) => !selectedDate || toInputDateString(a.date) === selectedDate
      ),
      lightBath: agenda.lightBath.filter(
        (a) => !selectedDate || toInputDateString(a.date) === selectedDate
      ),
    }),
    [agenda.spiritual, agenda.lightBath, selectedDate]
  );

  useEffect(() => {

    if (filteredAgenda[activeTab].length > 0) {
      setOpenAgendaIdx(0);
    } else {
      setOpenAgendaIdx(null);
    }
  }, [activeTab, agenda.spiritual, agenda.lightBath, selectedDate, filteredAgenda]);

  useEffect(() => {
    if (isTabTransitioning) {
      const timeout = setTimeout(() => setIsTabTransitioning(false), 100);
      return () => clearTimeout(timeout);
    }
  }, [isTabTransitioning]);

  function handleTabChange(tabKey: IAttendanceType) {
    if (tabKey !== activeTab) {
      setIsTabTransitioning(true);
      setTimeout(() => setActiveTab(tabKey), 100);
    }
  }

  async function handleRemovePatient() {
    if (!confirmRemove) return;
    
    // If we have an attendanceId, use the backend to remove it
    if (confirmRemove.attendanceId) {
      const success = await removePatientFromAgenda(confirmRemove.attendanceId);
      if (success) {
        setConfirmRemove(null);
      }
      // Error handling is done in the context
    } else {
      // Fallback for cases where attendanceId is not available (shouldn't happen with backend)
      console.warn('No attendanceId found for patient removal:', confirmRemove);
      setConfirmRemove(null);
    }
  }

  // Get next available date
  const getNextAvailableDate = async (): Promise<string> => {
    try {
      const result = await getNextAttendanceDate();
      if (result.success && result.value?.next_date) {
        return result.value.next_date;
      }
    } catch (error) {
      console.warn('Error fetching next available date:', error);
    }
    
    // Fallback to today if API call fails
    return new Date().toISOString().split('T')[0];
  };

  async function handleNewAttendance(
    patientName: string,
    types: string[],
    isNew: boolean,
    priority: IPriority,
    date?: string
  ) {
    try {
      const patient = patients.find((p) => p.name === patientName);
      if (!patient) {
        console.warn('Patient not found for new attendance:', patientName);
        return;
      }

      const scheduleDate = date || await getNextAvailableDate();
      
      // Create attendances for each selected type
      for (const type of types) {
        const attendanceType = type === 'spiritual' ? AttendanceType.SPIRITUAL : AttendanceType.LIGHT_BATH;
        
        const attendanceData = {
          patient_id: Number(patient.id),
          type: attendanceType,
          scheduled_date: scheduleDate,
          scheduled_time: '21:00',
          notes: `Agendamento via agenda - ${isNew ? 'Novo paciente' : 'Paciente existente'}`,
        };

        await addPatientToAgenda(attendanceData);
      }
      
      setShowNewAttendance(false);
    } catch (error) {
      console.error('Error creating new attendance:', error);
    }
  }

  return {
    TABS,
    selectedDate,
    setSelectedDate,
    activeTab,
    setActiveTab: handleTabChange,
    confirmRemove,
    setConfirmRemove,
    showNewAttendance,
    setShowNewAttendance,
    openAgendaIdx,
    setOpenAgendaIdx,
    isTabTransitioning,
    filteredAgenda,
    handleRemovePatient,
    handleNewAttendance,
    loading,
    error,
    refreshAgenda,
  };
}

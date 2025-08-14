import { useState, useEffect, useMemo } from "react";
import { IAttendanceType, IPriority } from "@/types/globals";
import { usePatients } from "@/contexts/PatientsContext";
import { useAgenda } from "@/contexts/AgendaContext";
import { getNextAttendanceDate } from "@/api/attendances";
import { AttendanceType } from "@/api/types";

// For calendar, we only support two tab types (rod is combined with lightBath)
type CalendarTabType = "spiritual" | "lightBath";

export const TABS: { key: CalendarTabType; label: string }[] = [
  { key: "spiritual", label: "Consultas Espirituais" },
  { key: "lightBath", label: "Banhos de Luz/Bastão" },
];

export function useAgendaCalendar() {
  const { agenda, loading, error, refreshAgenda, removePatientFromAgenda, addPatientToAgenda } = useAgenda();
  const { patients } = usePatients();
  const [selectedDate, setSelectedDate] = useState("");
  const [activeTab, setActiveTab] = useState<CalendarTabType>("spiritual");
  const [showNext5Dates, setShowNext5Dates] = useState(false); // Default to showing next 5 dates
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

  const filteredAgenda = useMemo(
    () => {
      // Helper function to get next 5 unique attendance dates from a reference date forward
      const getNext5AttendanceDates = (agendaItems: { date: Date; patients: unknown[] }[], fromDate?: string): Date[] => {
        // Use selected date as reference, or today if no date selected
        const referenceDate = fromDate ? new Date(fromDate + 'T00:00:00') : new Date();
        referenceDate.setHours(0, 0, 0, 0);
        
        // Get all dates from reference date forward, sorted chronologically
        const futureDates = agendaItems
          .map(item => item.date)
          .filter(date => {
            const itemDate = new Date(date);
            itemDate.setHours(0, 0, 0, 0);
            return itemDate >= referenceDate;
          })
          .sort((a, b) => a.getTime() - b.getTime());
        
        // Get unique dates (remove duplicates)
        const uniqueDates = futureDates.filter((date, index, arr) => 
          index === 0 || date.getTime() !== arr[index - 1].getTime()
        );
        
        // Return first 5 dates
        return uniqueDates.slice(0, 5);
      };

      // Get combined agenda items for date calculation
      const allAgendaItems = [...agenda.spiritual, ...agenda.lightBath];
      const next5Dates = !showNext5Dates ? getNext5AttendanceDates(allAgendaItems, selectedDate) : [];
      
      // Helper function to check if date should be included
      const shouldIncludeDate = (date: Date): boolean => {
        if (showNext5Dates) {
          // Show all future dates when toggle is ON (from selected date or today)
          const referenceDate = selectedDate ? new Date(selectedDate + 'T00:00:00') : new Date();
          referenceDate.setHours(0, 0, 0, 0);
          const itemDate = new Date(date);
          itemDate.setHours(0, 0, 0, 0);
          return itemDate >= referenceDate;
        }
        
        // Show only next 5 dates when toggle is OFF
        return next5Dates.some(nextDate => {
          const nextDateTime = new Date(nextDate).getTime();
          const itemDateTime = new Date(date).getTime();
          return Math.abs(nextDateTime - itemDateTime) < 24 * 60 * 60 * 1000; // Same day
        });
      };

      return {
        spiritual: agenda.spiritual.filter((a) => {
          // Apply date range filter (which already considers selected date as reference)
          return shouldIncludeDate(a.date);
        }),
        lightBath: agenda.lightBath.filter((a) => {
          // Apply date range filter (which already considers selected date as reference)
          return shouldIncludeDate(a.date);
        }),
      };
    },
    [agenda.spiritual, agenda.lightBath, selectedDate, showNext5Dates]
  );

  useEffect(() => {
    if (isTabTransitioning) {
      const timeout = setTimeout(() => setIsTabTransitioning(false), 100);
      return () => clearTimeout(timeout);
    }
  }, [isTabTransitioning]);

  function handleTabChange(tabKey: IAttendanceType) {
    // Map rod to lightBath since they share the same calendar tab
    const calendarTab: CalendarTabType = tabKey === "spiritual" ? "spiritual" : "lightBath";
    if (calendarTab !== activeTab) {
      setIsTabTransitioning(true);
      setTimeout(() => setActiveTab(calendarTab), 100);
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
    showNext5Dates,
    setShowNext5Dates,
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

import { useMemo } from "react";
import { AttendanceType } from "@/types/types";
import { useScheduledAgenda, useRemovePatientFromAgenda, useRefreshAgenda } from "@/hooks/useAgendaQueries";
import { 
  useSelectedDateString,
  useShowNext5Dates,
  useConfirmRemove,
  useShowNewAttendance,
  useOpenSpiritualIdx,
  useOpenLightBathIdx,
  useSetSelectedDateString,
  useSetShowNext5Dates,
  useSetConfirmRemove,
  useSetShowNewAttendance,
  useSetOpenSpiritualIdx,
  useSetOpenLightBathIdx
} from "@/stores";

export function useAgendaCalendar() {
  // React Query for server state
  const { agenda, isLoading: loading, error } = useScheduledAgenda();
  const removePatientMutation = useRemovePatientFromAgenda();
  const refreshAgenda = useRefreshAgenda();

  // Zustand for UI state - using individual selectors for optimal performance
  const selectedDate = useSelectedDateString();
  const showNext5Dates = useShowNext5Dates();
  const confirmRemove = useConfirmRemove();
  const showNewAttendance = useShowNewAttendance();
  const openSpiritualIdx = useOpenSpiritualIdx();
  const openLightBathIdx = useOpenLightBathIdx();
  
  // Zustand actions - individual selectors prevent object recreation
  const setSelectedDate = useSetSelectedDateString();
  const setShowNext5Dates = useSetShowNext5Dates();
  const setConfirmRemove = useSetConfirmRemove();
  const setShowNewAttendance = useSetShowNewAttendance();
  const setOpenSpiritualIdx = useSetOpenSpiritualIdx();
  const setOpenLightBathIdx = useSetOpenLightBathIdx();

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

  function handleRemovePatient(params: {
    id: string;
    date: Date;
    name: string;
    type: AttendanceType;
    attendanceId?: number;
  }) {
    setConfirmRemove(params);
  }

  async function handleConfirmRemove() {
    if (!confirmRemove) return;
    
    // If we have an attendanceId, use the backend to remove it
    if (confirmRemove.attendanceId) {
      try {
        await removePatientMutation.mutateAsync(confirmRemove.attendanceId);
        setConfirmRemove(null);
      } catch (error) {
        // Error handling is done by React Query and will be reflected in mutation state
        console.error('Error removing patient:', error);
      }
    } else {
      // Fallback for cases where attendanceId is not available (shouldn't happen with backend)
      console.warn('No attendanceId found for patient removal:', confirmRemove);
      setConfirmRemove(null);
    }
  }

  // Simplified: No more complex callback pattern
  // Form handles everything, agenda just manages modal UI state
  const handleFormSuccess = () => {
    setShowNewAttendance(false);
  };

  return {
    selectedDate,
    setSelectedDate,
    showNext5Dates,
    setShowNext5Dates,
    confirmRemove,
    setConfirmRemove,
    showNewAttendance,
    setShowNewAttendance,
    openSpiritualIdx,
    setOpenSpiritualIdx,
    openLightBathIdx,
    setOpenLightBathIdx,
    filteredAgenda,
    handleRemovePatient,
    handleConfirmRemove,
    handleFormSuccess,
    loading,
    error: error?.message || null,
    refreshAgenda,
  };
}

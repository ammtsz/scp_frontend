/**
 * Agenda Store - Zustand
 * 
 * Manages calendar and scheduling UI state that was previously
 * mixed with server state in AgendaContext.
 * 
 * This will handle:
 * - Current view mode (month/week/day)
 * - Selected dates and time slots
 * - Calendar navigation state
 * - Modal states for scheduling
 * - UI loading states separate from data loading
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { AttendanceType } from '@/types/types';

export type AgendaViewMode = 'month' | 'week' | 'day';

// Confirm remove modal state
interface ConfirmRemoveState {
  id: string;
  date: Date;
  name: string;
  type: AttendanceType;
  attendanceId?: number;
}

export interface AgendaStore {
  // UI State
  currentView: AgendaViewMode;
  selectedDate: Date;
  selectedTimeSlot: string | null;
  
  // Navigation State
  currentMonth: number;
  currentYear: number;
  
  // Modal States
  isSchedulingModalOpen: boolean;
  isEditingAppointment: boolean;
  editingAppointmentId: string | null;
  
  // UI Loading States (separate from data loading)
  isNavigating: boolean;
  isProcessingSchedule: boolean;
  
  // Agenda Calendar Specific State
  selectedDateString: string;
  showNext5Dates: boolean;
  confirmRemove: ConfirmRemoveState | null;
  showNewAttendance: boolean;
  openSpiritualIdx: number | null;
  openLightBathIdx: number | null;
  
  // Actions - View Management
  setCurrentView: (view: AgendaViewMode) => void;
  setSelectedDate: (date: Date) => void;
  setSelectedTimeSlot: (timeSlot: string | null) => void;
  
  // Actions - Navigation
  setCurrentMonth: (month: number) => void;
  setCurrentYear: (year: number) => void;
  navigateToDate: (date: Date) => void;
  navigateToToday: () => void;
  
  // Actions - Modal Management
  openSchedulingModal: (timeSlot?: string) => void;
  closeSchedulingModal: () => void;
  startEditingAppointment: (appointmentId: string) => void;
  stopEditingAppointment: () => void;
  
  // Actions - UI Loading
  setIsNavigating: (isNavigating: boolean) => void;
  setIsProcessingSchedule: (isProcessing: boolean) => void;
  
  // Actions - Agenda Calendar Specific
  setSelectedDateString: (date: string) => void;
  setShowNext5Dates: (show: boolean) => void;
  setConfirmRemove: (confirmRemove: ConfirmRemoveState | null) => void;
  setShowNewAttendance: (show: boolean) => void;
  setOpenSpiritualIdx: (idx: number | null) => void;
  setOpenLightBathIdx: (idx: number | null) => void;
  
  // Actions - Utilities
  resetState: () => void;
}

const today = new Date();
const initialState = {
  currentView: 'month' as AgendaViewMode,
  selectedDate: today,
  selectedTimeSlot: null,
  currentMonth: today.getMonth(),
  currentYear: today.getFullYear(),
  isSchedulingModalOpen: false,
  isEditingAppointment: false,
  editingAppointmentId: null,
  isNavigating: false,
  isProcessingSchedule: false,
  // Agenda Calendar Specific
  selectedDateString: "",
  showNext5Dates: false,
  confirmRemove: null,
  showNewAttendance: false,
  openSpiritualIdx: null,
  openLightBathIdx: null,
};

export const useAgendaStore = create<AgendaStore>()(
  devtools(
    (set) => ({
      ...initialState,
      
      // View Management Actions
      setCurrentView: (currentView: AgendaViewMode) => 
        set({ currentView }, false, 'setCurrentView'),
      
      setSelectedDate: (selectedDate: Date) => 
        set({ 
          selectedDate,
          currentMonth: selectedDate.getMonth(),
          currentYear: selectedDate.getFullYear(),
        }, false, 'setSelectedDate'),
      
      setSelectedTimeSlot: (selectedTimeSlot: string | null) => 
        set({ selectedTimeSlot }, false, 'setSelectedTimeSlot'),
      
      // Navigation Actions
      setCurrentMonth: (currentMonth: number) => 
        set({ currentMonth }, false, 'setCurrentMonth'),
      
      setCurrentYear: (currentYear: number) => 
        set({ currentYear }, false, 'setCurrentYear'),
      
      navigateToDate: (date: Date) => 
        set({ 
          selectedDate: date,
          currentMonth: date.getMonth(),
          currentYear: date.getFullYear(),
        }, false, 'navigateToDate'),
      
      navigateToToday: () => {
        const today = new Date();
        set({ 
          selectedDate: today,
          currentMonth: today.getMonth(),
          currentYear: today.getFullYear(),
        }, false, 'navigateToToday');
      },
      
      // Modal Management Actions
      openSchedulingModal: (timeSlot?: string) => 
        set({ 
          isSchedulingModalOpen: true,
          selectedTimeSlot: timeSlot || null,
        }, false, 'openSchedulingModal'),
      
      closeSchedulingModal: () => 
        set({ 
          isSchedulingModalOpen: false,
          selectedTimeSlot: null,
        }, false, 'closeSchedulingModal'),
      
      startEditingAppointment: (editingAppointmentId: string) => 
        set({ 
          isEditingAppointment: true,
          editingAppointmentId,
        }, false, 'startEditingAppointment'),
      
      stopEditingAppointment: () => 
        set({ 
          isEditingAppointment: false,
          editingAppointmentId: null,
        }, false, 'stopEditingAppointment'),
      
      // UI Loading Actions
      setIsNavigating: (isNavigating: boolean) => 
        set({ isNavigating }, false, 'setIsNavigating'),
      
      setIsProcessingSchedule: (isProcessingSchedule: boolean) => 
        set({ isProcessingSchedule }, false, 'setIsProcessingSchedule'),
      
      // Agenda Calendar Specific Actions
      setSelectedDateString: (selectedDateString: string) => 
        set({ selectedDateString }, false, 'setSelectedDateString'),
      
      setShowNext5Dates: (showNext5Dates: boolean) => 
        set({ showNext5Dates }, false, 'setShowNext5Dates'),
      
      setConfirmRemove: (confirmRemove: ConfirmRemoveState | null) => 
        set({ confirmRemove }, false, 'setConfirmRemove'),
      
      setShowNewAttendance: (showNewAttendance: boolean) => 
        set({ showNewAttendance }, false, 'setShowNewAttendance'),
      
      setOpenSpiritualIdx: (openSpiritualIdx: number | null) => 
        set({ openSpiritualIdx }, false, 'setOpenSpiritualIdx'),
      
      setOpenLightBathIdx: (openLightBathIdx: number | null) => 
        set({ openLightBathIdx }, false, 'setOpenLightBathIdx'),
      
      // Reset all state to initial values
      resetState: () => 
        set(initialState, false, 'resetState'),
    }),
    {
      name: 'agenda-store',
    }
  )
);
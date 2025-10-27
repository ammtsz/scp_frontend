/**
 * Stores Barrel Export
 * 
 * Centralized exports for all Zustand stores
 */

// Attendance Store - Core drag & drop and workflow management
export { useAttendanceStore } from './attendanceStore';

// Agenda Store - Calendar and scheduling UI state  
export { useAgendaStore } from './agendaStore';

// Agenda Selectors - Optimized selectors for performance
export {
  // State selectors
  useSelectedDateString,
  useShowNext5Dates,
  useConfirmRemove,
  useShowNewAttendance,
  useOpenSpiritualIdx,
  useOpenLightBathIdx,
  useAgendaCalendarState,
  
  // Individual action selectors
  useSetSelectedDateString,
  useSetShowNext5Dates,
  useSetConfirmRemove,
  useSetShowNewAttendance,
  useSetOpenSpiritualIdx,
  useSetOpenLightBathIdx,
  
  // Combined selectors (use sparingly)
  useAgendaActions,
} from './agendaSelectors';

// Attendance Selectors - Optimized selectors for drag & drop performance
export {
  // Legacy combined selectors (avoid using - prefer individual)
  useAttendanceSelectors,
  useAttendanceActions,
  
  // Composite selectors (when you need multiple related values)
  useAttendanceDateState,
  useAttendanceDragState,
  useAttendanceEndOfDayState,
  
  // Individual state selectors (optimal performance)
  useSelectedDate,
  useAttendanceLoading,
  useAttendanceDataLoading,
  useAttendanceError,
  useDraggedItem,
  useIsDragging,
  useDayFinalized,
  useEndOfDayStatus,
  
  // Individual action selectors (stable references)
  useSetSelectedDate,
  useSetAttendanceLoading,
  useSetAttendanceDataLoading,
  useSetAttendanceError,
  useSetDraggedItem,
  useSetIsDragging,
  useSetDayFinalized,
  useCheckEndOfDayStatus,
  useFinalizeEndOfDay,
} from './attendanceSelectors';

// Export store types for convenience
export type { AttendanceStore } from './attendanceStore';
export type { AgendaStore } from './agendaStore';
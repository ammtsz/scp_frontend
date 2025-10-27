/**
 * Agenda Store Selectors
 * 
 * Optimized selectors for the agenda store to prevent unnecessary re-renders
 * and provide cleaner component interfaces.
 */

import { useAgendaStore } from './agendaStore';

// Individual state selectors (optimal performance - single property subscriptions)
export const useSelectedDateString = () => useAgendaStore(state => state.selectedDateString);
export const useShowNext5Dates = () => useAgendaStore(state => state.showNext5Dates);
export const useConfirmRemove = () => useAgendaStore(state => state.confirmRemove);
export const useShowNewAttendance = () => useAgendaStore(state => state.showNewAttendance);
export const useOpenSpiritualIdx = () => useAgendaStore(state => state.openSpiritualIdx);
export const useOpenLightBathIdx = () => useAgendaStore(state => state.openLightBathIdx);

// Individual action selectors (stable function references)
export const useSetSelectedDateString = () => useAgendaStore(state => state.setSelectedDateString);
export const useSetShowNext5Dates = () => useAgendaStore(state => state.setShowNext5Dates);
export const useSetConfirmRemove = () => useAgendaStore(state => state.setConfirmRemove);
export const useSetShowNewAttendance = () => useAgendaStore(state => state.setShowNewAttendance);
export const useSetOpenSpiritualIdx = () => useAgendaStore(state => state.setOpenSpiritualIdx);
export const useSetOpenLightBathIdx = () => useAgendaStore(state => state.setOpenLightBathIdx);

// Combined actions (use only when you need multiple actions together)
export const useAgendaActions = () => ({
  setSelectedDateString: useSetSelectedDateString(),
  setShowNext5Dates: useSetShowNext5Dates(),
  setConfirmRemove: useSetConfirmRemove(),
  setShowNewAttendance: useSetShowNewAttendance(),
  setOpenSpiritualIdx: useSetOpenSpiritualIdx(),
  setOpenLightBathIdx: useSetOpenLightBathIdx(),
});

// Calendar-specific selectors (optimized with individual subscriptions)
export const useAgendaCalendarState = () => ({
  selectedDate: useAgendaStore(state => state.selectedDateString),
  showNext5Dates: useAgendaStore(state => state.showNext5Dates),
  confirmRemove: useAgendaStore(state => state.confirmRemove),
  showNewAttendance: useAgendaStore(state => state.showNewAttendance),
  openSpiritualIdx: useAgendaStore(state => state.openSpiritualIdx),
  openLightBathIdx: useAgendaStore(state => state.openLightBathIdx),
});

// Performance-optimized selectors for specific use cases
export const useAgendaDateFilter = () => ({
  selectedDate: useAgendaStore(state => state.selectedDateString),
  showNext5Dates: useAgendaStore(state => state.showNext5Dates),
});

export const useAgendaModals = () => ({
  confirmRemove: useAgendaStore(state => state.confirmRemove),
  showNewAttendance: useAgendaStore(state => state.showNewAttendance),
});

export const useAgendaAccordions = () => ({
  openSpiritualIdx: useAgendaStore(state => state.openSpiritualIdx),
  openLightBathIdx: useAgendaStore(state => state.openLightBathIdx),
});
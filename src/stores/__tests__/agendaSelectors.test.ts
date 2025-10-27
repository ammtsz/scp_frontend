/**
 * Attendance Store Selectors Tests
 */

import { renderHook, act } from '@testing-library/react';
import { useAgendaCalendarState, useAgendaActions, useAgendaDateFilter } from '../agendaSelectors';
import { useAgendaStore } from '../agendaStore';

describe('agendaSelectors', () => {
  beforeEach(() => {
    // Reset store state before each test
    useAgendaStore.getState().resetState();
  });

  describe('useAgendaCalendarState', () => {
    it('should return all calendar-specific state', () => {
      const { result } = renderHook(() => useAgendaCalendarState());
      
      expect(result.current).toEqual({
        selectedDate: "",
        showNext5Dates: false,
        confirmRemove: null,
        showNewAttendance: false,
        openSpiritualIdx: null,
        openLightBathIdx: null,
      });
    });

    it('should update when individual state properties change', () => {
      const { result: stateResult } = renderHook(() => useAgendaCalendarState());
      const { result: actionsResult } = renderHook(() => useAgendaActions());
      
      act(() => {
        actionsResult.current.setSelectedDateString('2025-10-27');
        actionsResult.current.setShowNext5Dates(true);
      });
      
      expect(stateResult.current.selectedDate).toBe('2025-10-27');
      expect(stateResult.current.showNext5Dates).toBe(true);
    });
  });

  describe('useAgendaActions', () => {
    it('should return all action functions', () => {
      const { result } = renderHook(() => useAgendaActions());
      
      expect(typeof result.current.setSelectedDateString).toBe('function');
      expect(typeof result.current.setShowNext5Dates).toBe('function');
      expect(typeof result.current.setConfirmRemove).toBe('function');
      expect(typeof result.current.setShowNewAttendance).toBe('function');
      expect(typeof result.current.setOpenSpiritualIdx).toBe('function');
      expect(typeof result.current.setOpenLightBathIdx).toBe('function');
    });

    it('should allow state updates through actions', () => {
      const { result: actionsResult } = renderHook(() => useAgendaActions());
      const { result: stateResult } = renderHook(() => useAgendaCalendarState());
      
      act(() => {
        actionsResult.current.setSelectedDateString('2025-12-25');
        actionsResult.current.setShowNewAttendance(true);
        actionsResult.current.setOpenSpiritualIdx(1);
      });
      
      expect(stateResult.current.selectedDate).toBe('2025-12-25');
      expect(stateResult.current.showNewAttendance).toBe(true);
      expect(stateResult.current.openSpiritualIdx).toBe(1);
    });
  });

  describe('useAgendaDateFilter', () => {
    it('should return only date-related state', () => {
      const { result } = renderHook(() => useAgendaDateFilter());
      
      expect(result.current).toEqual({
        selectedDate: "",
        showNext5Dates: false,
      });
    });

    it('should not include other state properties', () => {
      const { result } = renderHook(() => useAgendaDateFilter());
      
      expect(result.current).not.toHaveProperty('confirmRemove');
      expect(result.current).not.toHaveProperty('showNewAttendance');
      expect(result.current).not.toHaveProperty('openSpiritualIdx');
    });
  });

  describe('Performance: Individual subscriptions', () => {
    it('should only re-render when subscribed state changes', () => {
      let dateFilterRenders = 0;
      let calendarStateRenders = 0;
      
      renderHook(() => {
        dateFilterRenders++;
        return useAgendaDateFilter();
      });
      
      renderHook(() => {
        calendarStateRenders++;
        return useAgendaCalendarState();
      });
      
      const { result: actionsResult } = renderHook(() => useAgendaActions());
      
      // Initial render
      expect(dateFilterRenders).toBe(1);
      expect(calendarStateRenders).toBe(1);
      
      // Update date - both should re-render
      act(() => {
        actionsResult.current.setSelectedDateString('2025-10-27');
      });
      
      expect(dateFilterRenders).toBe(2);
      expect(calendarStateRenders).toBe(2);
      
      // Update modal state - only calendar should re-render
      act(() => {
        actionsResult.current.setShowNewAttendance(true);
      });
      
      expect(dateFilterRenders).toBe(2); // No change
      expect(calendarStateRenders).toBe(3); // Re-rendered
    });
  });
});
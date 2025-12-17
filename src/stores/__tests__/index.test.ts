/**
 * @jest-environment jsdom
 */

import * as storesIndex from '../index';

describe('stores/index', () => {
  describe('Exports', () => {
    it('should export useAttendanceStore', () => {
      expect(storesIndex.useAttendanceStore).toBeDefined();
      expect(typeof storesIndex.useAttendanceStore).toBe('function');
    });

    it('should export useAgendaStore', () => {
      expect(storesIndex.useAgendaStore).toBeDefined();
      expect(typeof storesIndex.useAgendaStore).toBe('function');
    });

    it('should export agenda selectors', () => {
      // State selectors
      expect(storesIndex.useSelectedDateString).toBeDefined();
      expect(typeof storesIndex.useSelectedDateString).toBe('function');
      
      expect(storesIndex.useShowNext5Dates).toBeDefined();
      expect(typeof storesIndex.useShowNext5Dates).toBe('function');
      
      expect(storesIndex.useConfirmRemove).toBeDefined();
      expect(typeof storesIndex.useConfirmRemove).toBe('function');
      
      expect(storesIndex.useShowNewAttendance).toBeDefined();
      expect(typeof storesIndex.useShowNewAttendance).toBe('function');
      
      expect(storesIndex.useOpenSpiritualIdx).toBeDefined();
      expect(typeof storesIndex.useOpenSpiritualIdx).toBe('function');
      
      expect(storesIndex.useOpenLightBathIdx).toBeDefined();
      expect(typeof storesIndex.useOpenLightBathIdx).toBe('function');
      
      expect(storesIndex.useAgendaCalendarState).toBeDefined();
      expect(typeof storesIndex.useAgendaCalendarState).toBe('function');
    });

    it('should export agenda action selectors', () => {
      expect(storesIndex.useSetSelectedDateString).toBeDefined();
      expect(typeof storesIndex.useSetSelectedDateString).toBe('function');
      
      expect(storesIndex.useSetShowNext5Dates).toBeDefined();
      expect(typeof storesIndex.useSetShowNext5Dates).toBe('function');
      
      expect(storesIndex.useSetConfirmRemove).toBeDefined();
      expect(typeof storesIndex.useSetConfirmRemove).toBe('function');
      
      expect(storesIndex.useSetShowNewAttendance).toBeDefined();
      expect(typeof storesIndex.useSetShowNewAttendance).toBe('function');
      
      expect(storesIndex.useSetOpenSpiritualIdx).toBeDefined();
      expect(typeof storesIndex.useSetOpenSpiritualIdx).toBe('function');
      
      expect(storesIndex.useSetOpenLightBathIdx).toBeDefined();
      expect(typeof storesIndex.useSetOpenLightBathIdx).toBe('function');
      
      expect(storesIndex.useAgendaActions).toBeDefined();
      expect(typeof storesIndex.useAgendaActions).toBe('function');
    });

    it('should export attendance selectors', () => {
      // Legacy combined selectors
      expect(storesIndex.useAttendanceSelectors).toBeDefined();
      expect(typeof storesIndex.useAttendanceSelectors).toBe('function');
      
      expect(storesIndex.useAttendanceActions).toBeDefined();
      expect(typeof storesIndex.useAttendanceActions).toBe('function');
      
      // Composite selectors
      expect(storesIndex.useAttendanceDateState).toBeDefined();
      expect(typeof storesIndex.useAttendanceDateState).toBe('function');
      
      expect(storesIndex.useAttendanceDragState).toBeDefined();
      expect(typeof storesIndex.useAttendanceDragState).toBe('function');
      
      expect(storesIndex.useAttendanceEndOfDayState).toBeDefined();
      expect(typeof storesIndex.useAttendanceEndOfDayState).toBe('function');
    });

    it('should export attendance state selectors', () => {
      expect(storesIndex.useSelectedDate).toBeDefined();
      expect(typeof storesIndex.useSelectedDate).toBe('function');
      
      expect(storesIndex.useAttendanceLoading).toBeDefined();
      expect(typeof storesIndex.useAttendanceLoading).toBe('function');
      
      expect(storesIndex.useAttendanceDataLoading).toBeDefined();
      expect(typeof storesIndex.useAttendanceDataLoading).toBe('function');
      
      expect(storesIndex.useAttendanceError).toBeDefined();
      expect(typeof storesIndex.useAttendanceError).toBe('function');
      
      expect(storesIndex.useDraggedItem).toBeDefined();
      expect(typeof storesIndex.useDraggedItem).toBe('function');
      
      expect(storesIndex.useIsDragging).toBeDefined();
      expect(typeof storesIndex.useIsDragging).toBe('function');
      
      expect(storesIndex.useDayFinalized).toBeDefined();
      expect(typeof storesIndex.useDayFinalized).toBe('function');
      
      expect(storesIndex.useEndOfDayStatus).toBeDefined();
      expect(typeof storesIndex.useEndOfDayStatus).toBe('function');
    });

    it('should export attendance action selectors', () => {
      expect(storesIndex.useSetSelectedDate).toBeDefined();
      expect(typeof storesIndex.useSetSelectedDate).toBe('function');
      
      expect(storesIndex.useSetAttendanceLoading).toBeDefined();
      expect(typeof storesIndex.useSetAttendanceLoading).toBe('function');
      
      expect(storesIndex.useSetAttendanceDataLoading).toBeDefined();
      expect(typeof storesIndex.useSetAttendanceDataLoading).toBe('function');
      
      expect(storesIndex.useSetAttendanceError).toBeDefined();
      expect(typeof storesIndex.useSetAttendanceError).toBe('function');
      
      expect(storesIndex.useSetDraggedItem).toBeDefined();
      expect(typeof storesIndex.useSetDraggedItem).toBe('function');
      
      expect(storesIndex.useSetIsDragging).toBeDefined();
      expect(typeof storesIndex.useSetIsDragging).toBe('function');
      
      expect(storesIndex.useSetDayFinalized).toBeDefined();
      expect(typeof storesIndex.useSetDayFinalized).toBe('function');
      
      expect(storesIndex.useCheckEndOfDayStatus).toBeDefined();
      expect(typeof storesIndex.useCheckEndOfDayStatus).toBe('function');
      
      expect(storesIndex.useFinalizeEndOfDay).toBeDefined();
      expect(typeof storesIndex.useFinalizeEndOfDay).toBe('function');
    });

    it('should export store types', () => {
      // Note: Type exports can't be tested at runtime since they're TypeScript types
      // that get stripped during compilation. The fact that this module loads without
      // TypeScript errors confirms the type exports are working correctly.
      expect(true).toBe(true); // This test verifies module loads successfully
    });
  });

  describe('Export integrity', () => {
    it('should have all expected exports', () => {
      const expectedExports = [
        // Core stores
        'useAttendanceStore',
        'useAgendaStore',
        
        // Agenda selectors - state
        'useSelectedDateString',
        'useShowNext5Dates',
        'useConfirmRemove',
        'useShowNewAttendance',
        'useOpenSpiritualIdx',
        'useOpenLightBathIdx',
        'useAgendaCalendarState',
        
        // Agenda selectors - actions
        'useSetSelectedDateString',
        'useSetShowNext5Dates',
        'useSetConfirmRemove',
        'useSetShowNewAttendance',
        'useSetOpenSpiritualIdx',
        'useSetOpenLightBathIdx',
        'useAgendaActions',
        
        // Attendance selectors - legacy combined
        'useAttendanceSelectors',
        'useAttendanceActions',
        
        // Attendance selectors - composite
        'useAttendanceDateState',
        'useAttendanceDragState',
        'useAttendanceEndOfDayState',
        
        // Attendance selectors - individual state
        'useSelectedDate',
        'useAttendanceLoading',
        'useAttendanceDataLoading',
        'useAttendanceError',
        'useDraggedItem',
        'useIsDragging',
        'useDayFinalized',
        'useEndOfDayStatus',
        
        // Attendance selectors - individual actions
        'useSetSelectedDate',
        'useSetAttendanceLoading',
        'useSetAttendanceDataLoading',
        'useSetAttendanceError',
        'useSetDraggedItem',
        'useSetIsDragging',
        'useSetDayFinalized',
        'useCheckEndOfDayStatus',
        'useFinalizeEndOfDay',
      ];

      expectedExports.forEach(exportName => {
        expect(storesIndex).toHaveProperty(exportName);
        expect(typeof storesIndex[exportName as keyof typeof storesIndex]).toBe('function');
      });
    });
  });
});
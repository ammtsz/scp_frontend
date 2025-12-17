import { renderHook, act } from '@testing-library/react';
import { useAgendaCalendar } from '../useAgendaCalendar';

// Mock all the dependencies
jest.mock('@/hooks/useAgendaQueries', () => ({
  useScheduledAgenda: jest.fn(),
  useRemovePatientFromAgenda: jest.fn(),
  useRefreshAgenda: jest.fn(),
}));

jest.mock('@/stores', () => ({
  useSelectedDateString: jest.fn(),
  useShowNext5Dates: jest.fn(),
  useConfirmRemove: jest.fn(),
  useShowNewAttendance: jest.fn(),
  useOpenSpiritualIdx: jest.fn(),
  useOpenLightBathIdx: jest.fn(),
  useSetSelectedDateString: jest.fn(),
  useSetShowNext5Dates: jest.fn(),
  useSetConfirmRemove: jest.fn(),
  useSetShowNewAttendance: jest.fn(),
  useSetOpenSpiritualIdx: jest.fn(),
  useSetOpenLightBathIdx: jest.fn(),
}));

// Import the mocked functions
import { useScheduledAgenda, useRemovePatientFromAgenda, useRefreshAgenda } from '@/hooks/useAgendaQueries';
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
  useSetOpenLightBathIdx,
} from '@/stores';

describe('useAgendaCalendar', () => {
  // Mock functions
  let mockSetSelectedDate: jest.Mock;
  let mockSetShowNext5Dates: jest.Mock;
  let mockSetConfirmRemove: jest.Mock;
  let mockSetShowNewAttendance: jest.Mock;
  let mockSetOpenSpiritualIdx: jest.Mock;
  let mockSetOpenLightBathIdx: jest.Mock;
  let mockRemovePatientMutateAsync: jest.Mock;
  let mockRefreshAgenda: jest.Mock;

  const mockAgendaData = {
    spiritual: [
      {
        date: new Date('2024-01-15T10:00:00Z'),
        patients: [
          {
            id: '1',
            name: 'John Doe',
            attendanceId: 100,
            attendanceType: 'spiritual' as const,
          },
        ],
      },
      {
        date: new Date('2024-01-16T10:00:00Z'),
        patients: [
          {
            id: '2',
            name: 'Jane Smith',
            attendanceId: 101,
            attendanceType: 'spiritual' as const,
          },
        ],
      },
    ],
    lightBath: [
      {
        date: new Date('2024-01-15T14:00:00Z'),
        patients: [
          {
            id: '3',
            name: 'Bob Wilson',
            attendanceId: 102,
            attendanceType: 'lightBath' as const,
          },
        ],
      },
    ],
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Setup store mocks
    mockSetSelectedDate = jest.fn();
    mockSetShowNext5Dates = jest.fn();
    mockSetConfirmRemove = jest.fn();
    mockSetShowNewAttendance = jest.fn();
    mockSetOpenSpiritualIdx = jest.fn();
    mockSetOpenLightBathIdx = jest.fn();

    // Setup query mocks
    mockRemovePatientMutateAsync = jest.fn().mockResolvedValue({});
    mockRefreshAgenda = jest.fn();

    (useSelectedDateString as jest.Mock).mockReturnValue('2024-01-15');
    (useShowNext5Dates as jest.Mock).mockReturnValue(false);
    (useConfirmRemove as jest.Mock).mockReturnValue(null);
    (useShowNewAttendance as jest.Mock).mockReturnValue(false);
    (useOpenSpiritualIdx as jest.Mock).mockReturnValue(null);
    (useOpenLightBathIdx as jest.Mock).mockReturnValue(null);

    (useSetSelectedDateString as jest.Mock).mockReturnValue(mockSetSelectedDate);
    (useSetShowNext5Dates as jest.Mock).mockReturnValue(mockSetShowNext5Dates);
    (useSetConfirmRemove as jest.Mock).mockReturnValue(mockSetConfirmRemove);
    (useSetShowNewAttendance as jest.Mock).mockReturnValue(mockSetShowNewAttendance);
    (useSetOpenSpiritualIdx as jest.Mock).mockReturnValue(mockSetOpenSpiritualIdx);
    (useSetOpenLightBathIdx as jest.Mock).mockReturnValue(mockSetOpenLightBathIdx);

    (useScheduledAgenda as jest.Mock).mockReturnValue({
      agenda: mockAgendaData,
      isLoading: false,
      error: null,
    });

    (useRemovePatientFromAgenda as jest.Mock).mockReturnValue({
      mutateAsync: mockRemovePatientMutateAsync,
    });

    (useRefreshAgenda as jest.Mock).mockReturnValue(mockRefreshAgenda);
  });

  describe('Hook Initialization', () => {
    it('returns all expected properties and functions', () => {
      const { result } = renderHook(() => useAgendaCalendar());

      expect(result.current).toEqual({
        selectedDate: '2024-01-15',
        setSelectedDate: mockSetSelectedDate,
        showNext5Dates: false,
        setShowNext5Dates: mockSetShowNext5Dates,
        confirmRemove: null,
        setConfirmRemove: mockSetConfirmRemove,
        showNewAttendance: false,
        setShowNewAttendance: mockSetShowNewAttendance,
        openSpiritualIdx: null,
        setOpenSpiritualIdx: mockSetOpenSpiritualIdx,
        openLightBathIdx: null,
        setOpenLightBathIdx: mockSetOpenLightBathIdx,
        filteredAgenda: expect.any(Object),
        handleRemovePatient: expect.any(Function),
        handleConfirmRemove: expect.any(Function),
        handleFormSuccess: expect.any(Function),
        loading: false,
        error: null,
        refreshAgenda: expect.any(Function),
        isRefreshing: false,
      });
    });

    it('initializes with correct default values', () => {
      const { result } = renderHook(() => useAgendaCalendar());

      expect(result.current.selectedDate).toBe('2024-01-15');
      expect(result.current.showNext5Dates).toBe(false);
      expect(result.current.confirmRemove).toBeNull();
      expect(result.current.showNewAttendance).toBe(false);
      expect(result.current.openSpiritualIdx).toBeNull();
      expect(result.current.openLightBathIdx).toBeNull();
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.isRefreshing).toBe(false);
    });
  });

  describe('Store State Management', () => {
    it('returns store values correctly', () => {
      (useSelectedDateString as jest.Mock).mockReturnValue('2024-02-20');
      (useShowNext5Dates as jest.Mock).mockReturnValue(true);
      (useOpenSpiritualIdx as jest.Mock).mockReturnValue(2);

      const { result } = renderHook(() => useAgendaCalendar());

      expect(result.current.selectedDate).toBe('2024-02-20');
      expect(result.current.showNext5Dates).toBe(true);
      expect(result.current.openSpiritualIdx).toBe(2);
    });

    it('returns store setter functions correctly', () => {
      const { result } = renderHook(() => useAgendaCalendar());

      expect(result.current.setSelectedDate).toBe(mockSetSelectedDate);
      expect(result.current.setShowNext5Dates).toBe(mockSetShowNext5Dates);
      expect(result.current.setConfirmRemove).toBe(mockSetConfirmRemove);
      expect(result.current.setShowNewAttendance).toBe(mockSetShowNewAttendance);
      expect(result.current.setOpenSpiritualIdx).toBe(mockSetOpenSpiritualIdx);
      expect(result.current.setOpenLightBathIdx).toBe(mockSetOpenLightBathIdx);
    });
  });

  describe('Loading and Error States', () => {
    it('returns loading state from query', () => {
      (useScheduledAgenda as jest.Mock).mockReturnValue({
        agenda: mockAgendaData,
        isLoading: true,
        error: null,
      });

      const { result } = renderHook(() => useAgendaCalendar());

      expect(result.current.loading).toBe(true);
    });

    it('returns error message from query', () => {
      const mockError = { message: 'Network error' };
      (useScheduledAgenda as jest.Mock).mockReturnValue({
        agenda: mockAgendaData,
        isLoading: false,
        error: mockError,
      });

      const { result } = renderHook(() => useAgendaCalendar());

      expect(result.current.error).toBe('Network error');
    });

    it('returns null error when no error', () => {
      const { result } = renderHook(() => useAgendaCalendar());

      expect(result.current.error).toBeNull();
    });
  });

  describe('Filtered Agenda - showNext5Dates false', () => {
    beforeEach(() => {
      (useShowNext5Dates as jest.Mock).mockReturnValue(false);
      (useSelectedDateString as jest.Mock).mockReturnValue('2024-01-15');
    });

    it('filters agenda to show next 5 dates from selected date', () => {
      const { result } = renderHook(() => useAgendaCalendar());

      // Should include items from selected date forward (next 5 unique dates)
      expect(result.current.filteredAgenda.spiritual).toHaveLength(2);
      expect(result.current.filteredAgenda.lightBath).toHaveLength(1);
    });

    it('handles empty agenda gracefully', () => {
      (useScheduledAgenda as jest.Mock).mockReturnValue({
        agenda: { spiritual: [], lightBath: [] },
        isLoading: false,
        error: null,
      });

      const { result } = renderHook(() => useAgendaCalendar());

      expect(result.current.filteredAgenda.spiritual).toHaveLength(0);
      expect(result.current.filteredAgenda.lightBath).toHaveLength(0);
    });
  });

  describe('Filtered Agenda - showNext5Dates true', () => {
    beforeEach(() => {
      (useShowNext5Dates as jest.Mock).mockReturnValue(true);
      (useSelectedDateString as jest.Mock).mockReturnValue('2024-01-15');
    });

    it('shows all future dates when showNext5Dates is true', () => {
      const { result } = renderHook(() => useAgendaCalendar());

      // Should show all items from selected date forward
      expect(result.current.filteredAgenda.spiritual).toHaveLength(2);
      expect(result.current.filteredAgenda.lightBath).toHaveLength(1);
    });

    it('filters out past dates correctly', () => {
      // Set selected date to future
      (useSelectedDateString as jest.Mock).mockReturnValue('2024-01-17');

      const { result } = renderHook(() => useAgendaCalendar());

      // Should filter out dates before 2024-01-17
      expect(result.current.filteredAgenda.spiritual).toHaveLength(0);
      expect(result.current.filteredAgenda.lightBath).toHaveLength(0);
    });
  });

  describe('Patient Removal', () => {
    it('sets confirm remove when handleRemovePatient is called', () => {
      const { result } = renderHook(() => useAgendaCalendar());

      const removeParams = {
        id: '1',
        date: new Date('2024-01-15'),
        name: 'John Doe',
        type: 'spiritual' as const,
        attendanceId: 100,
      };

      act(() => {
        result.current.handleRemovePatient(removeParams);
      });

      expect(mockSetConfirmRemove).toHaveBeenCalledWith(removeParams);
    });

    it('handles confirm remove with attendanceId successfully', async () => {
      const confirmRemoveData = {
        id: '1',
        date: new Date('2024-01-15'),
        name: 'John Doe',
        type: 'spiritual' as const,
        attendanceId: 100,
      };

      (useConfirmRemove as jest.Mock).mockReturnValue(confirmRemoveData);

      const { result } = renderHook(() => useAgendaCalendar());

      await act(async () => {
        await result.current.handleConfirmRemove();
      });

      expect(mockRemovePatientMutateAsync).toHaveBeenCalledWith(100);
      expect(mockSetConfirmRemove).toHaveBeenCalledWith(null);
    });

    it('handles confirm remove without attendanceId', async () => {
      const confirmRemoveData = {
        id: '1',
        date: new Date('2024-01-15'),
        name: 'John Doe',
        type: 'spiritual' as const,
        // no attendanceId
      };

      (useConfirmRemove as jest.Mock).mockReturnValue(confirmRemoveData);
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();

      const { result } = renderHook(() => useAgendaCalendar());

      await act(async () => {
        await result.current.handleConfirmRemove();
      });

      expect(mockRemovePatientMutateAsync).not.toHaveBeenCalled();
      expect(mockSetConfirmRemove).toHaveBeenCalledWith(null);
      expect(consoleSpy).toHaveBeenCalledWith('No attendanceId found for patient removal:', confirmRemoveData);

      consoleSpy.mockRestore();
    });

    it('does not remove patient when confirmRemove is null', async () => {
      (useConfirmRemove as jest.Mock).mockReturnValue(null);

      const { result } = renderHook(() => useAgendaCalendar());

      await act(async () => {
        await result.current.handleConfirmRemove();
      });

      expect(mockRemovePatientMutateAsync).not.toHaveBeenCalled();
      expect(mockSetConfirmRemove).not.toHaveBeenCalled();
    });

    it('handles removal error gracefully', async () => {
      const confirmRemoveData = {
        id: '1',
        date: new Date('2024-01-15'),
        name: 'John Doe',
        type: 'spiritual' as const,
        attendanceId: 100,
      };

      (useConfirmRemove as jest.Mock).mockReturnValue(confirmRemoveData);
      mockRemovePatientMutateAsync.mockRejectedValue(new Error('Removal failed'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      const { result } = renderHook(() => useAgendaCalendar());

      await act(async () => {
        await result.current.handleConfirmRemove();
      });

      expect(mockRemovePatientMutateAsync).toHaveBeenCalledWith(100);
      expect(consoleSpy).toHaveBeenCalledWith('Error removing patient:', expect.any(Error));

      consoleSpy.mockRestore();
    });
  });

  describe('Form Success Handler', () => {
    it('closes new attendance modal on form success', () => {
      const { result } = renderHook(() => useAgendaCalendar());

      act(() => {
        result.current.handleFormSuccess();
      });

      expect(mockSetShowNewAttendance).toHaveBeenCalledWith(false);
    });
  });

  describe('Refresh Functionality', () => {
    it('calls refresh agenda function', async () => {
      const { result } = renderHook(() => useAgendaCalendar());

      expect(result.current.isRefreshing).toBe(false);

      await act(async () => {
        await result.current.refreshAgenda();
      });

      expect(mockRefreshAgenda).toHaveBeenCalled();
    });

    it('handles refresh function call', async () => {
      const { result } = renderHook(() => useAgendaCalendar());

      await act(async () => {
        await result.current.refreshAgenda();
      });

      expect(mockRefreshAgenda).toHaveBeenCalled();
      expect(result.current.isRefreshing).toBe(false);
    });

    it('handles refresh errors gracefully', async () => {
      mockRefreshAgenda.mockImplementation(() => {
        throw new Error('Refresh failed');
      });

      const { result } = renderHook(() => useAgendaCalendar());

      // The error is thrown and caught inside the hook, not propagated
      await act(async () => {
        try {
          await result.current.refreshAgenda();
        } catch {
          // Expected behavior - error is handled internally
        }
      });

      expect(result.current.isRefreshing).toBe(false);
    });
  });

  describe('Memoization', () => {
    it('returns filtered agenda object', () => {
      const { result } = renderHook(() => useAgendaCalendar());

      expect(result.current.filteredAgenda).toBeDefined();
      expect(result.current.filteredAgenda.spiritual).toBeDefined();
      expect(result.current.filteredAgenda.lightBath).toBeDefined();
    });

    it('filters agenda based on selectedDate with showNext5Dates enabled', () => {
      (useSelectedDateString as jest.Mock).mockReturnValue('2024-01-16');
      (useShowNext5Dates as jest.Mock).mockReturnValue(true); // Enable showing all future dates

      const { result } = renderHook(() => useAgendaCalendar());

      // Only items on or after 2024-01-16 should be included
      expect(result.current.filteredAgenda.spiritual).toHaveLength(1); // 2024-01-16 item
      expect(result.current.filteredAgenda.lightBath).toHaveLength(0); // 2024-01-15 item filtered out
    });
  });
});

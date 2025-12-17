import { renderHook, act } from '@testing-library/react';
import { useAttendanceWorkflow } from '../useAttendanceWorkflow';
import { useAttendanceManagement } from '@/hooks/useAttendanceManagement';
import { updateAttendanceStatus } from '@/api/attendanceSync';
import { getIncompleteAttendances } from '../../utils/attendanceDataUtils';

// Mock dependencies
jest.mock('@/hooks/useAttendanceManagement');
jest.mock('@/api/attendanceSync');
jest.mock('../../utils/attendanceDataUtils', () => ({
  getIncompleteAttendances: jest.fn(() => [])
}));

const mockUseAttendanceManagement = useAttendanceManagement as jest.MockedFunction<typeof useAttendanceManagement>;
const mockUpdateAttendanceStatus = updateAttendanceStatus as jest.MockedFunction<typeof updateAttendanceStatus>;
const mockGetIncompleteAttendances = getIncompleteAttendances as jest.MockedFunction<typeof getIncompleteAttendances>;

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock console.error to prevent test noise
const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

describe('useAttendanceWorkflow', () => {
  const defaultMockContext = {
    attendancesByDate: null,
    selectedDate: '2024-01-15',
    refreshCurrentDate: jest.fn(),
  };

    beforeEach(() => {
    jest.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    
    // Cast to jest.Mock to avoid complex interface matching
    (mockUseAttendanceManagement as jest.Mock).mockReturnValue(defaultMockContext);    (mockUpdateAttendanceStatus as jest.Mock).mockResolvedValue({
      success: true,
      data: { attendanceId: 1 }
    });
    
    consoleSpy.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  describe('Initial state and localStorage integration', () => {
    it('should initialize with default state when no localStorage data', () => {
      localStorageMock.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useAttendanceWorkflow());

      expect(result.current.isDayFinalized).toBe(false);
      expect(result.current.collapsed).toEqual({ 
        spiritual: false, 
        lightBath: false, 
        rod: false, 
        combined: false 
      });
      expect(localStorageMock.getItem).toHaveBeenCalledWith('day-finalized-2024-01-15');
    });

    it('should restore finalization state from localStorage', () => {
      localStorageMock.getItem.mockReturnValue('true');

      const { result } = renderHook(() => useAttendanceWorkflow());

      expect(result.current.isDayFinalized).toBe(true);
    });

    it('should handle corrupted localStorage gracefully', () => {
      localStorageMock.getItem.mockReturnValue('invalid-boolean');

      const { result } = renderHook(() => useAttendanceWorkflow());

      expect(result.current.isDayFinalized).toBe(false);
    });
  });

  describe('Day finalization workflow', () => {
    it('should finalize day and update localStorage', () => {
      const { result } = renderHook(() => useAttendanceWorkflow());

      act(() => {
        result.current.finalizeDay();
      });

      expect(result.current.isDayFinalized).toBe(true);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('day-finalized-2024-01-15', 'true');
    });

    it('should unfinalize day and update localStorage', () => {
      localStorageMock.getItem.mockReturnValueOnce('true');
      const { result } = renderHook(() => useAttendanceWorkflow());

      act(() => {
        result.current.unFinalizeDay();
      });

      expect(result.current.isDayFinalized).toBe(false);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('day-finalized-2024-01-15', 'false');
    });
  });

  describe('Section collapse functionality', () => {
    it('should toggle section collapse state', () => {
      const { result } = renderHook(() => useAttendanceWorkflow());

      act(() => {
        result.current.toggleCollapsed('spiritual');
      });

      expect(result.current.collapsed.spiritual).toBe(true);
      expect(result.current.collapsed.lightBath).toBe(false);
      expect(result.current.collapsed.rod).toBe(false);
      expect(result.current.collapsed.combined).toBe(false);
    });

    it('should toggle multiple sections independently', () => {
      const { result } = renderHook(() => useAttendanceWorkflow());

      act(() => {
        result.current.toggleCollapsed('spiritual');
        result.current.toggleCollapsed('lightBath');
      });

      expect(result.current.collapsed.spiritual).toBe(true);
      expect(result.current.collapsed.lightBath).toBe(true);
      expect(result.current.collapsed.rod).toBe(false);
      expect(result.current.collapsed.combined).toBe(false);
    });

    it('should toggle section back to expanded', () => {
      const { result } = renderHook(() => useAttendanceWorkflow());

      act(() => {
        result.current.toggleCollapsed('spiritual');
        result.current.toggleCollapsed('spiritual'); // Toggle back
      });

      expect(result.current.collapsed.spiritual).toBe(false);
    });
  });

  describe('Attendance status operations', () => {
    it('should handle null attendancesByDate when completing attendance', async () => {
      const { result } = renderHook(() => useAttendanceWorkflow());

      await act(async () => {
        await result.current.handleAttendanceCompletion(2);
      });

      expect(consoleSpy).toHaveBeenCalledWith('No attendance data available');
      expect(mockUpdateAttendanceStatus).not.toHaveBeenCalled();
    });

    it('should handle null attendancesByDate when rescheduling attendance', async () => {
      const { result } = renderHook(() => useAttendanceWorkflow());

      await act(async () => {
        await result.current.handleAttendanceReschedule(2);
      });

      expect(consoleSpy).toHaveBeenCalledWith('No attendance data available');
      expect(mockUpdateAttendanceStatus).not.toHaveBeenCalled();
    });

    it('should successfully complete attendance when found in incomplete attendances', async () => {
      const mockAttendancesByDate = {
        '2024-01-15': [
          { attendanceId: 123, status: 'in_progress', patientName: 'Test Patient' }
        ]
      };
      const mockContext = {
        ...defaultMockContext,
        attendancesByDate: mockAttendancesByDate,
      };
      
      // Mock getIncompleteAttendances to return the attendance
      mockGetIncompleteAttendances.mockReturnValue([
        { 
          attendanceId: 123, 
          name: 'Test Patient',
          priority: '3',
          attendanceType: 'spiritual'
        }
      ]);
      
      (mockUseAttendanceManagement as jest.Mock).mockReturnValue(mockContext);

      const { result } = renderHook(() => useAttendanceWorkflow());

      await act(async () => {
        await result.current.handleAttendanceCompletion(123);
      });

      expect(mockUpdateAttendanceStatus).toHaveBeenCalledWith(123, 'completed');
      expect(mockContext.refreshCurrentDate).toHaveBeenCalled();
      expect(consoleSpy).not.toHaveBeenCalledWith('Attendance not found:', 123);
    });

    it('should handle attendance not found during completion', async () => {
      const mockAttendancesByDate = {
        '2024-01-15': [
          { attendanceId: 999, status: 'in_progress', patientName: 'Test Patient' }
        ]
      };
      const mockContext = {
        ...defaultMockContext,
        attendancesByDate: mockAttendancesByDate,
      };
      
      // Mock getIncompleteAttendances to return empty array (attendance not found)
      mockGetIncompleteAttendances.mockReturnValue([]);
      
      (mockUseAttendanceManagement as jest.Mock).mockReturnValue(mockContext);

      const { result } = renderHook(() => useAttendanceWorkflow());

      await act(async () => {
        await result.current.handleAttendanceCompletion(123);
      });

      expect(consoleSpy).toHaveBeenCalledWith('Attendance not found:', 123);
      expect(mockUpdateAttendanceStatus).not.toHaveBeenCalled();
      expect(mockContext.refreshCurrentDate).not.toHaveBeenCalled();
    });

    it('should handle error during attendance completion', async () => {
      const mockAttendancesByDate = {
        '2024-01-15': [
          { attendanceId: 123, status: 'in_progress', patientName: 'Test Patient' }
        ]
      };
      const mockContext = {
        ...defaultMockContext,
        attendancesByDate: mockAttendancesByDate,
      };
      
      mockGetIncompleteAttendances.mockReturnValue([
        { attendanceId: 123, name: 'Test Patient', priority: '3', attendanceType: 'spiritual' }
      ]);
      
      (mockUseAttendanceManagement as jest.Mock).mockReturnValue(mockContext);
      
      // Mock updateAttendanceStatus to throw an error
      const testError = new Error('Update failed');
      (mockUpdateAttendanceStatus as jest.Mock).mockRejectedValue(testError);

      const { result } = renderHook(() => useAttendanceWorkflow());

      await expect(async () => {
        await act(async () => {
          await result.current.handleAttendanceCompletion(123);
        });
      }).rejects.toThrow('Update failed');

      expect(consoleSpy).toHaveBeenCalledWith('Error completing attendance:', testError);
      expect(mockContext.refreshCurrentDate).not.toHaveBeenCalled();
    });

    it('should successfully reschedule attendance when found in incomplete attendances', async () => {
      const mockAttendancesByDate = {
        '2024-01-15': [
          { attendanceId: 456, status: 'in_progress', patientName: 'Test Patient' }
        ]
      };
      const mockContext = {
        ...defaultMockContext,
        attendancesByDate: mockAttendancesByDate,
      };
      
      mockGetIncompleteAttendances.mockReturnValue([
        { attendanceId: 456, name: 'Test Patient', priority: '3', attendanceType: 'spiritual' }
      ]);
      
      (mockUseAttendanceManagement as jest.Mock).mockReturnValue(mockContext);

      const { result } = renderHook(() => useAttendanceWorkflow());

      await act(async () => {
        await result.current.handleAttendanceReschedule(456);
      });

      expect(mockUpdateAttendanceStatus).toHaveBeenCalledWith(456, 'scheduled');
      expect(mockContext.refreshCurrentDate).toHaveBeenCalled();
      expect(consoleSpy).not.toHaveBeenCalledWith('Attendance not found:', 456);
    });

    it('should handle attendance not found during rescheduling', async () => {
      const mockAttendancesByDate = {
        '2024-01-15': [
          { attendanceId: 999, status: 'in_progress', patientName: 'Test Patient' }
        ]
      };
      const mockContext = {
        ...defaultMockContext,
        attendancesByDate: mockAttendancesByDate,
      };
      
      mockGetIncompleteAttendances.mockReturnValue([]);
      
      (mockUseAttendanceManagement as jest.Mock).mockReturnValue(mockContext);

      const { result } = renderHook(() => useAttendanceWorkflow());

      await act(async () => {
        await result.current.handleAttendanceReschedule(456);
      });

      expect(consoleSpy).toHaveBeenCalledWith('Attendance not found:', 456);
      expect(mockUpdateAttendanceStatus).not.toHaveBeenCalled();
      expect(mockContext.refreshCurrentDate).not.toHaveBeenCalled();
    });

    it('should handle error during attendance rescheduling', async () => {
      const mockAttendancesByDate = {
        '2024-01-15': [
          { attendanceId: 456, status: 'in_progress', patientName: 'Test Patient' }
        ]
      };
      const mockContext = {
        ...defaultMockContext,
        attendancesByDate: mockAttendancesByDate,
      };
      
      mockGetIncompleteAttendances.mockReturnValue([
        { attendanceId: 456, name: 'Test Patient', priority: '3', attendanceType: 'spiritual' }
      ]);
      
      (mockUseAttendanceManagement as jest.Mock).mockReturnValue(mockContext);
      
      // Mock updateAttendanceStatus to throw an error
      const testError = new Error('Reschedule failed');
      (mockUpdateAttendanceStatus as jest.Mock).mockRejectedValue(testError);

      const { result } = renderHook(() => useAttendanceWorkflow());

      await expect(async () => {
        await act(async () => {
          await result.current.handleAttendanceReschedule(456);
        });
      }).rejects.toThrow('Reschedule failed');

      expect(consoleSpy).toHaveBeenCalledWith('Error rescheduling attendance:', testError);
      expect(mockContext.refreshCurrentDate).not.toHaveBeenCalled();
    });
  });

  describe('Basic functionality', () => {
    it('should return correct hook interface', () => {
      const { result } = renderHook(() => useAttendanceWorkflow());

      expect(result.current).toHaveProperty('collapsed');
      expect(result.current).toHaveProperty('isDayFinalized');
      expect(result.current).toHaveProperty('finalizeDay');
      expect(result.current).toHaveProperty('unFinalizeDay');
      expect(result.current).toHaveProperty('toggleCollapsed');
      expect(result.current).toHaveProperty('handleAttendanceCompletion');
      expect(result.current).toHaveProperty('handleAttendanceReschedule');

      expect(typeof result.current.finalizeDay).toBe('function');
      expect(typeof result.current.unFinalizeDay).toBe('function');
      expect(typeof result.current.toggleCollapsed).toBe('function');
      expect(typeof result.current.handleAttendanceCompletion).toBe('function');
      expect(typeof result.current.handleAttendanceReschedule).toBe('function');
    });
  });
});
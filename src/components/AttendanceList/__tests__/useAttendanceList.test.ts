import { renderHook, act } from '@testing-library/react';
import { useAttendanceList } from '../useAttendanceList';
import { useAttendances } from '@/contexts/AttendancesContext';
import { IPriority } from '@/types/globals';

// Mock the AttendancesContext
jest.mock('@/contexts/AttendancesContext');
const mockUseAttendances = useAttendances as jest.MockedFunction<typeof useAttendances>;

// Factory function to create fresh mock data for each test
const createMockAttendancesByDate = () => ({
  date: new Date('2025-01-15'),
  spiritual: {
    scheduled: [
      { name: 'John Doe', priority: '1' as IPriority, checkedInTime: null, onGoingTime: null, completedTime: null },
      { name: 'Jane Smith', priority: '2' as IPriority, checkedInTime: null, onGoingTime: null, completedTime: null },
    ],
    checkedIn: [
      { name: 'Bob Johnson', priority: '3' as IPriority, checkedInTime: new Date('2025-01-15T10:30:00Z'), onGoingTime: null, completedTime: null },
    ],
    onGoing: [
      { name: 'Alice Brown', priority: '1' as IPriority, checkedInTime: new Date('2025-01-15T09:00:00Z'), onGoingTime: new Date('2025-01-15T09:30:00Z'), completedTime: null },
    ],
    completed: [
      { name: 'Charlie Wilson', priority: '2' as IPriority, checkedInTime: new Date('2025-01-15T08:00:00Z'), onGoingTime: new Date('2025-01-15T08:30:00Z'), completedTime: new Date('2025-01-15T09:00:00Z') },
    ],
  },
  lightBath: {
    scheduled: [
      { name: 'David Miller', priority: '1' as IPriority, checkedInTime: null, onGoingTime: null, completedTime: null },
    ],
    checkedIn: [],
    onGoing: [],
    completed: [],
  },
});

describe('useAttendanceList', () => {
  // Helper function to create fresh context for each test
  const createFreshMockContext = () => {
    const freshData = createMockAttendancesByDate();
    return {
      selectedDate: '2025-01-15',
      setSelectedDate: jest.fn(),
      attendancesByDate: freshData,
      setAttendancesByDate: jest.fn(),
      loading: false,
      dataLoading: false,
      error: null,
      loadAttendancesByDate: jest.fn(),
      bulkUpdateStatus: jest.fn(),
      initializeSelectedDate: jest.fn(),
      refreshCurrentDate: jest.fn(),
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should initialize with default state', () => {
      const mockContext = createFreshMockContext();
      mockUseAttendances.mockReturnValue(mockContext);

      const { result } = renderHook(() => useAttendanceList());

      expect(result.current.selectedDate).toBe('2025-01-15');
      expect(result.current.attendancesByDate).toEqual(mockContext.attendancesByDate);
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe(null);
      expect(result.current.dragged).toBe(null);
      expect(result.current.confirmOpen).toBe(false);
      expect(result.current.multiSectionModalOpen).toBe(false);
      expect(result.current.collapsed).toEqual({ spiritual: false, lightBath: false });
    });

    it('should handle loading state', () => {
      const mockContext = createFreshMockContext();
      mockUseAttendances.mockReturnValue({
        ...mockContext,
        loading: true
      });

      const { result } = renderHook(() => useAttendanceList());
      expect(result.current.loading).toBe(true);
    });

    it('should handle error state', () => {
      const mockContext = createFreshMockContext();
      const errorMessage = 'Failed to load attendances';
      mockUseAttendances.mockReturnValue({
        ...mockContext,
        error: errorMessage
      });

      const { result } = renderHook(() => useAttendanceList());
      expect(result.current.error).toBe(errorMessage);
    });
  });

  describe('getPatients', () => {
    it('should return patients for specific type and status', () => {
      const mockContext = createFreshMockContext();
      mockUseAttendances.mockReturnValue(mockContext);

      const { result } = renderHook(() => useAttendanceList());

      const scheduledSpiritual = result.current.getPatients('spiritual', 'scheduled');
      expect(scheduledSpiritual).toHaveLength(2);
      expect(scheduledSpiritual[0].name).toBe('John Doe');

      const checkedInSpiritual = result.current.getPatients('spiritual', 'checkedIn');
      expect(checkedInSpiritual).toHaveLength(1);
      expect(checkedInSpiritual[0].name).toBe('Bob Johnson');
    });

    it('should return empty array when no attendancesByDate', () => {
      const mockContext = createFreshMockContext();
      mockUseAttendances.mockReturnValue({
        ...mockContext,
        attendancesByDate: null
      });

      const { result } = renderHook(() => useAttendanceList());
      const patients = result.current.getPatients('spiritual', 'scheduled');
      expect(patients).toEqual([]);
    });

    it('should return empty array for non-existent status', () => {
      const mockContext = createFreshMockContext();
      mockUseAttendances.mockReturnValue(mockContext);

      const { result } = renderHook(() => useAttendanceList());
      const patients = result.current.getPatients('lightBath', 'checkedIn');
      expect(patients).toEqual([]);
    });
  });

  describe('Drag and Drop functionality', () => {
    it('should handle drag start', () => {
      const mockContext = createFreshMockContext();
      mockUseAttendances.mockReturnValue(mockContext);

      const { result } = renderHook(() => useAttendanceList());

      act(() => {
        result.current.handleDragStart('spiritual', 0, 'scheduled');
      });

      expect(result.current.dragged).toEqual({
        type: 'spiritual',
        status: 'scheduled',
        idx: 0,
        name: 'John Doe'
      });
    });

    it('should handle drag end', () => {
      const mockContext = createFreshMockContext();
      mockUseAttendances.mockReturnValue(mockContext);

      const { result } = renderHook(() => useAttendanceList());

      act(() => {
        result.current.handleDragStart('spiritual', 0, 'scheduled');
      });

      expect(result.current.dragged).not.toBe(null);

      act(() => {
        result.current.handleDragEnd();
      });

      expect(result.current.dragged).toBe(null);
    });

    it('should handle drop with confirmation for different types', () => {
      const mockContext = createFreshMockContext();
      mockUseAttendances.mockReturnValue(mockContext);

      const { result } = renderHook(() => useAttendanceList());

      act(() => {
        result.current.handleDragStart('spiritual', 0, 'scheduled');
      });

      act(() => {
        result.current.handleDropWithConfirm('lightBath', 'checkedIn');
      });

      // Different types are now prevented, so dragged should be cleared
      expect(result.current.confirmOpen).toBe(false);
      expect(result.current.pendingDrop).toBe(null);
      expect(result.current.dragged).toBe(null);
    });

    it('should handle multi-section modal for same type different status', () => {
      const mockContext = createFreshMockContext();
      // Add the same patient to both spiritual and lightBath scheduled lists
      const johnDoeAttendance = { name: 'John Doe', priority: '1' as IPriority, checkedInTime: null, onGoingTime: null, completedTime: null };
      mockContext.attendancesByDate = {
        ...mockContext.attendancesByDate!,
        lightBath: {
          ...mockContext.attendancesByDate!.lightBath,
          scheduled: [johnDoeAttendance] // Same patient in both types
        }
      };
      mockUseAttendances.mockReturnValue(mockContext);

      const { result } = renderHook(() => useAttendanceList());

      act(() => {
        result.current.handleDragStart('spiritual', 0, 'scheduled');
      });

      act(() => {
        result.current.handleDropWithConfirm('spiritual', 'checkedIn');
      });

      expect(result.current.multiSectionModalOpen).toBe(true);
      expect(result.current.multiSectionPending).toEqual({
        name: 'John Doe',
        fromStatus: 'scheduled',
        toStatus: 'checkedIn',
        draggedType: 'spiritual'
      });
    });

    it('should handle invalid drag index', () => {
      const mockContext = createFreshMockContext();
      mockUseAttendances.mockReturnValue(mockContext);

      const { result } = renderHook(() => useAttendanceList());

      // Mock console.error to suppress error output in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      act(() => {
        result.current.handleDragStart('spiritual', 999, 'scheduled');
      });

      // Should not crash and dragged should remain null due to invalid index
      expect(result.current.dragged).toBe(null);

      act(() => {
        result.current.handleDropWithConfirm('lightBath', 'checkedIn');
      });

      expect(result.current.confirmOpen).toBe(false);
      expect(result.current.pendingDrop).toBe(null);

      consoleSpy.mockRestore();
    });
  });

  describe('Modal handlers', () => {
    it('should handle same type move without modal', () => {
      const mockContext = createFreshMockContext();
      mockUseAttendances.mockReturnValue(mockContext);

      const { result } = renderHook(() => useAttendanceList());

      // Setup drag and drop for same type move
      act(() => {
        result.current.handleDragStart('spiritual', 0, 'scheduled');
      });

      act(() => {
        result.current.handleDropWithConfirm('spiritual', 'onGoing');
      });

      // Same type moves happen directly without modal
      expect(result.current.confirmOpen).toBe(false);
      expect(result.current.pendingDrop).toBe(null);
      expect(result.current.dragged).toBe(null);
    });

    it('should handle cancel action', () => {
      const mockContext = createFreshMockContext();
      // Set up patient in both types to trigger multi-section modal
      const johnDoeAttendance = { name: 'John Doe', priority: '1' as IPriority, checkedInTime: null, onGoingTime: null, completedTime: null };
      mockContext.attendancesByDate = {
        ...mockContext.attendancesByDate!,
        lightBath: {
          ...mockContext.attendancesByDate!.lightBath,
          scheduled: [johnDoeAttendance]
        }
      };
      mockUseAttendances.mockReturnValue(mockContext);

      const { result } = renderHook(() => useAttendanceList());

      act(() => {
        result.current.handleDragStart('spiritual', 0, 'scheduled');
      });

      act(() => {
        result.current.handleDropWithConfirm('spiritual', 'checkedIn');
      });

      // Should open multi-section modal
      expect(result.current.multiSectionModalOpen).toBe(true);

      act(() => {
        result.current.handleMultiSectionCancel();
      });

      expect(result.current.multiSectionModalOpen).toBe(false);
      expect(result.current.multiSectionPending).toBe(null);
      expect(result.current.dragged).toBe(null);
    });

    it('should handle multi-section confirm', () => {
      const mockContext = createFreshMockContext();
      // Set up patient in both types to trigger multi-section modal
      const johnDoeAttendance = { name: 'John Doe', priority: '1' as IPriority, checkedInTime: null, onGoingTime: null, completedTime: null };
      mockContext.attendancesByDate = {
        ...mockContext.attendancesByDate!,
        lightBath: {
          ...mockContext.attendancesByDate!.lightBath,
          scheduled: [johnDoeAttendance]
        }
      };
      mockUseAttendances.mockReturnValue(mockContext);

      const { result } = renderHook(() => useAttendanceList());

      act(() => {
        result.current.handleDragStart('spiritual', 0, 'scheduled');
      });

      act(() => {
        result.current.handleDropWithConfirm('spiritual', 'checkedIn');
      });

      // Should open multi-section modal
      expect(result.current.multiSectionModalOpen).toBe(true);

      act(() => {
        result.current.handleMultiSectionConfirm();
      });

      expect(result.current.multiSectionModalOpen).toBe(false);
      expect(result.current.multiSectionPending).toBe(null);
      expect(result.current.dragged).toBe(null);
    });

    it('should handle multi-section cancel', () => {
      const mockContext = createFreshMockContext();
      // Set up patient in both types to trigger multi-section modal
      const johnDoeAttendance = { name: 'John Doe', priority: '1' as IPriority, checkedInTime: null, onGoingTime: null, completedTime: null };
      mockContext.attendancesByDate = {
        ...mockContext.attendancesByDate!,
        lightBath: {
          ...mockContext.attendancesByDate!.lightBath,
          scheduled: [johnDoeAttendance]
        }
      };
      mockUseAttendances.mockReturnValue(mockContext);

      const { result } = renderHook(() => useAttendanceList());

      act(() => {
        result.current.handleDragStart('spiritual', 0, 'scheduled');
      });

      act(() => {
        result.current.handleDropWithConfirm('spiritual', 'checkedIn');
      });

      // Should open multi-section modal
      expect(result.current.multiSectionModalOpen).toBe(true);

      act(() => {
        result.current.handleMultiSectionCancel();
      });

      expect(result.current.multiSectionModalOpen).toBe(false);
      expect(result.current.multiSectionPending).toBe(null);
      expect(result.current.dragged).toBe(null);
    });
  });

  describe('Collapse functionality', () => {
    it('should toggle collapsed state for spiritual', () => {
      const mockContext = createFreshMockContext();
      mockUseAttendances.mockReturnValue(mockContext);

      const { result } = renderHook(() => useAttendanceList());

      expect(result.current.collapsed.spiritual).toBe(false);

      act(() => {
        result.current.toggleCollapsed('spiritual');
      });

      expect(result.current.collapsed.spiritual).toBe(true);

      act(() => {
        result.current.toggleCollapsed('spiritual');
      });

      expect(result.current.collapsed.spiritual).toBe(false);
    });

    it('should toggle collapsed state for lightBath', () => {
      const mockContext = createFreshMockContext();
      mockUseAttendances.mockReturnValue(mockContext);

      const { result } = renderHook(() => useAttendanceList());

      expect(result.current.collapsed.lightBath).toBe(false);

      act(() => {
        result.current.toggleCollapsed('lightBath');
      });

      expect(result.current.collapsed.lightBath).toBe(true);
    });
  });

  describe('External check-in functionality', () => {
    it('should process external check-in', () => {
      // Create completely fresh mock data for this test
      const freshMockData = createMockAttendancesByDate();
      const freshMockContext = {
        selectedDate: '2025-01-15',
        setSelectedDate: jest.fn(),
        attendancesByDate: freshMockData,
        setAttendancesByDate: jest.fn(),
        loading: false,
        dataLoading: false,
        error: null,
        loadAttendancesByDate: jest.fn(),
        bulkUpdateStatus: jest.fn(),
        initializeSelectedDate: jest.fn(),
        refreshCurrentDate: jest.fn(),
      };
      mockUseAttendances.mockReturnValue(freshMockContext);

      const mockOnCheckInProcessed = jest.fn();
      const externalCheckIn = {
        name: 'Novo Paciente',
        types: ['spiritual'],
        isNew: true,
        priority: '2' as IPriority
      };

      const { result } = renderHook(() => 
        useAttendanceList({ 
          externalCheckIn, 
          onCheckInProcessed: mockOnCheckInProcessed 
        })
      );

      // The effect should have run and added the patient
      const checkedInPatients = result.current.getPatients('spiritual', 'checkedIn');
      expect(checkedInPatients).toHaveLength(2); // Original + new one
      expect(checkedInPatients.some(p => p.name === 'Novo Paciente')).toBe(true);
    });

    it('should handle multiple types in external check-in', () => {
      // Create completely fresh mock data for this test
      const freshMockData = createMockAttendancesByDate();
      const freshMockContext = {
        selectedDate: '2025-01-15',
        setSelectedDate: jest.fn(),
        attendancesByDate: freshMockData,
        setAttendancesByDate: jest.fn(),
        loading: false,
        dataLoading: false,
        error: null,
        loadAttendancesByDate: jest.fn(),
        bulkUpdateStatus: jest.fn(),
        initializeSelectedDate: jest.fn(),
        refreshCurrentDate: jest.fn(),
      };
      mockUseAttendances.mockReturnValue(freshMockContext);

      const externalCheckIn = {
        name: 'Paciente Multi',
        types: ['spiritual', 'lightBath'],
        isNew: false,
        priority: '1' as IPriority
      };

      const { result } = renderHook(() => 
        useAttendanceList({ externalCheckIn })
      );

      // Should be added to both spiritual and lightBath checkedIn
      const spiritualCheckedIn = result.current.getPatients('spiritual', 'checkedIn');
      const lightBathCheckedIn = result.current.getPatients('lightBath', 'checkedIn');
      
      expect(spiritualCheckedIn.some(p => p.name === 'Paciente Multi')).toBe(true);
      expect(lightBathCheckedIn.some(p => p.name === 'Paciente Multi')).toBe(true);
    });

    it('should not duplicate external check-in processing', () => {
      // Create completely fresh mock data for this test
      const freshMockData = createMockAttendancesByDate();
      const freshMockContext = {
        selectedDate: '2025-01-15',
        setSelectedDate: jest.fn(),
        attendancesByDate: freshMockData,
        setAttendancesByDate: jest.fn(),
        loading: false,
        dataLoading: false,
        error: null,
        loadAttendancesByDate: jest.fn(),
        bulkUpdateStatus: jest.fn(),
        initializeSelectedDate: jest.fn(),
        refreshCurrentDate: jest.fn(),
      };
      mockUseAttendances.mockReturnValue(freshMockContext);

      const externalCheckIn = {
        name: 'Bob Johnson', // Already exists in checkedIn
        types: ['spiritual'],
        isNew: false,
        priority: '2' as IPriority
      };

      const { result } = renderHook(() => 
        useAttendanceList({ externalCheckIn })
      );

      const checkedInPatients = result.current.getPatients('spiritual', 'checkedIn');
      const bobPatients = checkedInPatients.filter(p => p.name === 'Bob Johnson');
      expect(bobPatients).toHaveLength(1); // Should not duplicate
    });

    it('should handle invalid external check-in types', () => {
      // Create completely fresh mock data for this test
      const freshMockData = createMockAttendancesByDate();
      const freshMockContext = {
        selectedDate: '2025-01-15',
        setSelectedDate: jest.fn(),
        attendancesByDate: freshMockData,
        setAttendancesByDate: jest.fn(),
        loading: false,
        dataLoading: false,
        error: null,
        loadAttendancesByDate: jest.fn(),
        bulkUpdateStatus: jest.fn(),
        initializeSelectedDate: jest.fn(),
        refreshCurrentDate: jest.fn(),
      };
      mockUseAttendances.mockReturnValue(freshMockContext);

      const externalCheckIn = {
        name: 'Test Patient',
        types: [], // Empty types
        isNew: true,
        priority: '1' as IPriority
      };

      const { result } = renderHook(() => 
        useAttendanceList({ externalCheckIn })
      );

      // Should not crash and should not add patient anywhere
      const spiritualCheckedIn = result.current.getPatients('spiritual', 'checkedIn');
      const lightBathCheckedIn = result.current.getPatients('lightBath', 'checkedIn');
      
      expect(spiritualCheckedIn.some(p => p.name === 'Test Patient')).toBe(false);
      expect(lightBathCheckedIn.some(p => p.name === 'Test Patient')).toBe(false);
    });
  });

  describe('Edge cases', () => {
    it('should handle null attendancesByDate gracefully', () => {
      const mockContext = createFreshMockContext();
      mockUseAttendances.mockReturnValue({
        ...mockContext,
        attendancesByDate: null
      });

      const { result } = renderHook(() => useAttendanceList());

      // Mock console.error to suppress error output in tests
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      act(() => {
        result.current.handleDragStart('spiritual', 0, 'scheduled');
        result.current.handleDropWithConfirm('lightBath', 'checkedIn');
      });

      // Should not crash and should handle gracefully
      expect(result.current.confirmOpen).toBe(false);
      expect(result.current.dragged).toBe(null);

      consoleSpy.mockRestore();
    });

    it('should handle drag without dragged item', () => {
      const mockContext = createFreshMockContext();
      mockUseAttendances.mockReturnValue(mockContext);

      const { result } = renderHook(() => useAttendanceList());

      act(() => {
        result.current.handleDropWithConfirm('lightBath', 'checkedIn');
      });

      expect(result.current.confirmOpen).toBe(false);
      expect(result.current.pendingDrop).toBe(null);
    });

    it('should handle confirm without pending drop', () => {
      const mockContext = createFreshMockContext();
      mockUseAttendances.mockReturnValue(mockContext);

      const { result } = renderHook(() => useAttendanceList());

      act(() => {
        result.current.handleConfirm();
      });

      // Should not crash
      expect(result.current.confirmOpen).toBe(false);
    });

    it('should handle multi-section confirm without pending', () => {
      const mockContext = createFreshMockContext();
      mockUseAttendances.mockReturnValue(mockContext);

      const { result } = renderHook(() => useAttendanceList());

      act(() => {
        result.current.handleMultiSectionConfirm();
      });

      // Should not crash
      expect(result.current.multiSectionModalOpen).toBe(false);
    });
  });

  describe('Time updates during drag and drop', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date('2025-01-15T15:30:00Z'));
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should update checkedInTime when moving to checkedIn status', () => {
      // Create completely fresh mock data for this test
      const freshMockData = createMockAttendancesByDate();
      const freshMockContext = {
        selectedDate: '2025-01-15',
        setSelectedDate: jest.fn(),
        attendancesByDate: freshMockData,
        setAttendancesByDate: jest.fn(),
        loading: false,
        dataLoading: false,
        error: null,
        loadAttendancesByDate: jest.fn(),
        bulkUpdateStatus: jest.fn(),
        initializeSelectedDate: jest.fn(),
        refreshCurrentDate: jest.fn(),
      };
      mockUseAttendances.mockReturnValue(freshMockContext);

      const { result } = renderHook(() => useAttendanceList());

      // Verify initial state
      expect(result.current.getPatients('lightBath', 'checkedIn')).toHaveLength(0);
      expect(result.current.getPatients('spiritual', 'scheduled')).toHaveLength(2);

      act(() => {
        result.current.handleDragStart('spiritual', 0, 'scheduled');
      });

      // Verify drag state is set correctly
      expect(result.current.dragged).toEqual({
        type: 'spiritual',
        status: 'scheduled',
        idx: 0,
        name: 'John Doe'
      });

      // Test same type move instead of different type (which is now prevented)
      act(() => {
        result.current.handleDropWithConfirm('spiritual', 'checkedIn');
      });

      // Should move directly without confirmation for same type
      expect(result.current.confirmOpen).toBe(false);
      expect(result.current.dragged).toBe(null);
    });

    it('should update onGoingTime when moving to onGoing status', () => {
      // Create completely fresh mock data for this test
      const freshMockData = createMockAttendancesByDate();
      const freshMockContext = {
        selectedDate: '2025-01-15',
        setSelectedDate: jest.fn(),
        attendancesByDate: freshMockData,
        setAttendancesByDate: jest.fn(),
        loading: false,
        dataLoading: false,
        error: null,
        loadAttendancesByDate: jest.fn(),
        bulkUpdateStatus: jest.fn(),
        initializeSelectedDate: jest.fn(),
        refreshCurrentDate: jest.fn(),
      };
      mockUseAttendances.mockReturnValue(freshMockContext);

      const { result } = renderHook(() => useAttendanceList());

      // Verify initial state
      expect(result.current.getPatients('spiritual', 'onGoing')).toHaveLength(1);
      expect(result.current.getPatients('spiritual', 'scheduled')).toHaveLength(2);

      act(() => {
        result.current.handleDragStart('spiritual', 0, 'scheduled');
      });

      // Verify drag state is set correctly
      expect(result.current.dragged).toEqual({
        type: 'spiritual',
        status: 'scheduled',
        idx: 0,
        name: 'John Doe'
      });

      // Test same type move from scheduled to onGoing
      act(() => {
        result.current.handleDropWithConfirm('spiritual', 'onGoing');
      });

      // Should move directly without confirmation for same type
      expect(result.current.confirmOpen).toBe(false);
      expect(result.current.dragged).toBe(null);
    });

    it('should update completedTime when moving to completed status', () => {
      // Create completely fresh mock data for this test
      const freshMockData = createMockAttendancesByDate();
      const freshMockContext = {
        selectedDate: '2025-01-15',
        setSelectedDate: jest.fn(),
        attendancesByDate: freshMockData,
        setAttendancesByDate: jest.fn(),
        loading: false,
        dataLoading: false,
        error: null,
        loadAttendancesByDate: jest.fn(),
        bulkUpdateStatus: jest.fn(),
        initializeSelectedDate: jest.fn(),
        refreshCurrentDate: jest.fn(),
      };
      mockUseAttendances.mockReturnValue(freshMockContext);

      const { result } = renderHook(() => useAttendanceList());

      // Verify initial state
      expect(result.current.getPatients('spiritual', 'completed')).toHaveLength(1);
      expect(result.current.getPatients('spiritual', 'scheduled')).toHaveLength(2);

      act(() => {
        result.current.handleDragStart('spiritual', 0, 'scheduled');
      });

      // Verify drag state is set correctly
      expect(result.current.dragged).toEqual({
        type: 'spiritual',
        status: 'scheduled',
        idx: 0,
        name: 'John Doe'
      });

      // Test same type move from scheduled to completed
      act(() => {
        result.current.handleDropWithConfirm('spiritual', 'completed');
      });

      // Should move directly without confirmation for same type
      expect(result.current.confirmOpen).toBe(false);
      expect(result.current.dragged).toBe(null);
    });
  });
});

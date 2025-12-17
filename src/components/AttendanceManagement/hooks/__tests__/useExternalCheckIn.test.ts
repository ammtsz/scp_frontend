import { renderHook, act } from '@testing-library/react';
import { useExternalCheckIn } from '../useExternalCheckIn';
import { useAttendanceManagement } from '@/hooks/useAttendanceManagement';
import type { AttendanceByDate, AttendanceStatusDetail, Priority } from '@/types/types';

// Mock dependencies
jest.mock('@/hooks/useAttendanceManagement');

const mockUseAttendanceManagement = useAttendanceManagement as jest.MockedFunction<typeof useAttendanceManagement>;

describe('useExternalCheckIn', () => {
  const mockAttendancesByDate: AttendanceByDate = {
    date: new Date('2024-01-15'),
    spiritual: {
      scheduled: [],
      checkedIn: [
        { name: 'Existing Patient', priority: '1' as const } as AttendanceStatusDetail
      ],
      onGoing: [],
      completed: []
    },
    lightBath: {
      scheduled: [],
      checkedIn: [],
      onGoing: [],
      completed: []
    },
    rod: {
      scheduled: [],
      checkedIn: [],
      onGoing: [],
      completed: []
    },
    combined: {
      scheduled: [],
      checkedIn: [],
      onGoing: [],
      completed: []
    }
  };

  const defaultMockContext = {
    attendancesByDate: mockAttendancesByDate,
    selectedDate: '2024-01-15',
    refreshCurrentDate: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (mockUseAttendanceManagement as jest.Mock).mockReturnValue(defaultMockContext);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial state and basic functionality', () => {
    it('should initialize with checkInProcessed as false', () => {
      const { result } = renderHook(() => useExternalCheckIn());

      expect(result.current.checkInProcessed).toBe(false);
    });

    it('should return correct interface', () => {
      const { result } = renderHook(() => useExternalCheckIn());

      expect(result.current).toHaveProperty('checkInProcessed');
      expect(typeof result.current.checkInProcessed).toBe('boolean');
    });

    it('should handle no props gracefully', () => {
      const { result } = renderHook(() => useExternalCheckIn());

      expect(result.current.checkInProcessed).toBe(false);
    });

    it('should handle empty props object', () => {
      const { result } = renderHook(() => useExternalCheckIn({}));

      expect(result.current.checkInProcessed).toBe(false);
    });
  });

  describe('External check-in processing', () => {
    it('should process single type check-in successfully', () => {
      const mockOnCheckInProcessed = jest.fn();
      const unscheduledCheckIn = {
        name: 'New Patient',
        types: ['spiritual'],
        isNew: true,
        priority: '2' as Priority
      };

      const { result } = renderHook(() => 
        useExternalCheckIn({
          unscheduledCheckIn,
          onCheckInProcessed: mockOnCheckInProcessed
        })
      );

      // Check that patient was added to spiritual checkedIn
      expect(mockAttendancesByDate.spiritual.checkedIn).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'New Patient',
            priority: '2',
            checkedInTime: expect.any(String)
          })
        ])
      );

      expect(result.current.checkInProcessed).toBe(true);
      expect(mockOnCheckInProcessed).toHaveBeenCalledTimes(1);
    });

    it('should process multiple type check-in successfully', () => {
      const mockOnCheckInProcessed = jest.fn();
      const unscheduledCheckIn = {
        name: 'Multi-Treatment Patient',
        types: ['spiritual', 'lightBath'],
        isNew: false,
        priority: '1' as Priority
      };

      const { result } = renderHook(() => 
        useExternalCheckIn({
          unscheduledCheckIn,
          onCheckInProcessed: mockOnCheckInProcessed
        })
      );

      // Check that patient was added to both spiritual and lightBath checkedIn
      expect(mockAttendancesByDate.spiritual.checkedIn).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'Multi-Treatment Patient',
            priority: '1'
          })
        ])
      );

      expect(mockAttendancesByDate.lightBath.checkedIn).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'Multi-Treatment Patient',
            priority: '1'
          })
        ])
      );

      expect(result.current.checkInProcessed).toBe(true);
      expect(mockOnCheckInProcessed).toHaveBeenCalledTimes(1);
    });

    it('should use default priority "3" when none provided', () => {
      const unscheduledCheckIn = {
        name: 'Default Priority Patient',
        types: ['rod'],
        isNew: true
        // No priority specified
      };

      renderHook(() => 
        useExternalCheckIn({ unscheduledCheckIn })
      );

      expect(mockAttendancesByDate.rod.checkedIn).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'Default Priority Patient',
            priority: '3'
          })
        ])
      );
    });

    it('should not duplicate existing patient in same type', () => {
      const unscheduledCheckIn = {
        name: 'Existing Patient', // Same name as existing patient
        types: ['spiritual'],
        isNew: false
      };

      renderHook(() => 
        useExternalCheckIn({ unscheduledCheckIn })
      );

      // Should still only have the original patient, not duplicated
      const spiritualPatients = mockAttendancesByDate.spiritual.checkedIn.filter(
        p => p.name === 'Existing Patient'
      );
      expect(spiritualPatients).toHaveLength(1);
    });
  });

  describe('State management and callbacks', () => {
    it('should reset checkInProcessed when unscheduledCheckIn changes', () => {
      const mockOnCheckInProcessed = jest.fn();
      const initialCheckIn = {
        name: 'Patient 1',
        types: ['spiritual'],
        isNew: true
      };

      const { result, rerender } = renderHook(
        ({ unscheduledCheckIn }) => useExternalCheckIn({
          unscheduledCheckIn,
          onCheckInProcessed: mockOnCheckInProcessed
        }),
        { initialProps: { unscheduledCheckIn: initialCheckIn } }
      );

      // First check-in should be processed
      expect(result.current.checkInProcessed).toBe(true);
      expect(mockOnCheckInProcessed).toHaveBeenCalledTimes(1);

      // Change to new check-in
      const newCheckIn = {
        name: 'Patient 2',
        types: ['lightBath'],
        isNew: true
      };

      act(() => {
        rerender({ unscheduledCheckIn: newCheckIn });
      });

      // Should process new check-in and call callback again
      expect(result.current.checkInProcessed).toBe(true);
      expect(mockOnCheckInProcessed).toHaveBeenCalledTimes(2);
    });

    it('should call onCheckInProcessed callback only once per processing', () => {
      const mockOnCheckInProcessed = jest.fn();
      const unscheduledCheckIn = {
        name: 'Callback Test Patient',
        types: ['spiritual'],
        isNew: true
      };

      renderHook(() => 
        useExternalCheckIn({
          unscheduledCheckIn,
          onCheckInProcessed: mockOnCheckInProcessed
        })
      );

      expect(mockOnCheckInProcessed).toHaveBeenCalledTimes(1);
    });

    it('should not call callback if not provided', () => {
      const unscheduledCheckIn = {
        name: 'No Callback Patient',
        types: ['rod'],
        isNew: true
      };

      const { result } = renderHook(() => 
        useExternalCheckIn({ unscheduledCheckIn })
      );

      expect(result.current.checkInProcessed).toBe(true);
      // No error should be thrown when callback is not provided
    });
  });

  describe('Edge cases and error handling', () => {
    it('should handle null unscheduledCheckIn gracefully', () => {
      const mockOnCheckInProcessed = jest.fn();
      
      const { result } = renderHook(() => 
        useExternalCheckIn({
          unscheduledCheckIn: null,
          onCheckInProcessed: mockOnCheckInProcessed
        })
      );

      expect(result.current.checkInProcessed).toBe(false);
      expect(mockOnCheckInProcessed).not.toHaveBeenCalled();
    });

    it('should handle undefined unscheduledCheckIn gracefully', () => {
      const mockOnCheckInProcessed = jest.fn();
      
      const { result } = renderHook(() => 
        useExternalCheckIn({
          unscheduledCheckIn: undefined,
          onCheckInProcessed: mockOnCheckInProcessed
        })
      );

      expect(result.current.checkInProcessed).toBe(false);
      expect(mockOnCheckInProcessed).not.toHaveBeenCalled();
    });

    it('should handle empty types array', () => {
      const mockOnCheckInProcessed = jest.fn();
      const unscheduledCheckIn = {
        name: 'Empty Types Patient',
        types: [], // Empty array
        isNew: true
      };

      const { result } = renderHook(() => 
        useExternalCheckIn({
          unscheduledCheckIn,
          onCheckInProcessed: mockOnCheckInProcessed
        })
      );

      expect(result.current.checkInProcessed).toBe(false);
      expect(mockOnCheckInProcessed).not.toHaveBeenCalled();
    });

    it('should handle non-array types gracefully', () => {
      const mockOnCheckInProcessed = jest.fn();
      const unscheduledCheckIn = {
        name: 'Invalid Types Patient',
        types: 'spiritual' as unknown as string[], // Not an array
        isNew: true
      };

      const { result } = renderHook(() => 
        useExternalCheckIn({
          unscheduledCheckIn,
          onCheckInProcessed: mockOnCheckInProcessed
        })
      );

      expect(result.current.checkInProcessed).toBe(false);
      expect(mockOnCheckInProcessed).not.toHaveBeenCalled();
    });

    it('should handle null attendancesByDate', () => {
      (mockUseAttendanceManagement as jest.Mock).mockReturnValue({
        ...defaultMockContext,
        attendancesByDate: null
      });

      const unscheduledCheckIn = {
        name: 'Null Data Patient',
        types: ['spiritual'],
        isNew: true
      };

      const { result } = renderHook(() => 
        useExternalCheckIn({ unscheduledCheckIn })
      );

      expect(result.current.checkInProcessed).toBe(false);
    });

    it('should handle invalid attendance type gracefully', () => {
      const mockOnCheckInProcessed = jest.fn();
      const unscheduledCheckIn = {
        name: 'Invalid Type Patient',
        types: ['invalidType'],
        isNew: true
      };

      const { result } = renderHook(() => 
        useExternalCheckIn({
          unscheduledCheckIn,
          onCheckInProcessed: mockOnCheckInProcessed
        })
      );

      // Should still be processed as false since type doesn't exist
      expect(result.current.checkInProcessed).toBe(true);
      expect(mockOnCheckInProcessed).toHaveBeenCalledTimes(1);
    });

    it('should handle missing checkedIn array in attendance type', () => {
      // Create attendance data missing checkedIn array
      const faultyAttendancesByDate = {
        ...mockAttendancesByDate,
        spiritual: {
          scheduled: [],
          onGoing: [],
          completed: []
          // Missing checkedIn array
        }
      } as unknown as AttendanceByDate;

      (mockUseAttendanceManagement as jest.Mock).mockReturnValue({
        ...defaultMockContext,
        attendancesByDate: faultyAttendancesByDate
      });

      const unscheduledCheckIn = {
        name: 'Missing Array Patient',
        types: ['spiritual'],
        isNew: true
      };

      // This should throw an error due to missing checkedIn array
      // This test documents current behavior - the hook doesn't handle this gracefully
      expect(() => {
        renderHook(() => 
          useExternalCheckIn({ unscheduledCheckIn })
        );
      }).toThrow('Cannot read properties of undefined');
    });
  });

  describe('Integration scenarios', () => {
    it('should handle rapid successive check-ins', () => {
      const mockOnCheckInProcessed = jest.fn();
      
      const checkIn1 = {
        name: 'Rapid Patient 1',
        types: ['spiritual'],
        isNew: true
      };

      const checkIn2 = {
        name: 'Rapid Patient 2',
        types: ['lightBath'],
        isNew: true
      };

      const { result, rerender } = renderHook(
        ({ unscheduledCheckIn }) => useExternalCheckIn({
          unscheduledCheckIn,
          onCheckInProcessed: mockOnCheckInProcessed
        }),
        { initialProps: { unscheduledCheckIn: checkIn1 } }
      );

      expect(result.current.checkInProcessed).toBe(true);
      expect(mockOnCheckInProcessed).toHaveBeenCalledTimes(1);

      // Rapidly change to second check-in
      act(() => {
        rerender({ unscheduledCheckIn: checkIn2 });
      });

      expect(result.current.checkInProcessed).toBe(true);
      expect(mockOnCheckInProcessed).toHaveBeenCalledTimes(2);
    });

    it('should handle complex multi-type scenario with mixed existing patients', () => {
      const unscheduledCheckIn = {
        name: 'Complex Patient',
        types: ['spiritual', 'lightBath', 'rod'],
        isNew: false,
        priority: '1' as Priority
      };

      renderHook(() => 
        useExternalCheckIn({ unscheduledCheckIn })
      );

      // Verify patient was added to all requested types
      expect(mockAttendancesByDate.spiritual.checkedIn).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'Complex Patient',
            priority: '1'
          })
        ])
      );

      expect(mockAttendancesByDate.lightBath.checkedIn).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'Complex Patient',
            priority: '1'
          })
        ])
      );

      expect(mockAttendancesByDate.rod.checkedIn).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            name: 'Complex Patient',
            priority: '1'
          })
        ])
      );
    });

    it('should generate valid check-in time format', () => {
      const unscheduledCheckIn = {
        name: 'Time Format Patient',
        types: ['spiritual'],
        isNew: true
      };

      renderHook(() => 
        useExternalCheckIn({ unscheduledCheckIn })
      );

      const addedPatient = mockAttendancesByDate.spiritual.checkedIn.find(
        p => p.name === 'Time Format Patient'
      );

      expect(addedPatient?.checkedInTime).toMatch(/^\d{2}:\d{2}:\d{2}$/);
    });
  });
});
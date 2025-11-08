import { renderHook, act } from '@testing-library/react';
import { useEndOfDay } from '../useEndOfDay';
import { useAttendanceData } from '../../../hooks/useAttendanceData';
import { useSetDayFinalized } from '@/stores';
import { useHandleAbsenceJustifications } from '@/hooks/useAttendanceQueries';
import { markAttendanceAsMissed } from '@/api/attendances';
import { useCloseModal } from '@/stores/modalStore';
import * as attendanceDataUtils from '../../../utils/attendanceDataUtils';

// Mock dependencies
jest.mock('../../../hooks/useAttendanceData');
jest.mock('@/stores');
jest.mock('@/hooks/useAttendanceQueries');
jest.mock('@/api/attendances');
jest.mock('@/stores/modalStore');
jest.mock('../../../utils/attendanceDataUtils');

const mockUseAttendanceData = useAttendanceData as jest.MockedFunction<typeof useAttendanceData>;
const mockUseSetDayFinalized = useSetDayFinalized as jest.MockedFunction<typeof useSetDayFinalized>;
const mockUseHandleAbsenceJustifications = useHandleAbsenceJustifications as jest.MockedFunction<typeof useHandleAbsenceJustifications>;
const mockMarkAttendanceAsMissed = markAttendanceAsMissed as jest.MockedFunction<typeof markAttendanceAsMissed>;
const mockUseCloseModal = useCloseModal as jest.MockedFunction<typeof useCloseModal>;
const mockGetIncompleteAttendances = attendanceDataUtils.getIncompleteAttendances as jest.MockedFunction<typeof attendanceDataUtils.getIncompleteAttendances>;
const mockGetCompletedAttendances = attendanceDataUtils.getCompletedAttendances as jest.MockedFunction<typeof attendanceDataUtils.getCompletedAttendances>;
const mockGetScheduledAbsences = attendanceDataUtils.getScheduledAbsences as jest.MockedFunction<typeof attendanceDataUtils.getScheduledAbsences>;

describe('useEndOfDay', () => {
  const mockSetDayFinalized = jest.fn();
  const mockHandleAbsenceJustifications = jest.fn();
  const mockCloseModal = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseSetDayFinalized.mockReturnValue(mockSetDayFinalized);
    mockUseHandleAbsenceJustifications.mockReturnValue({
      mutate: mockHandleAbsenceJustifications,
    } as any);
    mockUseCloseModal.mockReturnValue(mockCloseModal);
    mockMarkAttendanceAsMissed.mockResolvedValue({ success: true });

    mockUseAttendanceData.mockReturnValue({
      attendancesByDate: null,
      refreshData: jest.fn(),
      selectedDate: '2024-01-01',
      loading: false,
      error: null,
      patients: [],
      createAttendance: jest.fn(),
      checkInAttendance: jest.fn(),
      createPatient: jest.fn(),
      deleteAttendance: jest.fn(),
      getIncompleteAttendances: jest.fn(),
      getScheduledAbsences: jest.fn(),
      getSortedPatients: jest.fn(),
    });

    mockGetIncompleteAttendances.mockReturnValue([]);
    mockGetCompletedAttendances.mockReturnValue([]);
    mockGetScheduledAbsences.mockReturnValue([]);
  });

  it('should initialize with correct default values', () => {
    const { result } = renderHook(() => useEndOfDay());

    expect(result.current.currentStep).toBe('incomplete');
    expect(result.current.scheduledAbsences).toEqual([]);
    expect(result.current.absenceJustifications).toEqual([]);
    expect(result.current.isSubmitting).toBe(false);
  });

  it('should handle step navigation correctly', () => {
    const { result } = renderHook(() => useEndOfDay());

    // Test forward navigation
    act(() => {
      result.current.handleNext();
    });
    expect(result.current.currentStep).toBe('absences');

    act(() => {
      result.current.handleNext();
    });
    expect(result.current.currentStep).toBe('confirm');

    // Test backward navigation
    act(() => {
      result.current.handleBack();
    });
    expect(result.current.currentStep).toBe('absences');

    act(() => {
      result.current.handleBack();
    });
    expect(result.current.currentStep).toBe('incomplete');
  });

  it('should handle justification changes correctly', () => {
    const mockScheduledAbsences = [
      { 
        name: 'John Doe', 
        priority: 1 as const, 
        attendanceId: 1, 
        patientId: 101,
        attendanceType: 'spiritual' as const 
      }
    ];

    mockGetScheduledAbsences.mockReturnValue(mockScheduledAbsences);

    const { result } = renderHook(() => useEndOfDay());

    act(() => {
      result.current.handleJustificationChange(101, 'spiritual', true, 'Patient called to reschedule');
    });

    expect(result.current.absenceJustifications[0].justified).toBe(true);
    expect(result.current.absenceJustifications[0].justification).toBe('Patient called to reschedule');
  });

  it('should submit end of day correctly with missed attendances', async () => {
    const mockScheduledAbsences = [
      { 
        name: 'John Doe', 
        priority: 1 as const, 
        attendanceId: 1, 
        patientId: 101,
        attendanceType: 'spiritual' as const 
      }
    ];

    mockGetScheduledAbsences.mockReturnValue(mockScheduledAbsences);

    const { result } = renderHook(() => useEndOfDay());

    // Set a justification
    act(() => {
      result.current.handleJustificationChange(101, 'spiritual', true, 'Family emergency');
    });

    // Submit end of day
    await act(async () => {
      await result.current.handleEndOfDaySubmit();
    });

    expect(mockMarkAttendanceAsMissed).toHaveBeenCalledWith(1);
    expect(mockHandleAbsenceJustifications).toHaveBeenCalledWith([
      {
        patientId: 101,
        attendanceType: 'spiritual',
        justified: true,
        justification: 'Family emergency'
      }
    ]);
    expect(mockSetDayFinalized).toHaveBeenCalledWith(true);
    expect(mockCloseModal).toHaveBeenCalled();
  });

  it('should handle submission errors gracefully', async () => {
    const mockError = new Error('API Error');
    mockMarkAttendanceAsMissed.mockRejectedValue(mockError);

    const mockScheduledAbsences = [
      { 
        name: 'John Doe', 
        priority: 1 as const, 
        attendanceId: 1, 
        patientId: 101,
        attendanceType: 'spiritual' as const 
      }
    ];

    mockGetScheduledAbsences.mockReturnValue(mockScheduledAbsences);

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

    const { result } = renderHook(() => useEndOfDay());

    await act(async () => {
      await result.current.handleEndOfDaySubmit();
    });

    expect(consoleSpy).toHaveBeenCalledWith('Error submitting end-of-day:', mockError);
    expect(result.current.isSubmitting).toBe(false);

    consoleSpy.mockRestore();
  });
});

  describe('Memoization and Infinite Loop Prevention', () => {
    it('should memoize attendance data calculations', () => {
      const { rerender } = renderHook(() => useEndOfDay(defaultProps));

      // Initial render
      expect(mockGetIncompleteAttendances).toHaveBeenCalledTimes(1);
      expect(mockGetCompletedAttendances).toHaveBeenCalledTimes(1);
      expect(mockGetScheduledAbsences).toHaveBeenCalledTimes(1);

      // Re-render with same attendancesByDate (should not call utility functions again)
      rerender();
      
      expect(mockGetIncompleteAttendances).toHaveBeenCalledTimes(1);
      expect(mockGetCompletedAttendances).toHaveBeenCalledTimes(1);
      expect(mockGetScheduledAbsences).toHaveBeenCalledTimes(1);
    });

    it('should only recalculate when attendancesByDate changes', () => {
      const { rerender } = renderHook(() => useEndOfDay(defaultProps));

      // Initial render
      expect(mockGetIncompleteAttendances).toHaveBeenCalledTimes(1);

      // Change attendancesByDate
      const newAttendancesByDate = {
        ...mockAttendancesByDate,
        spiritual: {
          ...mockAttendancesByDate.spiritual,
          scheduled: [{ 
            name: 'Test Patient', 
            patientId: 1, 
            priority: '1' as const,
            attendanceId: 1 
          }]
        }
      };

      mockUseAttendanceData.mockReturnValue({
        attendancesByDate: newAttendancesByDate,
        refreshData: mockRefreshData,
        selectedDate: '2024-01-01',
        loading: false,
        error: null,
        patients: [],
        createAttendance: jest.fn(),
        checkInAttendance: jest.fn(),
        createPatient: jest.fn(),
        deleteAttendance: jest.fn(),
        getIncompleteAttendances: jest.fn(),
        getScheduledAbsences: jest.fn(),
        getSortedPatients: jest.fn(),
      });

      rerender();

      // Should recalculate due to changed attendancesByDate
      expect(mockGetIncompleteAttendances).toHaveBeenCalledTimes(2);
      expect(mockGetCompletedAttendances).toHaveBeenCalledTimes(2);
      expect(mockGetScheduledAbsences).toHaveBeenCalledTimes(2);
    });

    it('should not cause infinite loop with scheduled absences transformation', () => {
      const mockScheduledAbsence = {
        name: 'Test Patient',
        patientId: 1,
        priority: '1' as const,
        attendanceType: 'spiritual' as const
      };

      mockGetScheduledAbsences.mockReturnValue([mockScheduledAbsence]);

      const { result } = renderHook(() => useEndOfDay(defaultProps));

      // Should have transformed scheduled absences correctly
      expect(result.current.scheduledAbsences).toEqual([{
        patientId: 1,
        patientName: 'Test Patient',
        attendanceType: 'spiritual'
      }]);

      // Multiple accesses should not cause recalculation
      const firstAccess = result.current.scheduledAbsences;
      const secondAccess = result.current.scheduledAbsences;
      
      expect(firstAccess).toBe(secondAccess); // Same reference (memoized)
    });
  });

  describe('Initial State Management', () => {
    it('should initialize absence justifications based on scheduled absences', () => {
      const mockScheduledAbsences = [
        { name: 'Patient 1', patientId: 1, priority: '1' as const, attendanceType: 'spiritual' as const },
        { name: 'Patient 2', patientId: 2, priority: '2' as const, attendanceType: 'lightBath' as const }
      ];

      mockGetScheduledAbsences.mockReturnValue(mockScheduledAbsences);

      const { result } = renderHook(() => useEndOfDay(defaultProps));

      expect(result.current.absenceJustifications).toEqual([
        {
          patientId: 1,
          patientName: 'Patient 1',
          attendanceType: 'spiritual'
        },
        {
          patientId: 2,
          patientName: 'Patient 2',
          attendanceType: 'lightBath'
        }
      ]);
    });

    it('should update absence justifications when scheduled absences change', () => {
      // Initial state - empty scheduled absences
      mockGetScheduledAbsences.mockReturnValue([]);

      const { result, rerender } = renderHook(() => useEndOfDay(defaultProps));

      expect(result.current.absenceJustifications).toEqual([]);

      // Update to have scheduled absences
      const newScheduledAbsences = [
        { name: 'New Patient', patientId: 1, priority: '1' as const, attendanceType: 'spiritual' as const }
      ];

      mockGetScheduledAbsences.mockReturnValue(newScheduledAbsences);

      // Update mock to trigger change
      mockUseAttendanceData.mockReturnValue({
        attendancesByDate: {
          ...mockAttendancesByDate,
          spiritual: {
            ...mockAttendancesByDate.spiritual,
            scheduled: [{ name: 'New Patient', patientId: 1, priority: '1' as const }]
          }
        },
        refreshData: mockRefreshData,
        selectedDate: '2024-01-01',
        loading: false,
        error: null,
        patients: [],
        createAttendance: jest.fn(),
        checkInAttendance: jest.fn(),
        createPatient: jest.fn(),
        deleteAttendance: jest.fn(),
        getIncompleteAttendances: jest.fn(),
        getScheduledAbsences: jest.fn(),
        getSortedPatients: jest.fn(),
      });

      rerender();

      expect(result.current.absenceJustifications).toEqual([
        {
          patientId: 1,
          patientName: 'New Patient',
          attendanceType: 'spiritual'
        }
      ]);
    });
  });

  describe('Step Navigation', () => {
    it('should start with incomplete step', () => {
      const { result } = renderHook(() => useEndOfDay(defaultProps));
      expect(result.current.currentStep).toBe('incomplete');
    });

    it('should handle step progression correctly', () => {
      const { result } = renderHook(() => useEndOfDay(defaultProps));

      act(() => {
        result.current.handleNext();
      });

      expect(result.current.currentStep).toBe('absences');

      act(() => {
        result.current.handleNext();
      });

      expect(result.current.currentStep).toBe('confirm');
    });

    it('should handle step regression correctly', () => {
      mockGetIncompleteAttendances.mockReturnValue([]);
      mockGetScheduledAbsences.mockReturnValue([]);

      const { result } = renderHook(() => useEndOfDay(defaultProps));

      // Navigate to confirm step
      act(() => {
        result.current.handleNext();
      });
      act(() => {
        result.current.handleNext();
      });

      expect(result.current.currentStep).toBe('confirm');

      act(() => {
        result.current.handleBack();
      });

      expect(result.current.currentStep).toBe('absences');

      act(() => {
        result.current.handleBack();
      });

      expect(result.current.currentStep).toBe('incomplete');
    });
  });

  describe('Progress Validation', () => {
    it('should allow proceeding from incomplete step when no incomplete attendances', () => {
      mockGetIncompleteAttendances.mockReturnValue([]);

      const { result } = renderHook(() => useEndOfDay(defaultProps));

      expect(result.current.canProceedFromIncomplete).toBe(true);
    });

    it('should block proceeding from incomplete step when incomplete attendances exist', () => {
      mockGetIncompleteAttendances.mockReturnValue([
        { name: 'Patient 1', patientId: 1, priority: '1' as const, attendanceType: 'spiritual' }
      ]);

      const { result } = renderHook(() => useEndOfDay(defaultProps));

      expect(result.current.canProceedFromIncomplete).toBe(false);
    });

    it('should allow proceeding from absences step when no scheduled absences', () => {
      mockGetScheduledAbsences.mockReturnValue([]);

      const { result } = renderHook(() => useEndOfDay(defaultProps));

      expect(result.current.canProceedFromAbsences).toBe(true);
    });

    it('should block proceeding from absences step when justifications incomplete', () => {
      mockGetScheduledAbsences.mockReturnValue([
        { name: 'Patient 1', patientId: 1, priority: '1' as const, attendanceType: 'spiritual' }
      ]);

      const { result } = renderHook(() => useEndOfDay(defaultProps));

      expect(result.current.canProceedFromAbsences).toBe(false);
    });

    it('should allow proceeding from absences step when all justifications complete', () => {
      mockGetScheduledAbsences.mockReturnValue([
        { name: 'Patient 1', patientId: 1, priority: '1' as const, attendanceType: 'spiritual' }
      ]);

      const { result } = renderHook(() => useEndOfDay(defaultProps));

      // Add justification
      act(() => {
        result.current.handleJustificationChange(1, 'spiritual', true, 'Test justification');
      });

      expect(result.current.canProceedFromAbsences).toBe(true);
    });
  });

  describe('Justification Management', () => {
    it('should update justifications correctly', () => {
      mockGetScheduledAbsences.mockReturnValue([
        { name: 'Patient 1', patientId: 1, priority: '1' as const, attendanceType: 'spiritual' }
      ]);

      const { result } = renderHook(() => useEndOfDay(defaultProps));

      act(() => {
        result.current.handleJustificationChange(1, 'spiritual', true, 'Patient called in sick');
      });

      expect(result.current.absenceJustifications[0]).toEqual({
        patientId: 1,
        patientName: 'Patient 1',
        attendanceType: 'spiritual',
        justified: true,
        justification: 'Patient called in sick'
      });
    });

    it('should handle multiple justifications independently', () => {
      mockGetScheduledAbsences.mockReturnValue([
        { name: 'Patient 1', patientId: 1, priority: '1' as const, attendanceType: 'spiritual' },
        { name: 'Patient 2', patientId: 2, priority: '2' as const, attendanceType: 'lightBath' }
      ]);

      const { result } = renderHook(() => useEndOfDay(defaultProps));

      act(() => {
        result.current.handleJustificationChange(1, 'spiritual', true, 'Reason 1');
      });

      act(() => {
        result.current.handleJustificationChange(2, 'lightBath', false);
      });

      expect(result.current.absenceJustifications).toEqual([
        {
          patientId: 1,
          patientName: 'Patient 1',
          attendanceType: 'spiritual',
          justified: true,
          justification: 'Reason 1'
        },
        {
          patientId: 2,
          patientName: 'Patient 2',
          attendanceType: 'lightBath',
          justified: false
        }
      ]);
    });
  });

  describe('Form Submission', () => {
    it('should handle successful submission', async () => {
      const { result } = renderHook(() => useEndOfDay(defaultProps));

      await act(async () => {
        await result.current.handleSubmit();
      });

      expect(mockOnFinalizeClick).toHaveBeenCalled();
      expect(mockRefreshData).toHaveBeenCalled();
      expect(result.current.isSubmitting).toBe(false);
    });

    it('should handle submission errors gracefully', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const mockError = new Error('Test error');
      mockOnFinalizeClick.mockRejectedValue(mockError);

      const { result } = renderHook(() => useEndOfDay(defaultProps));

      await act(async () => {
        try {
          await result.current.handleSubmit();
        } catch {
          // Expected to throw
        }
      });

      expect(consoleErrorSpy).toHaveBeenCalledWith('Error finalizing day:', mockError);
      expect(result.current.isSubmitting).toBe(false);

      consoleErrorSpy.mockRestore();
    });

    it('should set submitting state during submission', async () => {
      let resolvePromise: () => void;
      const promise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });

      mockOnFinalizeClick.mockReturnValue(promise);

      const { result } = renderHook(() => useEndOfDay(defaultProps));

      const submitPromise = act(async () => {
        await result.current.handleSubmit();
      });

      expect(result.current.isSubmitting).toBe(true);

      resolvePromise!();
      await submitPromise;

      expect(result.current.isSubmitting).toBe(false);
    });
  });
});
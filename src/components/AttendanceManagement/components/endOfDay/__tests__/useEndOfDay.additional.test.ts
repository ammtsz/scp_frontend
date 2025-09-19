import { renderHook, act } from '@testing-library/react';
import { useEndOfDay } from '../useEndOfDay';
import type { IAttendanceStatusDetail } from '@/types/globals';
import type { ScheduledAbsence } from '../types';

// Mock data factories
const createMockAttendance = (overrides: Partial<IAttendanceStatusDetail> = {}): IAttendanceStatusDetail => ({
  name: 'John Doe',
  priority: '1',
  checkedInTime: null,
  onGoingTime: null,
  completedTime: null,
  attendanceId: 1,
  patientId: 1,
  ...overrides,
});

const createMockScheduledAbsence = (overrides: Partial<ScheduledAbsence> = {}): ScheduledAbsence => ({
  patientId: 1,
  patientName: 'John Doe',
  attendanceType: 'spiritual',
  ...overrides,
});

describe('useEndOfDay', () => {
  const defaultProps = {
    incompleteAttendances: [],
    scheduledAbsences: [],
    onHandleCompletion: jest.fn(),
    onReschedule: jest.fn(),
    onSubmitEndOfDay: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with incomplete step', () => {
    const { result } = renderHook(() => useEndOfDay(defaultProps));
    
    expect(result.current.currentStep).toBe('incomplete');
    expect(result.current.isSubmitting).toBe(false);
  });

  it('initializes absence justifications from scheduled absences', () => {
    const scheduledAbsences = [
      createMockScheduledAbsence({ patientId: 1, patientName: 'John Doe' }),
      createMockScheduledAbsence({ patientId: 2, patientName: 'Jane Doe' }),
    ];
    
    const { result } = renderHook(() => 
      useEndOfDay({ ...defaultProps, scheduledAbsences })
    );
    
    expect(result.current.absenceJustifications).toHaveLength(2);
    expect(result.current.absenceJustifications[0]).toEqual({
      patientId: 1,
      patientName: 'John Doe',
      // justified is undefined initially
    });
  });

  it('handles step navigation forward', () => {
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

  it('handles step navigation backward', () => {
    const { result } = renderHook(() => useEndOfDay(defaultProps));
    
    // Go to confirm step
    act(() => {
      result.current.handleNext();
      result.current.handleNext();
    });
    
    expect(result.current.currentStep).toBe('confirm');
    
    // Go back to absences
    act(() => {
      result.current.handleBack();
    });
    
    expect(result.current.currentStep).toBe('absences');
    
    // Go back to incomplete
    act(() => {
      result.current.handleBack();
    });
    
    expect(result.current.currentStep).toBe('incomplete');
  });

  it('handles justification changes', () => {
    const scheduledAbsences = [createMockScheduledAbsence({ patientId: 1 })];
    
    const { result } = renderHook(() => 
      useEndOfDay({ ...defaultProps, scheduledAbsences })
    );
    
    act(() => {
      result.current.handleJustificationChange(1, 'spiritual', true, 'Medical appointment');
    });
    
    expect(result.current.absenceJustifications[0]).toEqual({
      patientId: 1,
      patientName: 'John Doe',
      justified: true,
      justification: 'Medical appointment',
    });
  });

  it('calculates canProceedFromIncomplete correctly', () => {
    const incompleteAttendances = [createMockAttendance()];
    
    const { result } = renderHook(() => 
      useEndOfDay({ ...defaultProps, incompleteAttendances })
    );
    
    expect(result.current.canProceedFromIncomplete).toBe(false);
    
    const { result: result2 } = renderHook(() => useEndOfDay(defaultProps));
    expect(result2.current.canProceedFromIncomplete).toBe(true);
  });

  it('calculates canProceedFromAbsences correctly', () => {
    const scheduledAbsences = [createMockScheduledAbsence()];
    
    const { result } = renderHook(() => 
      useEndOfDay({ ...defaultProps, scheduledAbsences })
    );
    
    // Initially false because justification is not set
    expect(result.current.canProceedFromAbsences).toBe(false);
    
    // Set justification
    act(() => {
      result.current.handleJustificationChange(1, 'spiritual', true);
    });
    
    expect(result.current.canProceedFromAbsences).toBe(true);
  });

  it('handles submission correctly', async () => {
    const onSubmitEndOfDay = jest.fn().mockResolvedValue(undefined);
    const scheduledAbsences = [createMockScheduledAbsence()];
    
    const { result } = renderHook(() => 
      useEndOfDay({ ...defaultProps, scheduledAbsences, onSubmitEndOfDay })
    );
    
    // Set justification
    act(() => {
      result.current.handleJustificationChange(1, 'spiritual', true, 'Medical reason');
    });
    
    await act(async () => {
      await result.current.handleSubmit();
    });
    
    expect(onSubmitEndOfDay).toHaveBeenCalledWith([
      {
        patientId: 1,
        patientName: 'John Doe',
        justified: true,
        justification: 'Medical reason',
      },
    ]);
  });

  it('handles submission errors correctly', async () => {
    const onSubmitEndOfDay = jest.fn().mockRejectedValue(new Error('Submission failed'));
    
    const { result } = renderHook(() => 
      useEndOfDay({ ...defaultProps, onSubmitEndOfDay })
    );
    
    expect(result.current.isSubmitting).toBe(false);
    
    await act(async () => {
      try {
        await result.current.handleSubmit();
      } catch {
        // Expected error
      }
    });
    
    expect(result.current.isSubmitting).toBe(false);
    expect(onSubmitEndOfDay).toHaveBeenCalled();
  });

  it('calls handleCompletion correctly', () => {
    const onHandleCompletion = jest.fn();
    
    const { result } = renderHook(() => 
      useEndOfDay({ ...defaultProps, onHandleCompletion })
    );
    
    act(() => {
      result.current.handleCompletion(123);
    });
    
    expect(onHandleCompletion).toHaveBeenCalledWith(123);
  });
});

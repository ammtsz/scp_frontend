import { renderHook, act } from '@testing-library/react';
import { useDragAndDrop } from '../useDragAndDrop';

// Mock data for testing
const mockAttendancesByDate = {
  spiritual: {
    scheduled: [],
    checkedIn: [
      {
        name: 'João Silva',
        patientId: 1,
        attendanceId: 101,
        priority: 1,
        checkedInTime: '09:00:00',
      }
    ],
    onGoing: [],
    completed: [],
  },
  lightBath: {
    scheduled: [],
    checkedIn: [
      {
        name: 'Maria Santos',
        patientId: 2, 
        attendanceId: 102,
        priority: 2,
        checkedInTime: '10:00:00',
      }
    ],
    onGoing: [],
    completed: [],
  },
  rod: {
    scheduled: [],
    checkedIn: [
      {
        name: 'Pedro Costa',
        patientId: 3,
        attendanceId: 103,
        priority: 1,
        checkedInTime: '11:00:00',
      }
    ],
    onGoing: [],
    completed: [],
  },
};

const mockPatients = [
  { id: '1', name: 'João Silva', status: 'A' },
  { id: '2', name: 'Maria Santos', status: 'A' },
  { id: '3', name: 'Pedro Costa', status: 'N' }, // New patient
];

describe('useDragAndDrop - Modal Routing Logic', () => {
  const mockOnTreatmentFormOpen = jest.fn();
  const mockOnTreatmentCompletionOpen = jest.fn();
  const mockSetAttendancesByDate = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const defaultProps = {
    attendancesByDate: mockAttendancesByDate,
    setAttendancesByDate: mockSetAttendancesByDate,
    patients: mockPatients,
    onTreatmentFormOpen: mockOnTreatmentFormOpen,
    onTreatmentCompletionOpen: mockOnTreatmentCompletionOpen,
  };

  it('should open PostAttendanceModal for spiritual consultation completion', async () => {
    const { result } = renderHook(() => useDragAndDrop(defaultProps));

    // Start dragging spiritual consultation
    act(() => {
      result.current.handleDragStart('spiritual', 0, 'checkedIn', 1);
    });

    // Drop to completed status
    act(() => {
      result.current.handleDropWithConfirm('spiritual', 'completed');
    });

    // Verify PostAttendanceModal is opened (onTreatmentFormOpen called)
    expect(mockOnTreatmentFormOpen).toHaveBeenCalledWith({
      id: 101,
      patientId: 1,
      patientName: 'João Silva',
      attendanceType: 'spiritual',
      currentTreatmentStatus: 'N',
      currentStartDate: undefined,
      currentReturnWeeks: undefined,
      isFirstAttendance: false, // Patient status is 'A' (active)
    });

    // Verify PostTreatmentModal is NOT opened
    expect(mockOnTreatmentCompletionOpen).not.toHaveBeenCalled();
  });

  it('should open PostTreatmentModal for lightBath treatment completion', async () => {
    const { result } = renderHook(() => useDragAndDrop(defaultProps));

    // Start dragging light bath treatment
    act(() => {
      result.current.handleDragStart('lightBath', 0, 'checkedIn', 2);
    });

    // Drop to completed status
    act(() => {
      result.current.handleDropWithConfirm('lightBath', 'completed');
    });

    // Verify PostTreatmentModal is opened (onTreatmentCompletionOpen called)
    expect(mockOnTreatmentCompletionOpen).toHaveBeenCalledWith({
      attendanceId: 102,
      patientId: 2,
      patientName: 'Maria Santos',
      attendanceType: 'lightBath',
      onComplete: expect.any(Function),
    });

    // Verify PostAttendanceModal is NOT opened
    expect(mockOnTreatmentFormOpen).not.toHaveBeenCalled();
  });

  it('should open PostTreatmentModal for rod treatment completion', async () => {
    const { result } = renderHook(
      () => useDragAndDrop(defaultProps),
      { wrapper: TestProvidersWrapper }
    );

    // Start dragging rod treatment
    act(() => {
      result.current.handleDragStart('rod', 0, 'checkedIn', 3);
    });

    // Drop to completed status
    act(() => {
      result.current.handleDropWithConfirm('rod', 'completed');
    });

    // Verify PostTreatmentModal is opened (onTreatmentCompletionOpen called)
    expect(mockOnTreatmentCompletionOpen).toHaveBeenCalledWith({
      attendanceId: 103,
      patientId: 3,
      patientName: 'Pedro Costa',
      attendanceType: 'rod',
      onComplete: expect.any(Function),
    });

    // Verify PostAttendanceModal is NOT opened
    expect(mockOnTreatmentFormOpen).not.toHaveBeenCalled();
  });

  it('should handle first-time spiritual consultation correctly', async () => {
    const { result } = renderHook(
      () => useDragAndDrop(defaultProps),
      { wrapper: TestProvidersWrapper }
    );

    // Start dragging spiritual consultation for new patient (Pedro Costa, status: 'N')
    act(() => {
      result.current.handleDragStart('spiritual', 0, 'checkedIn', 3);
    });

    // Drop to completed status
    act(() => {
      result.current.handleDropWithConfirm('spiritual', 'completed');
    });

    // Verify PostAttendanceModal is opened with isFirstAttendance: true
    expect(mockOnTreatmentFormOpen).toHaveBeenCalledWith({
      id: 103,
      patientId: 3,
      patientName: 'Pedro Costa', 
      attendanceType: 'spiritual',
      currentTreatmentStatus: 'N',
      currentStartDate: undefined,
      currentReturnWeeks: undefined,
      isFirstAttendance: true, // Patient status is 'N' (new)
    });
  });

  it('should not open any modal for non-completed status changes', async () => {
    const { result } = renderHook(
      () => useDragAndDrop(defaultProps),
      { wrapper: TestProvidersWrapper }
    );

    // Start dragging spiritual consultation
    act(() => {
      result.current.handleDragStart('spiritual', 0, 'checkedIn', 1);
    });

    // Drop to onGoing status (not completed)
    act(() => {
      result.current.handleDropWithConfirm('spiritual', 'onGoing');
    });

    // Verify no modals are opened
    expect(mockOnTreatmentFormOpen).not.toHaveBeenCalled();
    expect(mockOnTreatmentCompletionOpen).not.toHaveBeenCalled();
  });

  it('should update attendance state correctly after modal routing', async () => {
    const { result } = renderHook(
      () => useDragAndDrop(defaultProps),
      { wrapper: TestProvidersWrapper }
    );

    // Start dragging spiritual consultation
    act(() => {
      result.current.handleDragStart('spiritual', 0, 'checkedIn', 1);
    });

    // Drop to completed status
    act(() => {
      result.current.handleDropWithConfirm('spiritual', 'completed');
    });

    // Verify state update was called
    expect(mockSetAttendancesByDate).toHaveBeenCalled();
    
    // Get the updated state from the mock call
    const updatedState = mockSetAttendancesByDate.mock.calls[0][0];
    
    // Verify patient was moved to completed status
    expect(updatedState.spiritual.completed).toHaveLength(1);
    expect(updatedState.spiritual.completed[0].name).toBe('João Silva');
    expect(updatedState.spiritual.completed[0].completedTime).toBeDefined();
    
    // Verify patient was removed from checkedIn status
    expect(updatedState.spiritual.checkedIn).toHaveLength(0);
  });
});
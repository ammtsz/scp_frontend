import { renderHook, act } from '@testing-library/react';
import { useDragAndDrop } from '../useDragAndDrop';
import { useAttendances } from '@/contexts/AttendancesContext';
import { usePatients } from '@/contexts/PatientsContext';
import { IAttendanceByDate } from '@/types/globals';

// Mock the contexts
jest.mock('@/contexts/AttendancesContext');
jest.mock('@/contexts/PatientsContext');
jest.mock('@/api/attendanceSync', () => ({
  updateAttendanceStatus: jest.fn().mockResolvedValue({ success: true })
}));

const mockUseAttendances = useAttendances as jest.MockedFunction<typeof useAttendances>;
const mockUsePatients = usePatients as jest.MockedFunction<typeof usePatients>;

describe('useDragAndDrop - Combined Treatment Cards', () => {
  const mockSetAttendancesByDate = jest.fn();
  
  const mockAttendancesByDate: IAttendanceByDate = {
    date: new Date('2025-10-17'),
    spiritual: {
      scheduled: [],
      checkedIn: [],
      onGoing: [],
      completed: []
    },
    lightBath: {
      scheduled: [
        { patientId: 1, name: 'Patient 1', attendanceId: 101, priority: "1" }
      ],
      checkedIn: [],
      onGoing: [],
      completed: []
    },
    rod: {
      scheduled: [
        { patientId: 1, name: 'Patient 1', attendanceId: 102, priority: "1" }
      ],
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

  beforeEach(() => {
    mockUseAttendances.mockReturnValue({
      attendancesByDate: mockAttendancesByDate,
      setAttendancesByDate: mockSetAttendancesByDate,
      selectedDate: '2025-10-17',
      setSelectedDate: jest.fn(),
      loading: false,
      dataLoading: false,
      error: null,
      loadAttendancesByDate: jest.fn(),
      bulkUpdateStatus: jest.fn(),
      initializeSelectedDate: jest.fn(),
      refreshCurrentDate: jest.fn(),
      checkEndOfDayStatus: jest.fn(),
      finalizeEndOfDay: jest.fn(),
      handleIncompleteAttendances: jest.fn(),
      handleAbsenceJustifications: jest.fn(),
    });
    
    mockUsePatients.mockReturnValue({
      patients: [],
      setPatients: jest.fn(),
      loading: false,
      error: null,
      refreshPatients: jest.fn(),
    });
    
    jest.clearAllMocks();
  });

  it('should detect combined treatment when patient has both lightBath and rod', () => {
    const { result } = renderHook(() => useDragAndDrop());
    
    act(() => {
      // Drag start with patient who has both treatments
      result.current.handleDragStart('lightBath', 0, 'scheduled', 1);
    });

    expect(result.current.dragged).toEqual({
      type: 'lightBath',
      status: 'scheduled',
      idx: 0,
      patientId: 1,
      isCombinedTreatment: true,
      treatmentTypes: ['lightBath', 'rod']
    });
  });

  it('should not detect combined treatment when patient has only one treatment', () => {
    // Mock data with patient only in lightBath
    const singleTreatmentData = {
      ...mockAttendancesByDate,
      rod: {
        scheduled: [],
        checkedIn: [],
        onGoing: [],
        completed: []
      }
    };
    
    mockUseAttendances.mockReturnValue({
      attendancesByDate: singleTreatmentData,
      setAttendancesByDate: mockSetAttendancesByDate,
      selectedDate: '2025-10-17',
      setSelectedDate: jest.fn(),
      loading: false,
      dataLoading: false,
      error: null,
      loadAttendancesByDate: jest.fn(),
      bulkUpdateStatus: jest.fn(),
      initializeSelectedDate: jest.fn(),
      refreshCurrentDate: jest.fn(),
      checkEndOfDayStatus: jest.fn(),
      finalizeEndOfDay: jest.fn(),
      handleIncompleteAttendances: jest.fn(),
      handleAbsenceJustifications: jest.fn(),
    });

    const { result } = renderHook(() => useDragAndDrop());
    
    act(() => {
      result.current.handleDragStart('lightBath', 0, 'scheduled', 1);
    });

    expect(result.current.dragged).toEqual({
      type: 'lightBath',
      status: 'scheduled', 
      idx: 0,
      patientId: 1,
      isCombinedTreatment: false,
      treatmentTypes: ['lightBath']
    });
  });

  it('should move both treatments when dragging combined treatment card', async () => {
    const { result } = renderHook(() => useDragAndDrop());
    
    // Start drag for combined treatment
    act(() => {
      result.current.handleDragStart('lightBath', 0, 'scheduled', 1);
    });

    // Drop on checkedIn status
    await act(async () => {
      result.current.handleDropWithConfirm('lightBath', 'checkedIn');
    });

    // Should have called setAttendancesByDate to move both treatments
    expect(mockSetAttendancesByDate).toHaveBeenCalled();
    
    // Get the call arguments to verify both treatments were moved
    const updateCall = mockSetAttendancesByDate.mock.calls[0][0];
    
    // Both lightBath and rod scheduled arrays should be empty (patients moved)
    expect(updateCall.lightBath.scheduled).toHaveLength(0);
    expect(updateCall.rod.scheduled).toHaveLength(0);
    
    // Both lightBath and rod checkedIn arrays should have the patient
    expect(updateCall.lightBath.checkedIn).toHaveLength(1);
    expect(updateCall.rod.checkedIn).toHaveLength(1);
    
    // Verify both have the same patient
    expect(updateCall.lightBath.checkedIn[0].patientId).toBe(1);
    expect(updateCall.rod.checkedIn[0].patientId).toBe(1);
  });
});
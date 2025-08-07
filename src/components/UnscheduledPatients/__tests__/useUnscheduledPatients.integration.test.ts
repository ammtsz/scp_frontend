import { renderHook, act } from '@testing-library/react';
import { useUnscheduledPatients } from '../useUnscheduledPatients';
import { usePatients } from '@/contexts/PatientsContext';
import { useAttendances } from '@/contexts/AttendancesContext';
import { createAttendance, getNextAttendanceDate, deleteAttendance } from '@/api/attendances';
import { AttendanceType } from '@/api/types';

// Mock the API functions
jest.mock('@/api/attendances');
jest.mock('@/contexts/PatientsContext');
jest.mock('@/contexts/AttendancesContext');

const mockCreateAttendance = createAttendance as jest.MockedFunction<typeof createAttendance>;
const mockGetNextAttendanceDate = getNextAttendanceDate as jest.MockedFunction<typeof getNextAttendanceDate>;
const mockDeleteAttendance = deleteAttendance as jest.MockedFunction<typeof deleteAttendance>;
const mockUsePatients = usePatients as jest.MockedFunction<typeof usePatients>;
const mockUseAttendances = useAttendances as jest.MockedFunction<typeof useAttendances>;

describe('useUnscheduledPatients - Tuesday Only Business Rule', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup context mocks
    (mockUsePatients as any).mockReturnValue({
      patients: [{ id: '1', name: 'João Silva', priority: '1', status: 'T' }],
      refreshPatients: jest.fn(),
      setPatients: jest.fn(),
      loading: false,
      error: null,
    });

    (mockUseAttendances as any).mockReturnValue({
      refreshCurrentDate: jest.fn(),
      attendancesByDate: null, // No existing attendances
      loading: false,
      error: null,
    });

    // Mock the next available date API call
    mockGetNextAttendanceDate.mockResolvedValue({
      success: true,
      value: { next_date: '2025-08-12' } // Next Tuesday from schedule settings
    });

    mockCreateAttendance.mockResolvedValue({ success: true, value: {} as any });
  });

  it('should schedule for next available date (2025-08-12) from backend schedule settings', async () => {
    const { result } = renderHook(() => useUnscheduledPatients());

    act(() => {
      result.current.setIsNewPatient(false);
      result.current.handleSelect('João Silva');
      result.current.handleTypeCheckbox({
        target: { value: 'spiritual', checked: true }
      } as React.ChangeEvent<HTMLInputElement>);
    });

    await act(async () => {
      const mockEvent = { preventDefault: jest.fn() } as unknown as React.FormEvent;
      await result.current.handleRegisterNewAttendance(mockEvent);
    });

    // Verify attendance is scheduled for next available date from backend
    expect(mockGetNextAttendanceDate).toHaveBeenCalled();
    expect(mockCreateAttendance).toHaveBeenCalledWith({
      patient_id: 1,
      type: AttendanceType.SPIRITUAL,
      scheduled_date: '2025-08-12', // Date from backend schedule settings
      scheduled_time: '21:00',
      notes: 'Check-in sem agendamento - Paciente existente',
    });
  });

  it('should prevent duplicate check-in for already scheduled patient', async () => {
    // Mock attendances with existing patient
    (mockUseAttendances as any).mockReturnValue({
      refreshCurrentDate: jest.fn(),
      attendancesByDate: {
        spiritual: {
          scheduled: [{ name: 'João Silva', priority: '1', attendanceId: 1, patientId: 1 }],
          checkedIn: [],
          onGoing: [],
          completed: [],
        },
        lightBath: {
          scheduled: [],
          checkedIn: [],
          onGoing: [],
          completed: [],
        },
      },
      loading: false,
      error: null,
    });

    const { result } = renderHook(() => useUnscheduledPatients());

    act(() => {
      result.current.setIsNewPatient(false);
      result.current.handleSelect('João Silva');
      result.current.handleTypeCheckbox({
        target: { value: 'spiritual', checked: true }
      } as React.ChangeEvent<HTMLInputElement>);
    });

    const mockEvent = { preventDefault: jest.fn() } as any;

    let submitResult;
    await act(async () => {
      submitResult = await result.current.handleRegisterNewAttendance(mockEvent);
    });

    // Should return false and show error
    expect(submitResult).toBe(false);
    expect(result.current.error).toContain('já possui atendimento agendado para hoje');
    expect(mockCreateAttendance).not.toHaveBeenCalled();
  });

  it('should prevent duplicate check-in for patient in different statuses', async () => {
    // Mock attendances with patient in "checkedIn" status
    (mockUseAttendances as any).mockReturnValue({
      refreshCurrentDate: jest.fn(),
      attendancesByDate: {
        spiritual: {
          scheduled: [],
          checkedIn: [{ name: 'João Silva', priority: '1', attendanceId: 1, patientId: 1 }],
          onGoing: [],
          completed: [],
        },
        lightBath: {
          scheduled: [],
          checkedIn: [],
          onGoing: [],
          completed: [],
        },
      },
      loading: false,
      error: null,
    });

    const { result } = renderHook(() => useUnscheduledPatients());

    act(() => {
      result.current.setIsNewPatient(false);
      result.current.handleSelect('João Silva');
      result.current.handleTypeCheckbox({
        target: { value: 'lightBath', checked: true }
      } as React.ChangeEvent<HTMLInputElement>);
    });

    const mockEvent = { preventDefault: jest.fn() } as any;

    let submitResult;
    await act(async () => {
      submitResult = await result.current.handleRegisterNewAttendance(mockEvent);
    });

    // Should return false and show error
    expect(submitResult).toBe(false);
    expect(result.current.error).toContain('já possui atendimento agendado para hoje');
    expect(mockCreateAttendance).not.toHaveBeenCalled();
  });

  it('should allow check-in for patient not in current attendances', async () => {
    // Mock attendances with different patient
    (mockUseAttendances as any).mockReturnValue({
      refreshCurrentDate: jest.fn(),
      attendancesByDate: {
        spiritual: {
          scheduled: [{ name: 'Maria Santos', priority: '2', attendanceId: 2, patientId: 2 }],
          checkedIn: [],
          onGoing: [],
          completed: [],
        },
        lightBath: {
          scheduled: [],
          checkedIn: [],
          onGoing: [],
          completed: [],
        },
      },
      loading: false,
      error: null,
    });

    const { result } = renderHook(() => useUnscheduledPatients());

    act(() => {
      result.current.setIsNewPatient(false);
      result.current.handleSelect('João Silva');
      result.current.handleTypeCheckbox({
        target: { value: 'spiritual', checked: true }
      } as React.ChangeEvent<HTMLInputElement>);
    });

    const mockEvent = { preventDefault: jest.fn() } as any;

    let submitResult;
    await act(async () => {
      submitResult = await result.current.handleRegisterNewAttendance(mockEvent);
    });

    // Should succeed since João Silva is not in current attendances
    expect(submitResult).toBe(true);
    expect(result.current.error).toBeNull();
    expect(mockCreateAttendance).toHaveBeenCalled();
  });

  it('should successfully delete a scheduled attendance', async () => {
    // Mock attendances with existing patient
    (mockUseAttendances as any).mockReturnValue({
      refreshCurrentDate: jest.fn(),
      attendancesByDate: {
        spiritual: {
          scheduled: [{ 
            name: 'João Silva', 
            priority: '1', 
            attendanceId: 123, 
            patientId: 1 
          }],
          checkedIn: [],
          onGoing: [],
          completed: [],
        },
        lightBath: {
          scheduled: [],
          checkedIn: [],
          onGoing: [],
          completed: [],
        },
      },
      loading: false,
      error: null,
    });

    mockDeleteAttendance.mockResolvedValue({ success: true });

    const { result } = renderHook(() => useUnscheduledPatients());

    let deleteResult;
    await act(async () => {
      deleteResult = await result.current.handleDeleteAttendance(123, 'João Silva');
    });

    // Should succeed
    expect(deleteResult).toBe(true);
    expect(result.current.success).toContain('removido com sucesso');
    expect(mockDeleteAttendance).toHaveBeenCalledWith('123');
  });

  it('should handle delete errors gracefully', async () => {
    mockDeleteAttendance.mockResolvedValue({ 
      success: false, 
      error: 'Attendance not found' 
    });

    const { result } = renderHook(() => useUnscheduledPatients());

    let deleteResult;
    await act(async () => {
      deleteResult = await result.current.handleDeleteAttendance(123, 'João Silva');
    });

    // Should fail and show error
    expect(deleteResult).toBe(false);
    expect(result.current.error).toContain('Attendance not found');
    expect(mockDeleteAttendance).toHaveBeenCalledWith('123');
  });

  it('should get patient attendance details correctly', () => {
    // Mock attendances with multiple patients and types
    (mockUseAttendances as any).mockReturnValue({
      refreshCurrentDate: jest.fn(),
      attendancesByDate: {
        spiritual: {
          scheduled: [{ 
            name: 'João Silva', 
            priority: '1', 
            attendanceId: 123, 
            patientId: 1 
          }],
          checkedIn: [{ 
            name: 'Maria Santos', 
            priority: '2', 
            attendanceId: 124, 
            patientId: 2 
          }],
          onGoing: [],
          completed: [],
        },
        lightBath: {
          scheduled: [{ 
            name: 'João Silva', 
            priority: '1', 
            attendanceId: 125, 
            patientId: 1 
          }],
          checkedIn: [],
          onGoing: [],
          completed: [],
        },
      },
      loading: false,
      error: null,
    });

    const { result } = renderHook(() => useUnscheduledPatients());

    // Get details for João Silva (should have 2 attendances)
    const joaoDetails = result.current.getPatientAttendanceDetails('João Silva');
    expect(joaoDetails).toHaveLength(2);
    expect(joaoDetails[0]).toMatchObject({
      attendanceId: 123,
      patientId: 1,
      type: 'spiritual',
      status: 'scheduled',
      name: 'João Silva'
    });
    expect(joaoDetails[1]).toMatchObject({
      attendanceId: 125,
      patientId: 1,
      type: 'lightBath',
      status: 'scheduled',
      name: 'João Silva'
    });

    // Get details for Maria Santos (should have 1 attendance)
    const mariaDetails = result.current.getPatientAttendanceDetails('Maria Santos');
    expect(mariaDetails).toHaveLength(1);
    expect(mariaDetails[0]).toMatchObject({
      attendanceId: 124,
      patientId: 2,
      type: 'spiritual',
      status: 'checkedIn',
      name: 'Maria Santos'
    });

    // Get details for specific type
    const joaoSpiritualOnly = result.current.getPatientAttendanceDetails('João Silva', 'spiritual');
    expect(joaoSpiritualOnly).toHaveLength(1);
    expect(joaoSpiritualOnly[0].type).toBe('spiritual');
  });
});

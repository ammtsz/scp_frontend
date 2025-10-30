import { renderHook, waitFor } from '../../test/testUtils';
import { useTreatmentIndicators } from '../useTreatmentIndicators';
import * as treatmentSessionsApi from '@/api/treatment-sessions';

// Mock the treatment sessions API
jest.mock('@/api/treatment-sessions');
const mockApi = treatmentSessionsApi as jest.Mocked<typeof treatmentSessionsApi>;

describe('useTreatmentIndicators', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches treatment indicators successfully', async () => {
    const mockTreatmentSessions = [
      {
        id: 1,
        patient_id: 1,
        treatment_record_id: 1,
        attendance_id: 1,
        treatment_type: 'light_bath' as const,
        body_location: 'Cabeça',
        color: 'azul',
        duration_minutes: 30,
        status: 'scheduled' as const,
        session_number: 1,
        total_sessions: 10,
        planned_sessions: 10,
        completed_sessions: 0,
        start_date: '2024-12-27',
        scheduled_date: '2024-12-28',
        created_at: '2024-12-27T10:00:00Z',
        updated_at: '2024-12-27T10:00:00Z',
      },
      {
        id: 2,
        patient_id: 1,
        treatment_record_id: 1,
        attendance_id: 1,
        treatment_type: 'rod' as const,
        body_location: 'Braço',
        color: undefined,
        duration_minutes: 15,
        status: 'scheduled' as const,
        session_number: 1,
        total_sessions: 5,
        planned_sessions: 5,
        completed_sessions: 0,
        start_date: '2024-12-27',
        scheduled_date: '2024-12-28',
        created_at: '2024-12-27T10:00:00Z',
        updated_at: '2024-12-27T10:00:00Z',
      },
      {
        id: 3,
        patient_id: 2,
        treatment_record_id: 2,
        attendance_id: 2,
        treatment_type: 'light_bath' as const,
        body_location: 'Perna',
        color: 'verde',
        duration_minutes: 25,
        status: 'scheduled' as const,
        session_number: 2,
        total_sessions: 8,
        planned_sessions: 8,
        completed_sessions: 1,
        start_date: '2024-12-26',
        scheduled_date: '2024-12-28',
        created_at: '2024-12-27T10:00:00Z',
        updated_at: '2024-12-27T10:00:00Z',
      },
    ];

    mockApi.getTreatmentSessionsByDate.mockResolvedValue({
      success: true,
      value: mockTreatmentSessions,
    });

    const { result } = renderHook(() => useTreatmentIndicators('2024-12-28'));

    expect(result.current.loading).toBe(true);
    expect(result.current.treatmentsByPatient.size).toBe(0);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Patient 1 should have both light bath and rod (combined)
    const patient1Info = result.current.treatmentsByPatient.get(1);
    expect(patient1Info).toEqual({
      hasLightBath: true,
      hasRod: true,
      lightBathColor: 'azul',
      lightBathDuration: 30,
      bodyLocations: ['Cabeça', 'Braço'],
      treatmentType: 'combined',
    });

    // Patient 2 should have only light bath
    const patient2Info = result.current.treatmentsByPatient.get(2);
    expect(patient2Info).toEqual({
      hasLightBath: true,
      hasRod: false,
      lightBathColor: 'verde',
      lightBathDuration: 25,
      bodyLocations: ['Perna'],
      treatmentType: 'lightbath',
    });

    expect(mockApi.getTreatmentSessionsByDate).toHaveBeenCalledWith('2024-12-28');
  });

  it('handles empty treatment sessions', async () => {
    mockApi.getTreatmentSessionsByDate.mockResolvedValue({
      success: true,
      value: [],
    });

    const { result } = renderHook(() => useTreatmentIndicators('2024-12-28'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.treatmentsByPatient.size).toBe(0);
    expect(result.current.error).toBeNull();
  });

  it('handles API errors', async () => {
    mockApi.getTreatmentSessionsByDate.mockResolvedValue({
      success: false,
      error: 'Failed to fetch treatment sessions'
    });

    const { result } = renderHook(() => useTreatmentIndicators('2024-01-15'));

    expect(result.current.loading).toBe(true);
    expect(result.current.error).toBe(null);
    expect(result.current.treatmentsByPatient.size).toBe(0);

    // Wait for the error state (React Query may retry, so we need to wait longer)
    await waitFor(
      () => {
        expect(result.current.error).not.toBe(null);
      },
      { timeout: 5000 }
    );

    expect(result.current.error).toBe('Failed to fetch treatment sessions');
    expect(result.current.treatmentsByPatient.size).toBe(0);
    // Note: loading may still be true if React Query is in retry state
  });

  it('does not fetch when date is empty', () => {
    const { result } = renderHook(() => useTreatmentIndicators(''));

    expect(result.current.loading).toBe(false);
    expect(result.current.treatmentsByPatient.size).toBe(0);
    expect(mockApi.getTreatmentSessionsByDate).not.toHaveBeenCalled();
  });

  it('refetches data when refresh is called', async () => {
    mockApi.getTreatmentSessionsByDate.mockResolvedValue({
      success: true,
      value: [],
    });

    const { result } = renderHook(() => useTreatmentIndicators('2024-12-28'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(mockApi.getTreatmentSessionsByDate).toHaveBeenCalledTimes(1);

    // Call refresh
    await result.current.refresh();

    expect(mockApi.getTreatmentSessionsByDate).toHaveBeenCalledTimes(2);
  });

  it('correctly categorizes treatment types', async () => {
    const mockTreatmentSessions = [
      {
        id: 1,
        patient_id: 1,
        treatment_record_id: 1,
        attendance_id: 1,
        treatment_type: 'light_bath' as const,
        body_location: 'Cabeça',
        color: 'azul',
        duration_minutes: 30,
        status: 'scheduled' as const,
        session_number: 1,
        total_sessions: 10,
        planned_sessions: 10,
        completed_sessions: 0,
        start_date: '2024-12-27',
        scheduled_date: '2024-12-28',
        created_at: '2024-12-27T10:00:00Z',
        updated_at: '2024-12-27T10:00:00Z',
      },
      {
        id: 2,
        patient_id: 2,
        treatment_record_id: 2,
        attendance_id: 2,
        treatment_type: 'rod' as const,
        body_location: 'Braço',
        color: undefined,
        duration_minutes: 15,
        status: 'scheduled' as const,
        session_number: 1,
        total_sessions: 5,
        planned_sessions: 5,
        completed_sessions: 0,
        start_date: '2024-12-27',
        scheduled_date: '2024-12-28',
        created_at: '2024-12-27T10:00:00Z',
        updated_at: '2024-12-27T10:00:00Z',
      },
    ];

    mockApi.getTreatmentSessionsByDate.mockResolvedValue({
      success: true,
      value: mockTreatmentSessions,
    });

    const { result } = renderHook(() => useTreatmentIndicators('2024-12-28'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Patient 1 should have lightbath type
    const patient1Info = result.current.treatmentsByPatient.get(1);
    expect(patient1Info?.treatmentType).toBe('lightbath');

    // Patient 2 should have rod type
    const patient2Info = result.current.treatmentsByPatient.get(2);
    expect(patient2Info?.treatmentType).toBe('rod');
  });

  it('handles sessions with no body location', async () => {
    const mockTreatmentSessions = [
      {
        id: 1,
        patient_id: 1,
        treatment_record_id: 1,
        attendance_id: 1,
        treatment_type: 'light_bath' as const,
        body_location: '',
        color: 'azul',
        duration_minutes: 30,
        status: 'scheduled' as const,
        session_number: 1,
        total_sessions: 10,
        planned_sessions: 10,
        completed_sessions: 0,
        start_date: '2024-12-27',
        scheduled_date: '2024-12-28',
        created_at: '2024-12-27T10:00:00Z',
        updated_at: '2024-12-27T10:00:00Z',
      },
    ];

    mockApi.getTreatmentSessionsByDate.mockResolvedValue({
      success: true,
      value: mockTreatmentSessions,
    });

    const { result } = renderHook(() => useTreatmentIndicators('2024-12-28'));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    const patient1Info = result.current.treatmentsByPatient.get(1);
    expect(patient1Info?.bodyLocations).toEqual([]);
  });
});
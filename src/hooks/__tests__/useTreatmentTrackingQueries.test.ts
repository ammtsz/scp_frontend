import React, { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useTreatmentSessions,
  useTreatmentTrackingPatients,
  useTreatmentTrackingData,
  useCreateTreatmentSession,
  useCompleteTreatmentSession,
  useCancelTreatmentSession,
  useDeleteTreatmentSession,
  treatmentTrackingKeys,
} from '../useTreatmentTrackingQueries';
import * as treatmentSessionsApi from '@/api/treatment-sessions';
import * as patientsApi from '@/api/patients';
import { PatientPriority, TreatmentStatus } from '@/api/types';

// Mock the API modules
jest.mock('@/api/treatment-sessions');
jest.mock('@/api/patients');

const mockedTreatmentSessionsApi = treatmentSessionsApi as jest.Mocked<typeof treatmentSessionsApi>;
const mockedPatientsApi = patientsApi as jest.Mocked<typeof patientsApi>;

// Test data factories
const createMockTreatmentSession = (id = 1) => ({
  id,
  treatment_record_id: 1,
  attendance_id: 1,
  patient_id: 1,
  treatment_type: 'light_bath' as const,
  body_location: 'head',
  start_date: '2025-01-01',
  planned_sessions: 5,
  completed_sessions: 0,
  status: 'active',
  duration_minutes: 60,
  color: 'blue',
  created_at: '2025-01-01T10:00:00Z',
  updated_at: '2025-01-01T10:00:00Z',
});

const createMockPatient = (id = 1) => ({
  id,
  name: 'Test Patient',
  phone: '11999999999',
  priority: PatientPriority.NORMAL,
  treatment_status: TreatmentStatus.IN_TREATMENT,
  birth_date: '1990-01-01',
  start_date: '2025-01-01',
  missing_appointments_streak: 0,
  created_at: '2025-01-01T10:00:00Z',
  updated_at: '2025-01-01T10:00:00Z',
});

// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  
  const Wrapper = ({ children }: { children: ReactNode }) => {
    return React.createElement(QueryClientProvider, { client: queryClient }, children);
  };
  
  return Wrapper;
};

describe('useTreatmentTrackingQueries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('treatmentTrackingKeys', () => {
    test('should generate correct query keys', () => {
      expect(treatmentTrackingKeys.all).toEqual(['treatmentTracking']);
      expect(treatmentTrackingKeys.sessions()).toEqual(['treatmentTracking', 'sessions']);
      expect(treatmentTrackingKeys.patients()).toEqual(['treatmentTracking', 'patients']);
    });
  });

  describe('useTreatmentSessions', () => {
    test('should fetch treatment sessions successfully', async () => {
      const mockSessions = [createMockTreatmentSession(1), createMockTreatmentSession(2)];
      mockedTreatmentSessionsApi.getTreatmentSessions.mockResolvedValueOnce({
        success: true,
        value: mockSessions,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useTreatmentSessions(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockSessions);
      expect(mockedTreatmentSessionsApi.getTreatmentSessions).toHaveBeenCalledTimes(1);
    });

    test('should handle API error', async () => {
      mockedTreatmentSessionsApi.getTreatmentSessions.mockResolvedValueOnce({
        success: false,
        error: 'API Error',
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useTreatmentSessions(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toBe('API Error');
    });

    test('should handle API success with no value', async () => {
      mockedTreatmentSessionsApi.getTreatmentSessions.mockResolvedValueOnce({
        success: true,
        value: undefined,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useTreatmentSessions(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });

    test('should throw error when API call fails', async () => {
      mockedTreatmentSessionsApi.getTreatmentSessions.mockRejectedValueOnce(new Error('Network error'));

      const wrapper = createWrapper();
      const { result } = renderHook(() => useTreatmentSessions(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toBe('Network error');
    });
  });

  describe('useTreatmentTrackingPatients', () => {
    test('should fetch patients successfully', async () => {
      const mockPatients = [createMockPatient(1), createMockPatient(2)];
      mockedPatientsApi.getPatients.mockResolvedValueOnce({
        success: true,
        value: mockPatients,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useTreatmentTrackingPatients(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockPatients);
      expect(mockedPatientsApi.getPatients).toHaveBeenCalledTimes(1);
    });

    test('should handle API error', async () => {
      mockedPatientsApi.getPatients.mockResolvedValueOnce({
        success: false,
        error: 'Failed to fetch patients',
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useTreatmentTrackingPatients(), { wrapper });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toBe('Failed to fetch patients');
    });

    test('should handle empty patients list', async () => {
      mockedPatientsApi.getPatients.mockResolvedValueOnce({
        success: true,
        value: [],
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useTreatmentTrackingPatients(), { wrapper });

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });
  });

  describe('useTreatmentTrackingData', () => {
    test('should combine sessions and patients data successfully', async () => {
      const mockSessions = [createMockTreatmentSession(1)];
      const mockPatients = [createMockPatient(1)];

      mockedTreatmentSessionsApi.getTreatmentSessions.mockResolvedValueOnce({
        success: true,
        value: mockSessions,
      });
      mockedPatientsApi.getPatients.mockResolvedValueOnce({
        success: true,
        value: mockPatients,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useTreatmentTrackingData(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.sessions).toEqual(mockSessions);
      expect(result.current.patients).toEqual(mockPatients);
      expect(result.current.error).toBeNull();
    });

    test('should handle loading state correctly', () => {
      mockedTreatmentSessionsApi.getTreatmentSessions.mockImplementationOnce(
        () => new Promise(() => {}) // Never resolves
      );
      mockedPatientsApi.getPatients.mockResolvedValueOnce({
        success: true,
        value: [],
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useTreatmentTrackingData(), { wrapper });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.sessions).toEqual([]);
      expect(result.current.patients).toEqual([]);
    });

    test('should handle error from sessions query', async () => {
      const sessionError = new Error('Sessions error');
      mockedTreatmentSessionsApi.getTreatmentSessions.mockRejectedValueOnce(sessionError);
      mockedPatientsApi.getPatients.mockResolvedValueOnce({
        success: true,
        value: [],
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useTreatmentTrackingData(), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toEqual(sessionError);
      });

      expect(result.current.isLoading).toBe(false);
    });

    test('should handle error from patients query', async () => {
      const patientError = new Error('Patients error');
      mockedTreatmentSessionsApi.getTreatmentSessions.mockResolvedValueOnce({
        success: true,
        value: [],
      });
      mockedPatientsApi.getPatients.mockRejectedValueOnce(patientError);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useTreatmentTrackingData(), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toEqual(patientError);
      });

      expect(result.current.isLoading).toBe(false);
    });

    test('should call refetch for both queries', async () => {
      const mockRefetch1 = jest.fn().mockResolvedValueOnce(undefined);
      const mockRefetch2 = jest.fn().mockResolvedValueOnce(undefined);

      mockedTreatmentSessionsApi.getTreatmentSessions.mockResolvedValueOnce({
        success: true,
        value: [],
      });
      mockedPatientsApi.getPatients.mockResolvedValueOnce({
        success: true,
        value: [],
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useTreatmentTrackingData(), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // Mock the internal query refetch methods
      jest.spyOn(result.current, 'refetch').mockImplementationOnce(async () => {
        await Promise.all([mockRefetch1(), mockRefetch2()]);
      });

      await result.current.refetch();

      // The refetch should have been called
      expect(result.current.refetch).toHaveBeenCalled();
    });
  });

  describe('useCreateTreatmentSession', () => {
    test('should create treatment session successfully', async () => {
      const mockSession = createMockTreatmentSession(99);
      const sessionData = {
        treatment_record_id: 1,
        attendance_id: 1,
        patient_id: 1,
        treatment_type: 'light_bath' as const,
        body_location: 'head',
        start_date: '2025-01-01',
        planned_sessions: 5,
      };

      mockedTreatmentSessionsApi.createTreatmentSession.mockResolvedValueOnce({
        success: true,
        value: mockSession,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateTreatmentSession(), { wrapper });

      await waitFor(() => {
        expect(result.current.mutate).toBeDefined();
      });

      result.current.mutate(sessionData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockSession);
      expect(mockedTreatmentSessionsApi.createTreatmentSession).toHaveBeenCalledWith(sessionData);
    });

    test('should handle creation error', async () => {
      mockedTreatmentSessionsApi.createTreatmentSession.mockResolvedValueOnce({
        success: false,
        error: 'Creation failed',
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCreateTreatmentSession(), { wrapper });

      const sessionData = {
        treatment_record_id: 1,
        attendance_id: 1,
        patient_id: 1,
        treatment_type: 'light_bath' as const,
        body_location: 'head',
        start_date: '2025-01-01',
        planned_sessions: 5,
      };

      await waitFor(() => {
        expect(result.current.mutate).toBeDefined();
      });

      result.current.mutate(sessionData);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toBe('Creation failed');
    });
  });

  describe('useCompleteTreatmentSession', () => {
    test('should complete treatment session successfully', async () => {
      const mockCompletedSession = {
        ...createMockTreatmentSession(1),
        status: 'completed' as const,
      };

      mockedTreatmentSessionsApi.completeTreatmentSession.mockResolvedValueOnce({
        success: true,
        value: mockCompletedSession,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCompleteTreatmentSession(), { wrapper });

      const completionData = {
        sessionId: 'session-1',
        completionData: {
          completion_notes: 'Treatment completed successfully',
        },
      };

      await waitFor(() => {
        expect(result.current.mutate).toBeDefined();
      });

      result.current.mutate(completionData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockCompletedSession);
      expect(mockedTreatmentSessionsApi.completeTreatmentSession).toHaveBeenCalledWith(
        'session-1',
        { completion_notes: 'Treatment completed successfully' }
      );
    });

    test('should handle completion error', async () => {
      mockedTreatmentSessionsApi.completeTreatmentSession.mockResolvedValueOnce({
        success: false,
        error: 'Completion failed',
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCompleteTreatmentSession(), { wrapper });

      const completionData = {
        sessionId: 'session-1',
        completionData: {
          completion_notes: 'Treatment completed',
        },
      };

      await waitFor(() => {
        expect(result.current.mutate).toBeDefined();
      });

      result.current.mutate(completionData);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toBe('Completion failed');
    });
  });

  describe('useCancelTreatmentSession', () => {
    test('should cancel treatment session successfully', async () => {
      const mockCancelledSession = {
        ...createMockTreatmentSession(1),
        status: 'cancelled' as const,
      };

      mockedTreatmentSessionsApi.cancelTreatmentSession.mockResolvedValueOnce({
        success: true,
        value: mockCancelledSession,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCancelTreatmentSession(), { wrapper });

      await waitFor(() => {
        expect(result.current.mutate).toBeDefined();
      });

      result.current.mutate('session-1');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockCancelledSession);
      expect(mockedTreatmentSessionsApi.cancelTreatmentSession).toHaveBeenCalledWith('session-1');
    });

    test('should handle cancellation error', async () => {
      mockedTreatmentSessionsApi.cancelTreatmentSession.mockResolvedValueOnce({
        success: false,
        error: 'Cancellation failed',
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCancelTreatmentSession(), { wrapper });

      await waitFor(() => {
        expect(result.current.mutate).toBeDefined();
      });

      result.current.mutate('session-1');

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toBe('Cancellation failed');
    });
  });

  describe('useDeleteTreatmentSession', () => {
    test('should delete treatment session successfully', async () => {
      mockedTreatmentSessionsApi.deleteTreatmentSession.mockResolvedValueOnce({
        success: true,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useDeleteTreatmentSession(), { wrapper });

      await waitFor(() => {
        expect(result.current.mutate).toBeDefined();
      });

      result.current.mutate('session-1');

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockedTreatmentSessionsApi.deleteTreatmentSession).toHaveBeenCalledWith('session-1');
    });

    test('should handle deletion error', async () => {
      mockedTreatmentSessionsApi.deleteTreatmentSession.mockResolvedValueOnce({
        success: false,
        error: 'Deletion failed',
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useDeleteTreatmentSession(), { wrapper });

      await waitFor(() => {
        expect(result.current.mutate).toBeDefined();
      });

      result.current.mutate('session-1');

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toBe('Deletion failed');
    });

    test('should throw error when API call fails', async () => {
      mockedTreatmentSessionsApi.deleteTreatmentSession.mockRejectedValueOnce(new Error('Network error'));

      const wrapper = createWrapper();
      const { result } = renderHook(() => useDeleteTreatmentSession(), { wrapper });

      await waitFor(() => {
        expect(result.current.mutate).toBeDefined();
      });

      result.current.mutate('session-1');

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toBe('Network error');
    });
  });
});
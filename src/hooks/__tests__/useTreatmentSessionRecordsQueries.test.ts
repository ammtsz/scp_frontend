import React, { ReactNode } from 'react';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useTreatmentSessionRecords,
  useCompleteTreatmentSessionRecord,
  useBulkCompleteTreatmentSessionRecords,
  treatmentSessionRecordKeys,
} from '../useTreatmentSessionRecordsQueries';
import * as treatmentSessionRecordsApi from '@/api/treatment-session-records';
import * as treatmentSessionsApi from '@/api/treatment-sessions';

// Mock the API modules
jest.mock('@/api/treatment-session-records');
jest.mock('@/api/treatment-sessions');

const mockedTreatmentSessionRecordsApi = treatmentSessionRecordsApi as jest.Mocked<typeof treatmentSessionRecordsApi>;
const mockedTreatmentSessionsApi = treatmentSessionsApi as jest.Mocked<typeof treatmentSessionsApi>;

// Test data factories
const createMockSessionRecord = (id = 1) => ({
  id,
  treatment_session_id: 1,
  session_number: 1,
  scheduled_date: '2025-01-01',
  status: 'scheduled' as const,
  start_time: '10:00',
  end_time: '11:00',
  notes: 'Test notes',
  created_at: '2025-01-01T10:00:00Z',
  updated_at: '2025-01-01T10:00:00Z',
});

const createMockTreatmentSession = (id = 1) => ({
  id,
  treatment_record_id: id * 5,
  attendance_id: id * 3,
  patient_id: id * 2,
  treatment_type: 'light_bath' as const,
  body_location: 'Test location',
  start_date: '2025-01-01',
  planned_sessions: 10,
  completed_sessions: 2,
  status: 'active',
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

describe('useTreatmentSessionRecordsQueries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('useTreatmentSessionRecords', () => {
    test('should fetch records when sessionId is provided', async () => {
      const sessionId = 123;
      const mockRecords = [createMockSessionRecord(1), createMockSessionRecord(2)];
      
      mockedTreatmentSessionRecordsApi.getTreatmentSessionRecordsBySession.mockResolvedValueOnce({
        success: true,
        value: mockRecords,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(
        () => useTreatmentSessionRecords(sessionId),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual(mockRecords);
      expect(mockedTreatmentSessionRecordsApi.getTreatmentSessionRecordsBySession).toHaveBeenCalledWith('123');
    });

    test('should not fetch when sessionId is zero', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(
        () => useTreatmentSessionRecords(0),
        { wrapper }
      );

      expect(result.current.isPending).toBe(true);
      expect(mockedTreatmentSessionRecordsApi.getTreatmentSessionRecordsBySession).not.toHaveBeenCalled();
    });

    test('should not fetch when sessionId is negative', () => {
      const wrapper = createWrapper();
      const { result } = renderHook(
        () => useTreatmentSessionRecords(-1),
        { wrapper }
      );

      expect(result.current.isPending).toBe(true);
      expect(mockedTreatmentSessionRecordsApi.getTreatmentSessionRecordsBySession).not.toHaveBeenCalled();
    });

    test('should handle API errors', async () => {
      const sessionId = 123;
      const error = new Error('API Error');
      
      mockedTreatmentSessionRecordsApi.getTreatmentSessionRecordsBySession.mockRejectedValueOnce(error);

      const wrapper = createWrapper();
      const { result } = renderHook(
        () => useTreatmentSessionRecords(sessionId),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      }, { timeout: 5000 });

      expect(result.current.error).toBe(error);
    });

    test('should handle API success false response', async () => {
      const sessionId = 123;
      
      mockedTreatmentSessionRecordsApi.getTreatmentSessionRecordsBySession.mockResolvedValueOnce({
        success: false,
        error: 'Records not found',
      });

      const wrapper = createWrapper();
      const { result } = renderHook(
        () => useTreatmentSessionRecords(sessionId),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      }, { timeout: 5000 });
    });

    test('should handle empty array response', async () => {
      const sessionId = 123;
      
      mockedTreatmentSessionRecordsApi.getTreatmentSessionRecordsBySession.mockResolvedValueOnce({
        success: true,
        value: [],
      });

      const wrapper = createWrapper();
      const { result } = renderHook(
        () => useTreatmentSessionRecords(sessionId),
        { wrapper }
      );

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.data).toEqual([]);
    });
  });

  describe('useCompleteTreatmentSessionRecord', () => {
    test('should complete record and update session successfully', async () => {
      const mockRecord = createMockSessionRecord(1);
      const mockSession = createMockTreatmentSession(1);
      
      mockedTreatmentSessionRecordsApi.completeTreatmentSessionRecord.mockResolvedValueOnce({
        success: true,
        value: mockRecord,
      });
      
      mockedTreatmentSessionsApi.updateTreatmentSession.mockResolvedValueOnce({
        success: true,
        value: mockSession,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCompleteTreatmentSessionRecord(), { wrapper });

      const completionData = {
        recordId: '1',
        sessionId: '123',
        completionData: { 
          notes: 'Treatment completed successfully',
          attendanceId: 1
        },
        newCompletedCount: 2,
      };

      result.current.mutate(completionData);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockedTreatmentSessionRecordsApi.completeTreatmentSessionRecord).toHaveBeenCalledWith(
        '1',
        completionData.completionData
      );
      expect(mockedTreatmentSessionsApi.updateTreatmentSession).toHaveBeenCalledWith(
        '123',
        { completed_sessions: 2 }
      );
    });

    test('should handle completion API error', async () => {
      const error = new Error('Completion failed');
      mockedTreatmentSessionRecordsApi.completeTreatmentSessionRecord.mockRejectedValueOnce(error);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCompleteTreatmentSessionRecord(), { wrapper });

      const completionData = {
        recordId: '1',
        sessionId: '123',
        completionData: { 
          notes: 'Test',
          attendanceId: 1
        },
        newCompletedCount: 2,
      };

      result.current.mutate(completionData);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(error);
    });

    test('should handle update session API error after successful completion', async () => {
      const mockRecord = createMockSessionRecord(1);
      const updateError = new Error('Update failed');
      
      mockedTreatmentSessionRecordsApi.completeTreatmentSessionRecord.mockResolvedValueOnce({
        success: true,
        value: mockRecord,
      });
      
      mockedTreatmentSessionsApi.updateTreatmentSession.mockRejectedValueOnce(updateError);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useCompleteTreatmentSessionRecord(), { wrapper });

      const completionData = {
        recordId: '1',
        sessionId: '123',
        completionData: { 
          notes: 'Test',
          attendanceId: 1
        },
        newCompletedCount: 2,
      };

      result.current.mutate(completionData);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toBe(updateError);
    });
  });

  describe('useBulkCompleteTreatmentSessionRecords', () => {
    test('should complete multiple records successfully', async () => {
      const mockRecord1 = { ...createMockSessionRecord(1), session_number: 2 };
      const mockRecord2 = { ...createMockSessionRecord(2), session_number: 3 };
      const mockSession1 = createMockTreatmentSession(1);
      const mockSession2 = createMockTreatmentSession(2);
      
      // Mock getting existing records for both sessions
      mockedTreatmentSessionRecordsApi.getTreatmentSessionRecordsBySession
        .mockResolvedValueOnce({ success: true, value: [mockRecord1] })
        .mockResolvedValueOnce({ success: true, value: [mockRecord2] });
      
      mockedTreatmentSessionRecordsApi.completeTreatmentSessionRecord
        .mockResolvedValueOnce({ success: true, value: mockRecord1 })
        .mockResolvedValueOnce({ success: true, value: mockRecord2 });
      
      mockedTreatmentSessionsApi.updateTreatmentSession
        .mockResolvedValueOnce({ success: true, value: mockSession1 })
        .mockResolvedValueOnce({ success: true, value: mockSession2 });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useBulkCompleteTreatmentSessionRecords(), { wrapper });

      const completions = [
        {
          sessionId: '123',
          completionData: { 
            notes: 'Session 1 completed',
            attendanceId: 1
          },
          newCompletedCount: 2,
        },
        {
          sessionId: '456',
          completionData: { 
            notes: 'Session 2 completed',
            attendanceId: 2
          },
          newCompletedCount: 3,
        }
      ];

      result.current.mutate(completions);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockedTreatmentSessionRecordsApi.getTreatmentSessionRecordsBySession).toHaveBeenCalledTimes(2);
      expect(mockedTreatmentSessionRecordsApi.completeTreatmentSessionRecord).toHaveBeenCalledTimes(2);
      expect(mockedTreatmentSessionsApi.updateTreatmentSession).toHaveBeenCalledTimes(2);
    });

    test('should handle partial failures', async () => {
      const mockRecord1 = createMockSessionRecord(1);
      const error = new Error('Second completion failed');
      
      mockedTreatmentSessionRecordsApi.completeTreatmentSessionRecord
        .mockResolvedValueOnce({ success: true, value: mockRecord1 })
        .mockRejectedValueOnce(error);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useBulkCompleteTreatmentSessionRecords(), { wrapper });

      const completions = [
        {
          sessionId: '123',
          completionData: { 
            notes: 'Session 1 completed',
            attendanceId: 1
          },
          newCompletedCount: 2,
        }
      ];

      result.current.mutate(completions);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });

    test('should handle API success false response', async () => {
      mockedTreatmentSessionRecordsApi.completeTreatmentSessionRecord.mockResolvedValueOnce({
        success: false,
        error: 'Completion not allowed',
        value: undefined,
      });

      const wrapper = createWrapper();
      const { result } = renderHook(() => useBulkCompleteTreatmentSessionRecords(), { wrapper });

      const completions = [
        {
          sessionId: '123',
          completionData: { 
            notes: 'Session 1 completed',
            attendanceId: 1
          },
          newCompletedCount: 2,
        }
      ];

      result.current.mutate(completions);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });

    test('should handle session update failure after successful completion', async () => {
      const mockRecord1 = { ...createMockSessionRecord(1), session_number: 2 };
      
      // Mock getting existing records
      mockedTreatmentSessionRecordsApi.getTreatmentSessionRecordsBySession.mockResolvedValueOnce({
        success: true,
        value: [mockRecord1],
      });
      
      mockedTreatmentSessionRecordsApi.completeTreatmentSessionRecord.mockResolvedValueOnce({
        success: true,
        value: mockRecord1,
      });
      
      const updateError = new Error('Session update failed');
      mockedTreatmentSessionsApi.updateTreatmentSession.mockRejectedValueOnce(updateError);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useBulkCompleteTreatmentSessionRecords(), { wrapper });

      const completions = [
        {
          sessionId: '123',
          completionData: { 
            notes: 'Session 1 completed',
            attendanceId: 1
          },
          newCompletedCount: 2,
        }
      ];

      result.current.mutate(completions);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toContain('Falhou ao completar 1 registro(s) de sessão');
    });

    test('should handle multiple session update failures', async () => {
      const mockRecord1 = createMockSessionRecord(1);
      const mockRecord2 = createMockSessionRecord(2);
      const updateError1 = new Error('First update failed');
      const updateError2 = new Error('Second update failed');
      
      mockedTreatmentSessionRecordsApi.completeTreatmentSessionRecord
        .mockResolvedValueOnce({ success: true, value: mockRecord1 })
        .mockResolvedValueOnce({ success: true, value: mockRecord2 });
      
      mockedTreatmentSessionsApi.updateTreatmentSession
        .mockRejectedValueOnce(updateError1)
        .mockRejectedValueOnce(updateError2);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useBulkCompleteTreatmentSessionRecords(), { wrapper });

      const completions = [
        {
          sessionId: '123',
          completionData: { 
            notes: 'Session 1 completed',
            attendanceId: 1
          },
          newCompletedCount: 2,
        }
      ];

      result.current.mutate(completions);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });
    });

    test('should handle empty completions array', async () => {
      const wrapper = createWrapper();
      const { result } = renderHook(() => useBulkCompleteTreatmentSessionRecords(), { wrapper });

      const completions: Array<{
        sessionId: string;
        completionData: { notes?: string; attendanceId?: number };
        newCompletedCount: number;
      }> = [];

      result.current.mutate(completions);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(mockedTreatmentSessionRecordsApi.completeTreatmentSessionRecord).not.toHaveBeenCalled();
      expect(mockedTreatmentSessionsApi.updateTreatmentSession).not.toHaveBeenCalled();
    });

    test('should handle network errors gracefully', async () => {
      const networkError = new Error('Network unavailable');
      
      // Mock network failure on getting records
      mockedTreatmentSessionRecordsApi.getTreatmentSessionRecordsBySession.mockRejectedValueOnce(networkError);

      const wrapper = createWrapper();
      const { result } = renderHook(() => useBulkCompleteTreatmentSessionRecords(), { wrapper });

      const completions = [
        {
          sessionId: '123',
          completionData: { 
            notes: 'Session 1 completed',
            attendanceId: 1
          },
          newCompletedCount: 2,
        }
      ];

      result.current.mutate(completions);

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error?.message).toContain('Falhou ao completar 1 registro(s) de sessão');
    });
  });

  describe('treatmentSessionRecordKeys', () => {
    test('should generate correct query keys', () => {
      expect(treatmentSessionRecordKeys.all).toEqual(['treatmentSessionRecords']);
      expect(treatmentSessionRecordKeys.bySession('123')).toEqual(['treatmentSessionRecords', 'session', '123']);
    });
  });
});
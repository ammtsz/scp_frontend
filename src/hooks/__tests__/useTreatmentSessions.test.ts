import { renderHook, waitFor, act } from '../../test/testUtils';
import { useTreatmentSessions, useDeleteTreatmentSession } from '../useTreatmentSessionsQueries';
import { getTreatmentSessionsByPatient, deleteTreatmentSession } from '@/api/treatment-sessions';

// Mock the API functions
jest.mock('@/api/treatment-sessions', () => ({
  getTreatmentSessionsByPatient: jest.fn(),
  deleteTreatmentSession: jest.fn(),
}));

const mockGetTreatmentSessionsByPatient = getTreatmentSessionsByPatient as jest.MockedFunction<typeof getTreatmentSessionsByPatient>;
const mockDeleteTreatmentSession = deleteTreatmentSession as jest.MockedFunction<typeof deleteTreatmentSession>;

describe('useTreatmentSessions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockTreatmentSession = {
    id: 1,
    treatment_record_id: 1,
    attendance_id: 1,
    patient_id: 1,
    treatment_type: 'light_bath' as const,
    body_location: 'Cabeça',
    start_date: '2025-01-01',
    planned_sessions: 10,
    completed_sessions: 3,
    status: 'active',
    duration_minutes: 30,
    color: 'azul',
    notes: 'Tratamento indo bem',
    sessionRecords: [],
    created_at: '2025-01-01T10:00:00Z',
    updated_at: '2025-01-01T10:00:00Z',
  };

  describe('Successful API Response', () => {
    it('fetches treatment sessions successfully', async () => {
      mockGetTreatmentSessionsByPatient.mockResolvedValue({
        success: true,
        value: [mockTreatmentSession],
      });

      const { result } = renderHook(() => useTreatmentSessions(1));

      // Wait for the API call to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.treatmentSessions).toEqual([mockTreatmentSession]);
      expect(result.current.error).toBe(null);
      expect(mockGetTreatmentSessionsByPatient).toHaveBeenCalledWith('1');
    });

    it('handles empty treatment sessions list', async () => {
      mockGetTreatmentSessionsByPatient.mockResolvedValue({
        success: true,
        value: [],
      });

      const { result } = renderHook(() => useTreatmentSessions(1));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.treatmentSessions).toEqual([]);
      expect(result.current.error).toBe(null);
    });

    it('handles undefined value in successful response', async () => {
      mockGetTreatmentSessionsByPatient.mockResolvedValue({
        success: true,
        value: undefined,
      });

      const { result } = renderHook(() => useTreatmentSessions(1));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.treatmentSessions).toEqual([]);
      expect(result.current.error).toBe(null);
    });
  });

  describe('Error Handling', () => {
    it('handles API error response with message', async () => {
      mockGetTreatmentSessionsByPatient.mockResolvedValue({
        success: false,
        error: 'Paciente não encontrado',
      });

      const { result } = renderHook(() => useTreatmentSessions(1));

      await waitFor(() => {
        expect(result.current.error).toBe('Paciente não encontrado');
      }, { timeout: 5000 });

      expect(result.current.treatmentSessions).toEqual([]);
    });

    it('handles API error response without message', async () => {
      mockGetTreatmentSessionsByPatient.mockResolvedValue({
        success: false,
      });

      const { result } = renderHook(() => useTreatmentSessions(1));

      await waitFor(() => {
        expect(result.current.error).toBe('Erro ao carregar sessões de tratamento');
      }, { timeout: 5000 });

      expect(result.current.treatmentSessions).toEqual([]);
    });

    it('handles API rejection', async () => {
      mockGetTreatmentSessionsByPatient.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useTreatmentSessions(1));

      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
      }, { timeout: 5000 });

      expect(result.current.treatmentSessions).toEqual([]);
    });
  });



  describe('Patient ID Handling', () => {
    it('does not fetch when patient ID is 0', () => {
      renderHook(() => useTreatmentSessions(0));

      expect(mockGetTreatmentSessionsByPatient).not.toHaveBeenCalled();
    });

    it('fetches when patient ID changes', async () => {
      mockGetTreatmentSessionsByPatient.mockResolvedValue({
        success: true,
        value: [mockTreatmentSession],
      });

      const { rerender } = renderHook(
        ({ patientId }) => useTreatmentSessions(patientId),
        { 
          initialProps: { patientId: 1 },
        }
      );

      await waitFor(() => {
        expect(mockGetTreatmentSessionsByPatient).toHaveBeenCalledWith('1');
      });

      // Change patient ID
      rerender({ patientId: 2 });

      await waitFor(() => {
        expect(mockGetTreatmentSessionsByPatient).toHaveBeenCalledWith('2');
      });

      expect(mockGetTreatmentSessionsByPatient).toHaveBeenCalledTimes(2);
    });
  });

  describe('Refetch Functionality', () => {
    it('refetches data when refetch is called', async () => {
      mockGetTreatmentSessionsByPatient.mockResolvedValue({
        success: true,
        value: [mockTreatmentSession],
      });

      const { result } = renderHook(() => useTreatmentSessions(1));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Call refetch
      await act(async () => {
        await result.current.refetch();
      });

      expect(mockGetTreatmentSessionsByPatient).toHaveBeenCalledTimes(2);
      expect(mockGetTreatmentSessionsByPatient).toHaveBeenCalledWith('1');
    });
  });
});

describe('useDeleteTreatmentSession', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Successful Deletion', () => {
    it('deletes treatment session successfully', async () => {
      mockDeleteTreatmentSession.mockResolvedValue({
        success: true,
      });

      const { result } = renderHook(() => useDeleteTreatmentSession());

      // Initially not pending
      expect(result.current.isPending).toBe(false);
      expect(result.current.error).toBe(null);

      await act(async () => {
        await result.current.mutateAsync('1');
      });

      expect(result.current.isPending).toBe(false);
      expect(result.current.error).toBe(null);
      expect(mockDeleteTreatmentSession).toHaveBeenCalledWith('1');
    });
  });

  describe('API Error Handling', () => {
    it('handles API error response with message', async () => {
      mockDeleteTreatmentSession.mockResolvedValue({
        success: false,
        error: 'Sessão não encontrada',
      });

      const { result } = renderHook(() => useDeleteTreatmentSession());

      await expect(async () => {
        await act(async () => {
          await result.current.mutateAsync('1');
        });
      }).rejects.toThrow('Sessão não encontrada');
    });

    it('handles API error response without message', async () => {
      mockDeleteTreatmentSession.mockResolvedValue({
        success: false,
      });

      const { result } = renderHook(() => useDeleteTreatmentSession());

      await expect(async () => {
        await act(async () => {
          await result.current.mutateAsync('1');
        });
      }).rejects.toThrow('Erro ao remover sessão de tratamento');
    });

    it('handles API rejection', async () => {
      mockDeleteTreatmentSession.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useDeleteTreatmentSession());

      await expect(async () => {
        await act(async () => {
          await result.current.mutateAsync('1');
        });
      }).rejects.toThrow('Network error');
    });
  });
});
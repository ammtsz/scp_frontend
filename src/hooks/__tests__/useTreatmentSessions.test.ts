import { renderHook, waitFor, act } from '@testing-library/react';
import { useTreatmentSessions } from '../useTreatmentSessions';
import { getTreatmentSessionsByPatient } from '@/api/treatment-sessions';

// Mock the API function
jest.mock('@/api/treatment-sessions', () => ({
  getTreatmentSessionsByPatient: jest.fn(),
}));

const mockGetTreatmentSessionsByPatient = getTreatmentSessionsByPatient as jest.MockedFunction<typeof getTreatmentSessionsByPatient>;

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

      // Initially loading
      expect(result.current.loading).toBe(true);
      expect(result.current.treatmentSessions).toEqual([]);
      expect(result.current.error).toBe(null);

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
  });

  describe('API Error Handling', () => {
    it('handles API error response', async () => {
      mockGetTreatmentSessionsByPatient.mockResolvedValue({
        success: false,
        error: 'Paciente não encontrado',
      });

      const { result } = renderHook(() => useTreatmentSessions(1));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.treatmentSessions).toEqual([]);
      expect(result.current.error).toBe('Paciente não encontrado');
    });

    it('handles API error without message', async () => {
      mockGetTreatmentSessionsByPatient.mockResolvedValue({
        success: false,
      });

      const { result } = renderHook(() => useTreatmentSessions(1));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.treatmentSessions).toEqual([]);
      expect(result.current.error).toBe('Erro ao carregar sessões de tratamento');
    });

    it('handles API rejection', async () => {
      mockGetTreatmentSessionsByPatient.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useTreatmentSessions(1));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.treatmentSessions).toEqual([]);
      expect(result.current.error).toBe('Erro ao carregar sessões de tratamento');
    });
  });

  describe('Patient ID Handling', () => {
    it('does not fetch when patient ID is 0', () => {
      renderHook(() => useTreatmentSessions(0));

      expect(mockGetTreatmentSessionsByPatient).not.toHaveBeenCalled();
    });

    it('does not fetch when patient ID is negative', () => {
      renderHook(() => useTreatmentSessions(-1));

      expect(mockGetTreatmentSessionsByPatient).not.toHaveBeenCalled();
    });

    it('fetches when patient ID changes', async () => {
      mockGetTreatmentSessionsByPatient.mockResolvedValue({
        success: true,
        value: [mockTreatmentSession],
      });

      const { result, rerender } = renderHook(
        ({ patientId }) => useTreatmentSessions(patientId),
        { initialProps: { patientId: 1 } }
      );

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(mockGetTreatmentSessionsByPatient).toHaveBeenCalledWith('1');

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

      // Clear the mock to ensure we're testing the refetch
      mockGetTreatmentSessionsByPatient.mockClear();

      // Call refetch
      await act(async () => {
        await result.current.refetch();
      });

      expect(mockGetTreatmentSessionsByPatient).toHaveBeenCalledWith('1');
    });

    it('handles refetch error', async () => {
      // First call succeeds
      mockGetTreatmentSessionsByPatient.mockResolvedValueOnce({
        success: true,
        value: [mockTreatmentSession],
      });

      const { result } = renderHook(() => useTreatmentSessions(1));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Second call (refetch) fails
      mockGetTreatmentSessionsByPatient.mockResolvedValueOnce({
        success: false,
        error: 'Server error',
      });

      await act(async () => {
        await result.current.refetch();
      });

      expect(result.current.error).toBe('Server error');
      expect(result.current.treatmentSessions).toEqual([]);
    });
  });

  describe('Loading States', () => {
    it('sets loading to true during initial fetch', () => {
      mockGetTreatmentSessionsByPatient.mockReturnValue(new Promise(() => {})); // Never resolves

      const { result } = renderHook(() => useTreatmentSessions(1));

      expect(result.current.loading).toBe(true);
    });

    it('sets loading to true during refetch', async () => {
      mockGetTreatmentSessionsByPatient.mockResolvedValue({
        success: true,
        value: [mockTreatmentSession],
      });

      const { result } = renderHook(() => useTreatmentSessions(1));

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Mock a slow refetch
      mockGetTreatmentSessionsByPatient.mockReturnValue(new Promise(() => {})); // Never resolves

      act(() => {
        result.current.refetch();
      });

      expect(result.current.loading).toBe(true);
    });
  });
});
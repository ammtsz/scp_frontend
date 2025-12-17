import {
  getTreatmentSessions,
  getTreatmentSessionById,
  getTreatmentSessionsByPatient,
  getTreatmentSessionsByDate,
  createTreatmentSession,
  updateTreatmentSession,
  completeTreatmentSession,
  cancelTreatmentSession,
  deleteTreatmentSession
} from '../index';

// Mock the api instance
jest.mock('@/api/lib/axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  put: jest.fn(),
  delete: jest.fn(),
}));

import api from '@/api/lib/axios';
const mockApi = api as jest.Mocked<typeof api>;

describe('Treatment Sessions API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockTreatmentSession = {
    id: 1,
    patient_id: 1,
    type: 'spiritual',
    status: 'active' as const,
    total_sessions_recommended: 12,
    sessions_completed: 3,
    start_date: '2025-01-15',
    end_date: '2025-04-15',
    frequency: 'weekly' as const,
    notes: 'Standard spiritual treatment series',
    created_at: '2025-01-15T10:00:00Z',
    updated_at: '2025-01-15T10:00:00Z',
  };

  describe('getTreatmentSessions', () => {
    it('should fetch all treatment sessions successfully', async () => {
      const mockResponse = { data: [mockTreatmentSession] };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await getTreatmentSessions();

      expect(mockApi.get).toHaveBeenCalledWith('/treatment-sessions');
      expect(result).toEqual({
        success: true,
        value: [mockTreatmentSession]
      });
    });

    it('should return error on API failure', async () => {
      const mockError = { status: 500 };
      mockApi.get.mockRejectedValue(mockError);

      const result = await getTreatmentSessions();

      expect(result).toEqual({
        success: false,
        error: 'Erro interno do servidor, por favor tente novamente mais tarde'
      });
    });
  });

  describe('getTreatmentSessionById', () => {
    it('should fetch treatment session by ID successfully', async () => {
      const mockResponse = { data: mockTreatmentSession };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await getTreatmentSessionById('1');

      expect(mockApi.get).toHaveBeenCalledWith('/treatment-sessions/1');
      expect(result).toEqual({
        success: true,
        value: mockTreatmentSession
      });
    });

    it('should return error when treatment session not found', async () => {
      const mockError = { status: 404 };
      mockApi.get.mockRejectedValue(mockError);

      const result = await getTreatmentSessionById('999');

      expect(result).toEqual({
        success: false,
        error: 'Recurso não encontrado'
      });
    });
  });

  describe('getTreatmentSessionsByPatient', () => {
    it('should fetch treatment sessions by patient ID successfully', async () => {
      const mockResponse = { data: [mockTreatmentSession] };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await getTreatmentSessionsByPatient('1');

      expect(mockApi.get).toHaveBeenCalledWith('/treatment-sessions/patient/1');
      expect(result).toEqual({
        success: true,
        value: [mockTreatmentSession]
      });
    });
  });

  describe('getTreatmentSessionsByDate', () => {
    it('should fetch treatment sessions by date successfully', async () => {
      const mockResponse = { data: [mockTreatmentSession] };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await getTreatmentSessionsByDate('2025-01-15');

      expect(mockApi.get).toHaveBeenCalledWith('/treatment-sessions/date/2025-01-15');
      expect(result).toEqual({
        success: true,
        value: [mockTreatmentSession]
      });
    });

    it('should return empty array when no sessions found for date', async () => {
      const mockResponse = { data: [] };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await getTreatmentSessionsByDate('2025-12-31');

      expect(result).toEqual({
        success: true,
        value: []
      });
    });

    it('should return error on API failure', async () => {
      const mockError = { status: 500 };
      mockApi.get.mockRejectedValue(mockError);

      const result = await getTreatmentSessionsByDate('2025-01-15');

      expect(result).toEqual({
        success: false,
        error: 'Erro interno do servidor, por favor tente novamente mais tarde'
      });
    });
  });

  describe('createTreatmentSession', () => {
    it('should create treatment session successfully', async () => {
      const sessionData = {
        treatment_record_id: 1,
        attendance_id: 1,
        patient_id: 1,
        treatment_type: 'light_bath' as const,
        body_location: 'chest',
        start_date: '2025-01-15',
        planned_sessions: 12,
        duration_minutes: 21, // 3 units of 7 minutes
        color: 'blue',
        notes: 'Standard light bath treatment series'
      };
      const mockResponse = { data: mockTreatmentSession };
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await createTreatmentSession(sessionData);

      expect(mockApi.post).toHaveBeenCalledWith('/treatment-sessions', sessionData);
      expect(result).toEqual({
        success: true,
        value: mockTreatmentSession
      });
    });

    it('should return error on validation failure', async () => {
      const sessionData = {
        treatment_record_id: 0, // Invalid treatment_record_id
        attendance_id: 0, // Invalid attendance_id
        patient_id: 0, // Invalid patient_id
        treatment_type: 'light_bath' as const,
        body_location: '', // Invalid empty body_location
        start_date: 'invalid-date', // Invalid date format
        planned_sessions: 0 // Invalid sessions count
      };
      const mockError = { status: 400 };
      mockApi.post.mockRejectedValue(mockError);

      const result = await createTreatmentSession(sessionData);

      expect(result).toEqual({
        success: false,
        error: 'Requisição inválida'
      });
    });
  });

  describe('updateTreatmentSession', () => {
    it('should update treatment session successfully', async () => {
      const updateData = {
        total_sessions_recommended: 15,
        end_date: '2025-05-15',
        notes: 'Extended treatment plan'
      };
      const updatedSession = {
        ...mockTreatmentSession,
        ...updateData,
        updated_at: '2025-01-16T10:00:00Z'
      };
      const mockResponse = { data: updatedSession };
      mockApi.put.mockResolvedValue(mockResponse);

      const result = await updateTreatmentSession('1', updateData);

      expect(mockApi.put).toHaveBeenCalledWith('/treatment-sessions/1', updateData);
      expect(result).toEqual({
        success: true,
        value: updatedSession
      });
    });
  });

  describe('completeTreatmentSession', () => {
    it('should complete treatment session successfully', async () => {
      const completionData = {
        completion_notes: 'Patient completed all sessions successfully'
      };
      const completedSession = {
        ...mockTreatmentSession,
        status: 'completed' as const,
        completion_date: '2025-04-15T10:00:00Z'
      };
      const mockResponse = { data: completedSession };
      mockApi.put.mockResolvedValue(mockResponse);

      const result = await completeTreatmentSession('1', completionData);

      expect(mockApi.put).toHaveBeenCalledWith('/treatment-sessions/1', {
        end_date: expect.any(String),
        notes: 'Patient completed all sessions successfully'
      });
      expect(result).toEqual({
        success: true,
        value: completedSession
      });
    });

    it('should use default notes when completion_notes not provided', async () => {
      const completionData = {};
      const completedSession = {
        ...mockTreatmentSession,
        status: 'completed' as const,
        notes: 'Treatment session completed'
      };
      const mockResponse = { data: completedSession };
      mockApi.put.mockResolvedValue(mockResponse);

      const result = await completeTreatmentSession('1', completionData);

      expect(mockApi.put).toHaveBeenCalledWith('/treatment-sessions/1', {
        end_date: expect.any(String),
        notes: 'Treatment session completed'
      });
      expect(result).toEqual({
        success: true,
        value: completedSession
      });
    });

    it('should return error on completion failure', async () => {
      const completionData = {
        completion_notes: 'Failed completion'
      };
      const mockError = { status: 400 };
      mockApi.put.mockRejectedValue(mockError);

      const result = await completeTreatmentSession('1', completionData);

      expect(result).toEqual({
        success: false,
        error: 'Requisição inválida'
      });
    });
  });

  describe('cancelTreatmentSession', () => {
    it('should cancel treatment session successfully', async () => {
      const cancelledSession = {
        ...mockTreatmentSession,
        status: 'cancelled' as const
      };
      const mockResponse = { data: cancelledSession };
      mockApi.put.mockResolvedValue(mockResponse);

      const result = await cancelTreatmentSession('1');

      expect(mockApi.put).toHaveBeenCalledWith('/treatment-sessions/1/cancel');
      expect(result).toEqual({
        success: true,
        value: cancelledSession
      });
    });

    it('should return error when cancellation fails', async () => {
      const mockError = { status: 409 };
      mockApi.put.mockRejectedValue(mockError);

      const result = await cancelTreatmentSession('1');

      expect(result).toEqual({
        success: false,
        error: 'Erro interno do servidor, por favor tente novamente mais tarde'
      });
    });

    it('should return error when session not found', async () => {
      const mockError = { status: 404 };
      mockApi.put.mockRejectedValue(mockError);

      const result = await cancelTreatmentSession('999');

      expect(result).toEqual({
        success: false,
        error: 'Recurso não encontrado'
      });
    });
  });

  describe('deleteTreatmentSession', () => {
    it('should delete treatment session successfully', async () => {
      mockApi.delete.mockResolvedValue({});

      const result = await deleteTreatmentSession('1');

      expect(mockApi.delete).toHaveBeenCalledWith('/treatment-sessions/1');
      expect(result).toEqual({
        success: true
      });
    });

    it('should return error when treatment session not found', async () => {
      const mockError = { status: 404 };
      mockApi.delete.mockRejectedValue(mockError);

      const result = await deleteTreatmentSession('999');

      expect(result).toEqual({
        success: false,
        error: 'Recurso não encontrado'
      });
    });
  });
});

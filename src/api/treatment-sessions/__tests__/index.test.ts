import {
  getTreatmentSessions,
  getTreatmentSessionById,
  getTreatmentSessionsByPatient,
  createTreatmentSession,
  updateTreatmentSession,
  completeTreatmentSession,
  activateTreatmentSession,
  suspendTreatmentSession,
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

      expect(mockApi.put).toHaveBeenCalledWith('/treatment-sessions/1/complete', completionData);
      expect(result).toEqual({
        success: true,
        value: completedSession
      });
    });
  });

  describe('activateTreatmentSession', () => {
    it('should activate treatment session successfully', async () => {
      const activatedSession = {
        ...mockTreatmentSession,
        status: 'active' as const
      };
      const mockResponse = { data: activatedSession };
      mockApi.put.mockResolvedValue(mockResponse);

      const result = await activateTreatmentSession('1');

      expect(mockApi.put).toHaveBeenCalledWith('/treatment-sessions/1/activate');
      expect(result).toEqual({
        success: true,
        value: activatedSession
      });
    });
  });

  describe('suspendTreatmentSession', () => {
    it('should suspend treatment session successfully', async () => {
      const suspensionData = {
        suspension_reason: 'Patient requested temporary pause'
      };
      const suspendedSession = {
        ...mockTreatmentSession,
        status: 'suspended' as const
      };
      const mockResponse = { data: suspendedSession };
      mockApi.put.mockResolvedValue(mockResponse);

      const result = await suspendTreatmentSession('1', suspensionData);

      expect(mockApi.put).toHaveBeenCalledWith('/treatment-sessions/1/suspend', suspensionData);
      expect(result).toEqual({
        success: true,
        value: suspendedSession
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

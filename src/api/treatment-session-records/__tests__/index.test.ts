import api from '@/api/lib/axios';
import { getErrorMessage } from '../../utils/functions';
import {
  getTreatmentSessionRecords,
  getTreatmentSessionRecordById,
  getTreatmentSessionRecordsBySession,
  getTreatmentSessionRecordsByPatient,
  createTreatmentSessionRecord,
  updateTreatmentSessionRecord,
  completeTreatmentSessionRecord,
  markTreatmentSessionRecordMissed,
  rescheduleTreatmentSessionRecord,
  getTreatmentSessionRecordsAnalytics,
  getMissedSessionsAnalytics,
  deleteTreatmentSessionRecord,
} from '../index';

// Mock the axios instance and utils
jest.mock('@/api/lib/axios');
jest.mock('../../utils/functions');

const mockApi = api as jest.Mocked<typeof api>;
const mockGetErrorMessage = getErrorMessage as jest.MockedFunction<typeof getErrorMessage>;

describe('treatment-session-records API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTreatmentSessionRecords', () => {
    it('should return treatment session records on success', async () => {
      const mockData = [
        { id: 1, treatment_session_id: 1, patient_id: 1 },
        { id: 2, treatment_session_id: 2, patient_id: 2 },
      ];
      mockApi.get.mockResolvedValue({ data: mockData });

      const result = await getTreatmentSessionRecords();

      expect(mockApi.get).toHaveBeenCalledWith('/treatment-session-records');
      expect(result).toEqual({ success: true, value: mockData });
    });

    it('should handle error response', async () => {
      const errorMessage = 'Internal server error';
      mockApi.get.mockRejectedValue({ status: 500 });
      mockGetErrorMessage.mockReturnValue(errorMessage);

      const result = await getTreatmentSessionRecords();

      expect(result).toEqual({ success: false, error: errorMessage });
      expect(mockGetErrorMessage).toHaveBeenCalledWith(500);
    });

    it('should handle network error', async () => {
      const errorMessage = 'Network error';
      mockApi.get.mockRejectedValue({ status: undefined });
      mockGetErrorMessage.mockReturnValue(errorMessage);

      const result = await getTreatmentSessionRecords();

      expect(result).toEqual({ success: false, error: errorMessage });
    });
  });

  describe('getTreatmentSessionRecordById', () => {
    it('should return specific treatment session record', async () => {
      const mockData = { id: 1, treatment_session_id: 1, patient_id: 1 };
      mockApi.get.mockResolvedValue({ data: mockData });

      const result = await getTreatmentSessionRecordById('1');

      expect(mockApi.get).toHaveBeenCalledWith('/treatment-session-records/1');
      expect(result).toEqual({ success: true, value: mockData });
    });

    it('should handle record not found', async () => {
      const errorMessage = 'Record not found';
      mockApi.get.mockRejectedValue({ status: 404 });
      mockGetErrorMessage.mockReturnValue(errorMessage);

      const result = await getTreatmentSessionRecordById('999');

      expect(result).toEqual({ success: false, error: errorMessage });
      expect(mockGetErrorMessage).toHaveBeenCalledWith(404);
    });
  });

  describe('getTreatmentSessionRecordsBySession', () => {
    it('should return records for specific session', async () => {
      const mockData = [
        { id: 1, treatment_session_id: 123, patient_id: 1 },
        { id: 2, treatment_session_id: 123, patient_id: 2 },
      ];
      mockApi.get.mockResolvedValue({ data: mockData });

      const result = await getTreatmentSessionRecordsBySession('123');

      expect(mockApi.get).toHaveBeenCalledWith('/treatment-session-records/session/123');
      expect(result).toEqual({ success: true, value: mockData });
    });

    it('should handle empty session records', async () => {
      mockApi.get.mockResolvedValue({ data: [] });

      const result = await getTreatmentSessionRecordsBySession('456');

      expect(result).toEqual({ success: true, value: [] });
    });
  });

  describe('getTreatmentSessionRecordsByPatient', () => {
    it('should return records for specific patient', async () => {
      const mockData = [
        { id: 1, treatment_session_id: 1, patient_id: 789 },
        { id: 2, treatment_session_id: 2, patient_id: 789 },
      ];
      mockApi.get.mockResolvedValue({ data: mockData });

      const result = await getTreatmentSessionRecordsByPatient('789');

      expect(mockApi.get).toHaveBeenCalledWith('/treatment-session-records/patient/789');
      expect(result).toEqual({ success: true, value: mockData });
    });
  });

  describe('createTreatmentSessionRecord', () => {
    it('should create new treatment session record', async () => {
      const recordData = {
        treatment_session_id: 1,
        session_number: 1,
        scheduled_date: '2025-11-26',
        scheduled_time: '10:00',
        notes: 'Initial session',
      };
      const mockResponse = { id: 1, ...recordData };
      mockApi.post.mockResolvedValue({ data: mockResponse });

      const result = await createTreatmentSessionRecord(recordData);

      expect(mockApi.post).toHaveBeenCalledWith('/treatment-session-records', recordData);
      expect(result).toEqual({ success: true, value: mockResponse });
    });

    it('should handle validation error', async () => {
      const recordData = {
        treatment_session_id: 1,
        session_number: 1,
        scheduled_date: 'invalid-date',
        scheduled_time: '10:00',
      };
      const errorMessage = 'Validation failed';
      mockApi.post.mockRejectedValue({ status: 400 });
      mockGetErrorMessage.mockReturnValue(errorMessage);

      const result = await createTreatmentSessionRecord(recordData);

      expect(result).toEqual({ success: false, error: errorMessage });
    });
  });

  describe('updateTreatmentSessionRecord', () => {
    it('should update treatment session record', async () => {
      const updateData = { scheduled_date: '2025-11-27', scheduled_time: '14:00', notes: 'Updated session' };
      const mockResponse = { id: 1, ...updateData };
      mockApi.put.mockResolvedValue({ data: mockResponse });

      const result = await updateTreatmentSessionRecord('1', updateData);

      expect(mockApi.put).toHaveBeenCalledWith('/treatment-session-records/1', updateData);
      expect(result).toEqual({ success: true, value: mockResponse });
    });

    it('should handle update failure', async () => {
      const updateData = { notes: 'Updated notes' };
      const errorMessage = 'Update failed';
      mockApi.put.mockRejectedValue({ status: 422 });
      mockGetErrorMessage.mockReturnValue(errorMessage);

      const result = await updateTreatmentSessionRecord('1', updateData);

      expect(result).toEqual({ success: false, error: errorMessage });
    });
  });

  describe('completeTreatmentSessionRecord', () => {
    it('should complete treatment session record', async () => {
      const completionData = {
        notes: 'Session completed successfully',
        attendanceId: 123,
      };
      const mockResponse = { id: 1, status: 'completed', ...completionData };
      mockApi.post.mockResolvedValue({ data: mockResponse });

      const result = await completeTreatmentSessionRecord('1', completionData);

      expect(mockApi.post).toHaveBeenCalledWith('/treatment-session-records/1/complete', completionData);
      expect(result).toEqual({ success: true, value: mockResponse });
    });

    it('should handle completion error', async () => {
      const completionData = { notes: 'Test completion' };
      const errorMessage = 'Already completed';
      mockApi.post.mockRejectedValue({ status: 409 });
      mockGetErrorMessage.mockReturnValue(errorMessage);

      const result = await completeTreatmentSessionRecord('1', completionData);

      expect(result).toEqual({ success: false, error: errorMessage });
    });
  });

  describe('markTreatmentSessionRecordMissed', () => {
    it('should mark treatment session record as missed', async () => {
      const missedData = {
        missed_reason: 'Patient no-show',
      };
      const mockResponse = { id: 1, status: 'missed', ...missedData };
      mockApi.post.mockResolvedValue({ data: mockResponse });

      const result = await markTreatmentSessionRecordMissed('1', missedData);

      expect(mockApi.post).toHaveBeenCalledWith('/treatment-session-records/1/mark-missed', missedData);
      expect(result).toEqual({ success: true, value: mockResponse });
    });
  });

  describe('rescheduleTreatmentSessionRecord', () => {
    it('should reschedule treatment session record', async () => {
      const rescheduleData = {
        new_date: '2025-11-27',
        new_time: '15:00',
        reschedule_reason: 'Patient request',
      };
      const mockResponse = { id: 1, scheduled_date: '2025-11-27', ...rescheduleData };
      mockApi.post.mockResolvedValue({ data: mockResponse });

      const result = await rescheduleTreatmentSessionRecord('1', rescheduleData);

      expect(mockApi.post).toHaveBeenCalledWith('/treatment-session-records/1/reschedule', rescheduleData);
      expect(result).toEqual({ success: true, value: mockResponse });
    });
  });

  describe('getTreatmentSessionRecordsAnalytics', () => {
    it('should get analytics without parameters', async () => {
      const mockData = {
        total_sessions: 100,
        completed_sessions: 85,
        completion_rate: 0.85,
      };
      mockApi.get.mockResolvedValue({ data: mockData });

      const result = await getTreatmentSessionRecordsAnalytics();

      expect(mockApi.get).toHaveBeenCalledWith('/treatment-session-records/analytics/completion-rate?');
      expect(result).toEqual({ success: true, value: mockData });
    });

    it('should get analytics with all parameters', async () => {
      const params = {
        patient_id: '123',
        start_date: '2025-11-01',
        end_date: '2025-11-30',
      };
      const mockData = {
        total_sessions: 10,
        completed_sessions: 8,
        completion_rate: 0.8,
      };
      mockApi.get.mockResolvedValue({ data: mockData });

      const result = await getTreatmentSessionRecordsAnalytics(params);

      expect(mockApi.get).toHaveBeenCalledWith(
        '/treatment-session-records/analytics/completion-rate?patient_id=123&start_date=2025-11-01&end_date=2025-11-30'
      );
      expect(result).toEqual({ success: true, value: mockData });
    });

    it('should get analytics with partial parameters', async () => {
      const params = { patient_id: '456' };
      mockApi.get.mockResolvedValue({ data: {} });

      await getTreatmentSessionRecordsAnalytics(params);

      expect(mockApi.get).toHaveBeenCalledWith(
        '/treatment-session-records/analytics/completion-rate?patient_id=456'
      );
    });

    it('should handle analytics error', async () => {
      const errorMessage = 'Analytics unavailable';
      mockApi.get.mockRejectedValue({ status: 503 });
      mockGetErrorMessage.mockReturnValue(errorMessage);

      const result = await getTreatmentSessionRecordsAnalytics();

      expect(result).toEqual({ success: false, error: errorMessage });
    });
  });

  describe('getMissedSessionsAnalytics', () => {
    it('should get missed sessions analytics', async () => {
      const mockData = {
        total_missed: 15,
        missed_rate: 0.15,
        top_reasons: ['Patient no-show', 'Illness'],
      };
      mockApi.get.mockResolvedValue({ data: mockData });

      const result = await getMissedSessionsAnalytics();

      expect(mockApi.get).toHaveBeenCalledWith('/treatment-session-records/analytics/missed-sessions?');
      expect(result).toEqual({ success: true, value: mockData });
    });

    it('should handle missed analytics with parameters', async () => {
      const params = { start_date: '2025-11-01', end_date: '2025-11-30' };
      mockApi.get.mockResolvedValue({ data: {} });

      await getMissedSessionsAnalytics(params);

      expect(mockApi.get).toHaveBeenCalledWith(
        '/treatment-session-records/analytics/missed-sessions?start_date=2025-11-01&end_date=2025-11-30'
      );
    });
  });

  describe('deleteTreatmentSessionRecord', () => {
    it('should delete treatment session record', async () => {
      mockApi.delete.mockResolvedValue({});

      const result = await deleteTreatmentSessionRecord('1');

      expect(mockApi.delete).toHaveBeenCalledWith('/treatment-session-records/1');
      expect(result).toEqual({ success: true });
    });

    it('should handle delete error', async () => {
      const errorMessage = 'Cannot delete';
      mockApi.delete.mockRejectedValue({ status: 403 });
      mockGetErrorMessage.mockReturnValue(errorMessage);

      const result = await deleteTreatmentSessionRecord('1');

      expect(result).toEqual({ success: false, error: errorMessage });
    });

    it('should handle record not found on delete', async () => {
      const errorMessage = 'Record not found';
      mockApi.delete.mockRejectedValue({ status: 404 });
      mockGetErrorMessage.mockReturnValue(errorMessage);

      const result = await deleteTreatmentSessionRecord('999');

      expect(result).toEqual({ success: false, error: errorMessage });
    });
  });

  describe('edge cases and error scenarios', () => {
    it('should handle empty string parameters', async () => {
      await getTreatmentSessionRecordById('');

      expect(mockApi.get).toHaveBeenCalledWith('/treatment-session-records/');
    });

    it('should handle special characters in IDs', async () => {
      const specialId = 'test-id-123';
      mockApi.get.mockResolvedValue({ data: {} });

      await getTreatmentSessionRecordById(specialId);

      expect(mockApi.get).toHaveBeenCalledWith(`/treatment-session-records/${specialId}`);
    });

    it('should handle analytics with empty date parameters', async () => {
      const params = { patient_id: '123', start_date: '', end_date: '' };
      mockApi.get.mockResolvedValue({ data: {} });

      await getTreatmentSessionRecordsAnalytics(params);

      // Empty strings are falsy and won't be appended to URL
      expect(mockApi.get).toHaveBeenCalledWith(
        '/treatment-session-records/analytics/completion-rate?patient_id=123'
      );
    });

    it('should handle concurrent requests', async () => {
      const mockData1 = [{ id: 1 }];
      const mockData2 = [{ id: 2 }];
      
      mockApi.get
        .mockResolvedValueOnce({ data: mockData1 })
        .mockResolvedValueOnce({ data: mockData2 });

      const [result1, result2] = await Promise.all([
        getTreatmentSessionRecords(),
        getTreatmentSessionRecordsByPatient('123'),
      ]);

      expect(result1).toEqual({ success: true, value: mockData1 });
      expect(result2).toEqual({ success: true, value: mockData2 });
    });
  });
});
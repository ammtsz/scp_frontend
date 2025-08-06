import {
  getTreatmentRecords,
  getTreatmentRecordById,
  createTreatmentRecord,
  updateTreatmentRecord,
  deleteTreatmentRecord,
  getTreatmentRecordByAttendance
} from '../index';

// Mock the api instance
jest.mock('@/api/lib/axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
}));

import api from '@/api/lib/axios';
const mockApi = api as jest.Mocked<typeof api>;

describe('Treatment Records API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockTreatmentRecord = {
    id: 1,
    attendance_id: 1,
    food: 'Fruits and vegetables',
    water: 'Mineral water',
    ointments: 'Healing ointment',
    light_bath: true,
    rod: false,
    spiritual_treatment: true,
    return_in_weeks: 2,
    notes: 'Patient is improving',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  };

  describe('getTreatmentRecords', () => {
    it('should return treatment records on success', async () => {
      const mockResponse = { data: [mockTreatmentRecord] };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await getTreatmentRecords();

      expect(mockApi.get).toHaveBeenCalledWith('/treatment-records');
      expect(result).toEqual({
        success: true,
        value: [mockTreatmentRecord]
      });
    });

    it('should return error on failure', async () => {
      const mockError = { status: 500 };
      mockApi.get.mockRejectedValue(mockError);

      const result = await getTreatmentRecords();

      expect(result).toEqual({
        success: false,
        error: 'Erro interno do servidor, por favor tente novamente mais tarde'
      });
    });
  });

  describe('getTreatmentRecordById', () => {
    it('should return treatment record on success', async () => {
      const mockResponse = { data: mockTreatmentRecord };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await getTreatmentRecordById('1');

      expect(mockApi.get).toHaveBeenCalledWith('/treatment-records/1');
      expect(result).toEqual({
        success: true,
        value: mockTreatmentRecord
      });
    });

    it('should return error when not found', async () => {
      const mockError = { status: 404 };
      mockApi.get.mockRejectedValue(mockError);

      const result = await getTreatmentRecordById('999');

      expect(result).toEqual({
        success: false,
        error: 'Erro interno do servidor, por favor tente novamente mais tarde'
      });
    });
  });

  describe('getTreatmentRecordByAttendance', () => {
    it('should return treatment record by attendance ID on success', async () => {
      const mockResponse = { data: mockTreatmentRecord };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await getTreatmentRecordByAttendance('1');

      expect(mockApi.get).toHaveBeenCalledWith('/treatment-records/attendance/1');
      expect(result).toEqual({
        success: true,
        value: mockTreatmentRecord
      });
    });

    it('should return error when not found', async () => {
      const mockError = { status: 404 };
      mockApi.get.mockRejectedValue(mockError);

      const result = await getTreatmentRecordByAttendance('999');

      expect(result).toEqual({
        success: false,
        error: 'Erro interno do servidor, por favor tente novamente mais tarde'
      });
    });
  });

  describe('createTreatmentRecord', () => {
    it('should create treatment record on success', async () => {
      const treatmentData = {
        attendance_id: 1,
        food: 'Fruits and vegetables',
        water: 'Mineral water',
        ointments: 'Healing ointment',
        light_bath: true,
        rod: false,
        spiritual_treatment: true,
        return_in_weeks: 2,
        notes: 'Patient is improving'
      };
      const mockResponse = { data: mockTreatmentRecord };
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await createTreatmentRecord(treatmentData);

      expect(mockApi.post).toHaveBeenCalledWith('/treatment-records', treatmentData);
      expect(result).toEqual({
        success: true,
        value: mockTreatmentRecord
      });
    });

    it('should return error on validation failure', async () => {
      const treatmentData = {
        attendance_id: 0, // Invalid attendance_id
        food: 'Fruits and vegetables',
        water: 'Mineral water',
        ointments: 'Healing ointment',
        light_bath: true,
        rod: false,
        spiritual_treatment: true,
        return_in_weeks: 60, // Invalid return_in_weeks (> 52)
        notes: 'Patient is improving'
      };
      const mockError = { status: 400 };
      mockApi.post.mockRejectedValue(mockError);

      const result = await createTreatmentRecord(treatmentData);

      expect(result).toEqual({
        success: false,
        error: 'Erro interno do servidor, por favor tente novamente mais tarde'
      });
    });
  });

  describe('updateTreatmentRecord', () => {
    it('should update treatment record on success', async () => {
      const updateData = { notes: 'Patient is fully recovered' };
      const mockResponse = { data: { ...mockTreatmentRecord, notes: 'Patient is fully recovered' } };
      mockApi.patch.mockResolvedValue(mockResponse);

      const result = await updateTreatmentRecord('1', updateData);

      expect(mockApi.patch).toHaveBeenCalledWith('/treatment-records/1', updateData);
      expect(result).toEqual({
        success: true,
        value: { ...mockTreatmentRecord, notes: 'Patient is fully recovered' }
      });
    });

    it('should return error when not found', async () => {
      const updateData = { notes: 'Updated notes' };
      const mockError = { status: 404 };
      mockApi.patch.mockRejectedValue(mockError);

      const result = await updateTreatmentRecord('999', updateData);

      expect(result).toEqual({
        success: false,
        error: 'Erro interno do servidor, por favor tente novamente mais tarde'
      });
    });

    it('should handle partial updates', async () => {
      const updateData = { light_bath: false, return_in_weeks: 4 };
      const mockResponse = { 
        data: { 
          ...mockTreatmentRecord, 
          light_bath: false, 
          return_in_weeks: 4 
        } 
      };
      mockApi.patch.mockResolvedValue(mockResponse);

      const result = await updateTreatmentRecord('1', updateData);

      expect(mockApi.patch).toHaveBeenCalledWith('/treatment-records/1', updateData);
      expect(result).toEqual({
        success: true,
        value: {
          ...mockTreatmentRecord,
          light_bath: false,
          return_in_weeks: 4
        }
      });
    });
  });

  describe('deleteTreatmentRecord', () => {
    it('should delete treatment record on success', async () => {
      mockApi.delete.mockResolvedValue({});

      const result = await deleteTreatmentRecord('1');

      expect(mockApi.delete).toHaveBeenCalledWith('/treatment-records/1');
      expect(result).toEqual({
        success: true
      });
    });

    it('should return error when not found', async () => {
      const mockError = { status: 404 };
      mockApi.delete.mockRejectedValue(mockError);

      const result = await deleteTreatmentRecord('999');

      expect(result).toEqual({
        success: false,
        error: 'Erro interno do servidor, por favor tente novamente mais tarde'
      });
    });

    it('should return error on server error', async () => {
      const mockError = { status: 500 };
      mockApi.delete.mockRejectedValue(mockError);

      const result = await deleteTreatmentRecord('1');

      expect(result).toEqual({
        success: false,
        error: 'Erro interno do servidor, por favor tente novamente mais tarde'
      });
    });
  });
});

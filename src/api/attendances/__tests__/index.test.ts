import {
  getAttendances,
  getAttendanceById,
  getAttendancesByDate,
  createAttendance,
  updateAttendance,
  deleteAttendance,
  checkInAttendance,
  startAttendance,
  completeAttendance,
  cancelAttendance,
} from '../index';
import { AttendanceStatus, AttendanceType } from '../../types';

// Mock the api instance
jest.mock('@/api/lib/axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
  patch: jest.fn(),
  delete: jest.fn(),
}));

import api from '@/api/lib/axios';
const mockApi = api as jest.Mocked<typeof api>;

// Mock Date to return consistent time for time-sensitive tests
jest.useFakeTimers().setSystemTime(new Date('2024-01-01 12:00:00'));

describe('Attendances API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockAttendance = {
    id: 1,
    patient_id: 1,
    type: AttendanceType.SPIRITUAL,
    status: AttendanceStatus.SCHEDULED,
    scheduled_date: '2024-01-01',
    scheduled_time: '10:00',
    checked_in_time: undefined,
    started_time: undefined,
    completed_time: undefined,
    cancelled_date: undefined,
    notes: 'Regular consultation',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z'
  };

  describe('getAttendances', () => {
    it('should return attendances on success', async () => {
      const mockResponse = { data: [mockAttendance] };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await getAttendances();

      expect(mockApi.get).toHaveBeenCalledWith('/attendances');
      expect(result).toEqual({
        success: true,
        value: [mockAttendance]
      });
    });

    it('should return error on failure', async () => {
      const mockError = { status: 500 };
      mockApi.get.mockRejectedValue(mockError);

      const result = await getAttendances();

      expect(result).toEqual({
        success: false,
        error: 'Erro interno do servidor, por favor tente novamente mais tarde'
      });
    });
  });

  describe('getAttendanceById', () => {
    it('should return attendance on success', async () => {
      const mockResponse = { data: mockAttendance };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await getAttendanceById('1');

      expect(mockApi.get).toHaveBeenCalledWith('/attendances/1');
      expect(result).toEqual({
        success: true,
        value: mockAttendance
      });
    });

    it('should return error when not found', async () => {
      const mockError = { status: 404 };
      mockApi.get.mockRejectedValue(mockError);

      const result = await getAttendanceById('999');

      expect(result).toEqual({
        success: false,
        error: 'Recurso não encontrado'
      });
    });
  });

  describe('getAttendancesByDate', () => {
    it('should return attendances for specific date on success', async () => {
      const mockResponse = { data: [mockAttendance] };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await getAttendancesByDate('2024-01-01');

      expect(mockApi.get).toHaveBeenCalledWith('/attendances/date/2024-01-01');
      expect(result).toEqual({
        success: true,
        value: [mockAttendance]
      });
    });

    it('should return empty array when no attendances found for date', async () => {
      const mockResponse = { data: [] };
      mockApi.get.mockResolvedValue(mockResponse);

      const result = await getAttendancesByDate('2024-12-31');

      expect(mockApi.get).toHaveBeenCalledWith('/attendances/date/2024-12-31');
      expect(result).toEqual({
        success: true,
        value: []
      });
    });

    it('should return error on invalid date format', async () => {
      const mockError = { status: 400 };
      mockApi.get.mockRejectedValue(mockError);

      const result = await getAttendancesByDate('invalid-date');

      expect(result).toEqual({
        success: false,
        error: 'Requisição inválida'
      });
    });
  });

  describe('createAttendance', () => {
    it('should create attendance on success', async () => {
      const attendanceData = {
        patient_id: 1,
        type: AttendanceType.SPIRITUAL,
        scheduled_date: '2024-01-01',
        scheduled_time: '10:00',
        notes: 'Regular consultation'
      };
      const mockResponse = { data: mockAttendance };
      mockApi.post.mockResolvedValue(mockResponse);

      const result = await createAttendance(attendanceData);

      expect(mockApi.post).toHaveBeenCalledWith('/attendances', attendanceData);
      expect(result).toEqual({
        success: true,
        value: mockAttendance
      });
    });

    it('should return error on validation failure', async () => {
      const attendanceData = {
        patient_id: 0,
        type: AttendanceType.SPIRITUAL,
        scheduled_date: 'invalid-date',
        scheduled_time: '10:00',
        notes: 'Regular consultation'
      };
      const mockError = { status: 400 };
      mockApi.post.mockRejectedValue(mockError);

      const result = await createAttendance(attendanceData);

      expect(result).toEqual({
        success: false,
        error: 'Requisição inválida'
      });
    });
  });

  describe('updateAttendance', () => {
    it('should update attendance on success', async () => {
      const updateData = { notes: 'Updated notes' };
      const mockResponse = { data: { ...mockAttendance, notes: 'Updated notes' } };
      mockApi.patch.mockResolvedValue(mockResponse);

      const result = await updateAttendance('1', updateData);

      expect(mockApi.patch).toHaveBeenCalledWith('/attendances/1', updateData);
      expect(result).toEqual({
        success: true,
        value: { ...mockAttendance, notes: 'Updated notes' }
      });
    });

    it('should return error when not found', async () => {
      const updateData = { notes: 'Updated notes' };
      const mockError = { status: 404 };
      mockApi.patch.mockRejectedValue(mockError);

      const result = await updateAttendance('999', updateData);

      expect(result).toEqual({
        success: false,
        error: 'Recurso não encontrado'
      });
    });
  });

  describe('deleteAttendance', () => {
    it('should delete attendance on success', async () => {
      mockApi.delete.mockResolvedValue({});

      const result = await deleteAttendance('1');

      expect(mockApi.delete).toHaveBeenCalledWith('/attendances/1');
      expect(result).toEqual({
        success: true
      });
    });

    it('should return error when not found', async () => {
      const mockError = { status: 404 };
      mockApi.delete.mockRejectedValue(mockError);

      const result = await deleteAttendance('999');

      expect(result).toEqual({
        success: false,
        error: 'Recurso não encontrado'
      });
    });
  });

  describe('convenience methods', () => {
    beforeEach(() => {
      // Mock Date.now to return a consistent timestamp
      jest.spyOn(Date.prototype, 'toISOString').mockReturnValue('2024-01-01T12:00:00.000Z');
    });

    afterEach(() => {
      jest.restoreAllMocks();
    });

    describe('checkInAttendance', () => {
      it('should check in attendance', async () => {
        const expectedUpdateData = {
          status: AttendanceStatus.CHECKED_IN,
          checked_in_time: '12:00:00'
        };
        const mockResponse = { 
          data: { 
            ...mockAttendance, 
            status: AttendanceStatus.CHECKED_IN,
            checked_in_time: '12:00:00'
          } 
        };
        mockApi.patch.mockResolvedValue(mockResponse);

        const result = await checkInAttendance('1');

        expect(mockApi.patch).toHaveBeenCalledWith('/attendances/1', expectedUpdateData);
        expect(result).toEqual({
          success: true,
          value: {
            ...mockAttendance,
            status: AttendanceStatus.CHECKED_IN,
            checked_in_time: '12:00:00'
          }
        });
      });
    });

    describe('startAttendance', () => {
      it('should start attendance', async () => {
        const expectedUpdateData = {
          status: AttendanceStatus.IN_PROGRESS,
          started_time: '12:00:00'
        };
        const mockResponse = { 
          data: { 
            ...mockAttendance, 
            status: AttendanceStatus.IN_PROGRESS,
            started_time: '12:00:00'
          } 
        };
        mockApi.patch.mockResolvedValue(mockResponse);

        const result = await startAttendance('1');

        expect(mockApi.patch).toHaveBeenCalledWith('/attendances/1', expectedUpdateData);
        expect(result).toEqual({
          success: true,
          value: {
            ...mockAttendance,
            status: AttendanceStatus.IN_PROGRESS,
            started_time: '12:00:00'
          }
        });
      });
    });

    describe('completeAttendance', () => {
      it('should complete attendance', async () => {
        const expectedUpdateData = {
          status: AttendanceStatus.COMPLETED,
          completed_time: '12:00:00'
        };
        const mockResponse = { 
          data: { 
            ...mockAttendance, 
            status: AttendanceStatus.COMPLETED,
            completed_time: '12:00:00'
          } 
        };
        mockApi.patch.mockResolvedValue(mockResponse);

        const result = await completeAttendance('1');

        expect(mockApi.patch).toHaveBeenCalledWith('/attendances/1', expectedUpdateData);
        expect(result).toEqual({
          success: true,
          value: {
            ...mockAttendance,
            status: AttendanceStatus.COMPLETED,
            completed_time: '12:00:00'
          }
        });
      });
    });

    describe('cancelAttendance', () => {
      it('should cancel attendance', async () => {
        const expectedUpdateData = {
          status: AttendanceStatus.CANCELLED,
          cancelled_date: '2024-01-01'
        };
        const mockResponse = { 
          data: { 
            ...mockAttendance, 
            status: AttendanceStatus.CANCELLED,
            cancelled_date: '2024-01-01'
          } 
        };
        mockApi.patch.mockResolvedValue(mockResponse);

        const result = await cancelAttendance('1');

        expect(mockApi.patch).toHaveBeenCalledWith('/attendances/1', expectedUpdateData);
        expect(result).toEqual({
          success: true,
          value: {
            ...mockAttendance,
            status: AttendanceStatus.CANCELLED,
            cancelled_date: '2024-01-01'
          }
        });
      });
    });
  });
});

import { updateAttendanceStatus } from '../attendanceSync';
import { AttendanceStatus } from '../types';
import * as attendanceAPI from '../attendances';

// Mock the attendance API functions
jest.mock('../attendances', () => ({
  updateAttendance: jest.fn(),
  checkInAttendance: jest.fn(),
  startAttendance: jest.fn(),
  completeAttendance: jest.fn(),
}));

const mockUpdateAttendance = attendanceAPI.updateAttendance as jest.MockedFunction<typeof attendanceAPI.updateAttendance>;
const mockCheckInAttendance = attendanceAPI.checkInAttendance as jest.MockedFunction<typeof attendanceAPI.checkInAttendance>;
const mockStartAttendance = attendanceAPI.startAttendance as jest.MockedFunction<typeof attendanceAPI.startAttendance>;
const mockCompleteAttendance = attendanceAPI.completeAttendance as jest.MockedFunction<typeof attendanceAPI.completeAttendance>;

describe('attendanceSync', () => {
  const mockAttendanceId = 123;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('updateAttendanceStatus', () => {
    describe('checkedIn status', () => {
      it('should call checkInAttendance and return success', async () => {
        mockCheckInAttendance.mockResolvedValue({ success: true });

        const result = await updateAttendanceStatus(mockAttendanceId, 'checkedIn');

        expect(mockCheckInAttendance).toHaveBeenCalledWith('123');
        expect(result).toEqual({ success: true });
      });

      it('should handle checkInAttendance failure', async () => {
        const errorMessage = 'Check-in failed';
        mockCheckInAttendance.mockResolvedValue({ success: false, error: errorMessage });

        const result = await updateAttendanceStatus(mockAttendanceId, 'checkedIn');

        expect(result).toEqual({ success: false, error: errorMessage });
      });

      it('should handle checkInAttendance exception', async () => {
        mockCheckInAttendance.mockRejectedValue(new Error('Network error'));

        const result = await updateAttendanceStatus(mockAttendanceId, 'checkedIn');

        expect(result).toEqual({ success: false, error: 'Failed to update attendance status' });
      });
    });

    describe('onGoing status', () => {
      it('should call startAttendance and return success', async () => {
        mockStartAttendance.mockResolvedValue({ success: true });

        const result = await updateAttendanceStatus(mockAttendanceId, 'onGoing');

        expect(mockStartAttendance).toHaveBeenCalledWith('123');
        expect(result).toEqual({ success: true });
      });

      it('should handle startAttendance failure', async () => {
        const errorMessage = 'Start failed';
        mockStartAttendance.mockResolvedValue({ success: false, error: errorMessage });

        const result = await updateAttendanceStatus(mockAttendanceId, 'onGoing');

        expect(result).toEqual({ success: false, error: errorMessage });
      });
    });

    describe('completed status', () => {
      it('should call completeAttendance and return success', async () => {
        mockCompleteAttendance.mockResolvedValue({ success: true });

        const result = await updateAttendanceStatus(mockAttendanceId, 'completed');

        expect(mockCompleteAttendance).toHaveBeenCalledWith('123');
        expect(result).toEqual({ success: true });
      });

      it('should handle completeAttendance failure', async () => {
        const errorMessage = 'Completion failed';
        mockCompleteAttendance.mockResolvedValue({ success: false, error: errorMessage });

        const result = await updateAttendanceStatus(mockAttendanceId, 'completed');

        expect(result).toEqual({ success: false, error: errorMessage });
      });
    });

    describe('scheduled status', () => {
      it('should call updateAttendance with scheduled status and cleared timestamps', async () => {
        mockUpdateAttendance.mockResolvedValue({ success: true });

        const result = await updateAttendanceStatus(mockAttendanceId, 'scheduled');

        expect(mockUpdateAttendance).toHaveBeenCalledWith('123', {
          status: AttendanceStatus.SCHEDULED,
          checked_in_date: undefined,
          checked_in_time: undefined,
          started_date: undefined,
          started_time: undefined,
          completed_date: undefined,
          completed_time: undefined
        });
        expect(result).toEqual({ success: true });
      });

      it('should handle scheduled update failure', async () => {
        const errorMessage = 'Update failed';
        mockUpdateAttendance.mockResolvedValue({ success: false, error: errorMessage });

        const result = await updateAttendanceStatus(mockAttendanceId, 'scheduled');

        expect(result).toEqual({ success: false, error: errorMessage });
      });
    });

    describe('cancelled status', () => {
      it('should call updateAttendance with cancelled status and cleared timestamps', async () => {
        mockUpdateAttendance.mockResolvedValue({ success: true });

        const result = await updateAttendanceStatus(mockAttendanceId, 'cancelled');

        expect(mockUpdateAttendance).toHaveBeenCalledWith('123', {
          status: AttendanceStatus.CANCELLED,
          checked_in_date: undefined,
          checked_in_time: undefined,
          started_date: undefined,
          started_time: undefined,
          completed_date: undefined,
          completed_time: undefined
        });
        expect(result).toEqual({ success: true });
      });
    });

    describe('missed status', () => {
      it('should call updateAttendance with missed status and cleared timestamps', async () => {
        mockUpdateAttendance.mockResolvedValue({ success: true });

        const result = await updateAttendanceStatus(mockAttendanceId, 'missed');

        expect(mockUpdateAttendance).toHaveBeenCalledWith('123', {
          status: AttendanceStatus.MISSED,
          checked_in_date: undefined,
          checked_in_time: undefined,
          started_date: undefined,
          started_time: undefined,
          completed_date: undefined,
          completed_time: undefined
        });
        expect(result).toEqual({ success: true });
      });
    });

    describe('invalid status', () => {
      it('should return error for invalid status', async () => {
        const result = await updateAttendanceStatus(mockAttendanceId, 'invalid' as any);

        expect(result).toEqual({ success: false, error: 'Invalid status' });
        expect(mockUpdateAttendance).not.toHaveBeenCalled();
        expect(mockCheckInAttendance).not.toHaveBeenCalled();
        expect(mockStartAttendance).not.toHaveBeenCalled();
        expect(mockCompleteAttendance).not.toHaveBeenCalled();
      });
    });

    describe('exception handling', () => {
      it('should handle updateAttendance exception for scheduled status', async () => {
        mockUpdateAttendance.mockRejectedValue(new Error('Network error'));

        const result = await updateAttendanceStatus(mockAttendanceId, 'scheduled');

        expect(result).toEqual({ success: false, error: 'Failed to update attendance status' });
      });

      it('should handle startAttendance exception', async () => {
        mockStartAttendance.mockRejectedValue(new Error('Server error'));

        const result = await updateAttendanceStatus(mockAttendanceId, 'onGoing');

        expect(result).toEqual({ success: false, error: 'Failed to update attendance status' });
      });

      it('should handle completeAttendance exception', async () => {
        mockCompleteAttendance.mockRejectedValue(new Error('Database error'));

        const result = await updateAttendanceStatus(mockAttendanceId, 'completed');

        expect(result).toEqual({ success: false, error: 'Failed to update attendance status' });
      });
    });

    describe('edge cases', () => {
      it('should handle zero attendance ID', async () => {
        mockCheckInAttendance.mockResolvedValue({ success: true });

        const result = await updateAttendanceStatus(0, 'checkedIn');

        expect(mockCheckInAttendance).toHaveBeenCalledWith('0');
        expect(result).toEqual({ success: true });
      });

      it('should handle negative attendance ID', async () => {
        mockStartAttendance.mockResolvedValue({ success: true });

        const result = await updateAttendanceStatus(-1, 'onGoing');

        expect(mockStartAttendance).toHaveBeenCalledWith('-1');
        expect(result).toEqual({ success: true });
      });

      it('should handle large attendance ID', async () => {
        const largeId = 999999999;
        mockCompleteAttendance.mockResolvedValue({ success: true });

        const result = await updateAttendanceStatus(largeId, 'completed');

        expect(mockCompleteAttendance).toHaveBeenCalledWith(largeId.toString());
        expect(result).toEqual({ success: true });
      });
    });
  });
});
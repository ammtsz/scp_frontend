import { AttendanceStatus } from '@/api/types';
import { 
  updateAttendance,
  checkInAttendance,
  startAttendance,
  completeAttendance
} from '@/api/attendances';
import { IAttendanceProgression } from '@/types/globals';

/**
 * Maps frontend attendance status to backend status
 */
export const mapFrontendStatusToBackend = (frontendStatus: IAttendanceProgression): AttendanceStatus => {
  switch (frontendStatus) {
    case 'scheduled':
      return AttendanceStatus.SCHEDULED;
    case 'checkedIn':
      return AttendanceStatus.CHECKED_IN;
    case 'onGoing':
      return AttendanceStatus.IN_PROGRESS;
    case 'completed':
      return AttendanceStatus.COMPLETED;
    default:
      return AttendanceStatus.SCHEDULED;
  }
};

/**
 * Updates attendance status in the backend with appropriate timestamp
 */
export const updateAttendanceStatus = async (
  attendanceId: number,
  newStatus: IAttendanceProgression
): Promise<{ success: boolean; error?: string }> => {
  try {
    let result;
    
    switch (newStatus) {
      case 'checkedIn':
        result = await checkInAttendance(attendanceId.toString());
        break;
      case 'onGoing':
        result = await startAttendance(attendanceId.toString());
        break;
      case 'completed':
        result = await completeAttendance(attendanceId.toString());
        break;
      case 'scheduled':
        result = await updateAttendance(attendanceId.toString(), {
          status: AttendanceStatus.SCHEDULED,
          checked_in_at: undefined,
          started_at: undefined,
          completed_at: undefined
        });
        break;
      default:
        return { success: false, error: 'Invalid status' };
    }

    return result.success ? { success: true } : { success: false, error: result.error };
  } catch {
    return { success: false, error: 'Failed to update attendance status' };
  }
};

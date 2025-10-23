import { AttendanceStatus } from '@/api/types';
import { 
  updateAttendance,
  checkInAttendance,
  startAttendance,
  completeAttendance
} from '@/api/attendances';
import { AttendanceProgression } from '@/types/types';

/**
 * Updates attendance status in the backend with appropriate timestamp
 */
export const updateAttendanceStatus = async (
  attendanceId: number,
  newStatus: AttendanceProgression
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
          checked_in_date: undefined,
          checked_in_time: undefined,
          started_date: undefined,
          started_time: undefined,
          completed_date: undefined,
          completed_time: undefined
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

/**
 * Attendance Service - Centralized business logic for attendance operations
 * 
 * This service consolidates all attendance-related operations that were previously
 * scattered across multiple hooks and components.
 */

import { 
  createAttendance,
  checkInAttendance,
  deleteAttendance,
  completeAttendance,
  markAttendanceAsMissed,
  bulkUpdateAttendanceStatus,
  updateAttendance
} from "@/api/attendances";
import { 
  AttendanceStatusDetail, 
  AttendanceType
} from "@/types/types";
import { AttendanceStatus } from "@/api/types";
import { 
  transformAttendanceTypeToApi
} from "@/utils/apiTransformers";
import { getNextAvailableDate } from "@/utils/dateHelpers";
import { SCHEDULED_TIME } from "@/utils/constants";

export interface CreateAttendanceParams {
  patientId: number;
  attendanceType: AttendanceType;
  scheduledDate?: string;
  notes?: string;
}

export interface CheckInParams {
  attendanceId: number;
  patientName: string;
}

export interface UpdateStatusParams {
  attendanceId: number;
  newStatus: AttendanceStatus;
}

export interface BulkUpdateParams {
  attendanceIds: number[];
  newStatus: AttendanceStatus;
}

/**
 * Attendance Service Class
 */
export class AttendanceService {
  /**
   * Create a new attendance for a patient
   */
  static async createAttendance({
    patientId,
    attendanceType,
    scheduledDate,
    notes
  }: CreateAttendanceParams) {
    try {
      const finalScheduledDate = scheduledDate || await getNextAvailableDate();
      
      const result = await createAttendance({
        patient_id: patientId,
        type: transformAttendanceTypeToApi(attendanceType),
        scheduled_date: finalScheduledDate,
        scheduled_time: SCHEDULED_TIME,
        notes,
      });

      return {
        success: result.success,
        data: result.value,
        error: result.error
      };
    } catch (error) {
      console.error("Error creating attendance:", error);
      return {
        success: false,
        data: null,
        error: "Failed to create attendance"
      };
    }
  }

  /**
   * Check in a patient for their attendance
   */
  static async checkInAttendance({ attendanceId, patientName }: CheckInParams) {
    try {
      const result = await checkInAttendance(attendanceId.toString());
      
      return {
        success: result.success,
        data: result.value,
        error: result.error
      };
    } catch (error) {
      console.error(`Error checking in ${patientName}:`, error);
      return {
        success: false,
        data: null,
        error: `Failed to check in ${patientName}`
      };
    }
  }

  /**
   * Update attendance status
   */
  static async updateStatus({ attendanceId, newStatus }: UpdateStatusParams) {
    try {
      const result = await updateAttendance(attendanceId.toString(), {
        status: newStatus
      });
      
      return {
        success: result.success,
        data: result.value,
        error: result.error
      };
    } catch (error) {
      console.error("Error updating attendance status:", error);
      return {
        success: false,
        data: null,
        error: "Failed to update attendance status"
      };
    }
  }

  /**
   * Complete an attendance
   */
  static async completeAttendance(attendanceId: number) {
    try {
      const result = await completeAttendance(attendanceId.toString());
      
      return {
        success: result.success,
        data: result.value,
        error: result.error
      };
    } catch (error) {
      console.error("Error completing attendance:", error);
      return {
        success: false,
        data: null,
        error: "Failed to complete attendance"
      };
    }
  }

  /**
   * Mark attendance as missed
   */
  static async markAsMissed(attendanceId: number, justified: boolean = false) {
    try {
      const result = await markAttendanceAsMissed(
        attendanceId.toString(),
        justified
      );
      
      return {
        success: result.success,
        data: result.value,
        error: result.error
      };
    } catch (error) {
      console.error("Error marking attendance as missed:", error);
      return {
        success: false,
        data: null,
        error: "Failed to mark attendance as missed"
      };
    }
  }

  /**
   * Delete an attendance
   */
  static async deleteAttendance(attendanceId: number) {
    try {
      const result = await deleteAttendance(attendanceId.toString());
      
      return {
        success: result.success,
        data: result.value,
        error: result.error
      };
    } catch (error) {
      console.error("Error deleting attendance:", error);
      return {
        success: false,
        data: null,
        error: "Failed to delete attendance"
      };
    }
  }

  /**
   * Bulk update multiple attendances
   */
  static async bulkUpdateStatus({ attendanceIds, newStatus }: BulkUpdateParams) {
    try {
      const result = await bulkUpdateAttendanceStatus(attendanceIds, newStatus);
      
      return {
        success: result.success,
        data: result.value,
        error: result.error
      };
    } catch (error) {
      console.error("Error bulk updating attendances:", error);
      return {
        success: false,
        data: null,
        error: "Failed to bulk update attendances"
      };
    }
  }

  /**
   * Handle incomplete attendances (reschedule or complete)
   */
  static async handleIncompleteAttendances(
    attendances: AttendanceStatusDetail[],
    action: "complete" | "reschedule"
  ) {
    try {
      const results = [];
      
      for (const attendance of attendances) {
        if (attendance.attendanceId) {
          if (action === "complete") {
            const result = await this.completeAttendance(attendance.attendanceId);
            results.push(result);
          } else {
            const result = await this.updateStatus({
              attendanceId: attendance.attendanceId,
              newStatus: AttendanceStatus.SCHEDULED
            });
            results.push(result);
          }
        }
      }

      const allSuccessful = results.every(result => result.success);
      
      return {
        success: allSuccessful,
        results,
        error: allSuccessful ? null : "Some operations failed"
      };
    } catch (error) {
      console.error("Error handling incomplete attendances:", error);
      return {
        success: false,
        results: [],
        error: "Failed to handle incomplete attendances"
      };
    }
  }
}

export default AttendanceService;

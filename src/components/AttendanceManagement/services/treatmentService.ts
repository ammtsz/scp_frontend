/**
 * Treatment Service - Centralized business logic for treatment operations
 * 
 * This service handles treatment workflow operations and end-of-day workflows.
 */

import { 
  markAttendanceAsMissed, 
  updateAttendance 
} from "@/api/attendances";
import { IAttendanceStatusDetail, IAttendanceByDate } from "@/types/globals";
import { AttendanceService } from "./attendanceService";

// Removed SpiritualConsultationData interface - no longer needed

export interface AbsenceJustification {
  attendanceId: number;
  patientName: string;
  justified: boolean;
  notes: string;
}

export interface EndOfDayCompletionData {
  totalPatients: number;
  completedPatients: number;
  missedPatients: number;
  completionTime: Date;
}

/**
 * Treatment Service Class
 */
export class TreatmentService {
  // Removed createSpiritualConsultation method - no longer needed

  /**
   * Handle absence justifications for scheduled patients
   */
  static async handleAbsenceJustifications(
    justifications: AbsenceJustification[]
  ) {
    try {
      const results = [];
      
      for (const justification of justifications) {
        // Mark attendance as missed
        const missedResult = await markAttendanceAsMissed(
          justification.attendanceId.toString(),
          justification.justified
        );
        results.push(missedResult);

        // If unjustified, add notes to the attendance
        if (!justification.justified && justification.notes) {
          const notesResult = await updateAttendance(
            justification.attendanceId.toString(),
            {
              notes: justification.notes || "Falta não justificada",
            }
          );
          results.push(notesResult);
        }
      }

      const allSuccessful = results.every(result => result.success);
      
      return {
        success: allSuccessful,
        results,
        error: allSuccessful ? null : "Some operations failed"
      };
    } catch (error) {
      console.error("Error handling absence justifications:", error);
      return {
        success: false,
        results: [],
        error: "Failed to handle absence justifications"
      };
    }
  }

  /**
   * Process end of day finalization with comprehensive statistics
   */
  static async finalizeEndOfDay(
    attendancesByDate: IAttendanceByDate | null,
    incompleteAttendances?: IAttendanceStatusDetail[],
    scheduledAbsences?: IAttendanceStatusDetail[]
  ): Promise<{
    success: boolean;
    completionData: EndOfDayCompletionData;
    error?: string;
  }> {
    try {
      // Handle incomplete attendances if provided
      if (incompleteAttendances && incompleteAttendances.length > 0) {
        const incompleteResult = await AttendanceService.handleIncompleteAttendances(
          incompleteAttendances,
          "reschedule"
        );
        
        if (!incompleteResult.success) {
          console.warn("Some incomplete attendances could not be processed");
        }
      }

      // Handle scheduled absences if provided
      if (scheduledAbsences && scheduledAbsences.length > 0) {
        const justifications: AbsenceJustification[] = scheduledAbsences.map(
          (attendance) => ({
            attendanceId: attendance.attendanceId!,
            patientName: attendance.name,
            justified: false,
            notes: "",
          })
        );
        
        const absenceResult = await this.handleAbsenceJustifications(justifications);
        
        if (!absenceResult.success) {
          console.warn("Some absence justifications could not be processed");
        }
      }

      // Calculate final statistics
      const completionData = this.calculateDayStatistics(attendancesByDate);

      return {
        success: true,
        completionData,
      };
    } catch (error) {
      console.error("Error finalizing end of day:", error);
      return {
        success: false,
        completionData: {
          totalPatients: 0,
          completedPatients: 0,
          missedPatients: 0,
          completionTime: new Date(),
        },
        error: "Failed to finalize end of day"
      };
    }
  }

  /**
   * Calculate comprehensive day statistics
   */
  static calculateDayStatistics(attendancesByDate: IAttendanceByDate | null): EndOfDayCompletionData {
    if (!attendancesByDate) {
      return {
        totalPatients: 0,
        completedPatients: 0,
        missedPatients: 0,
        completionTime: new Date(),
      };
    }

    let totalPatients = 0;
    let completedPatients = 0;
    let missedPatients = 0;

    ["spiritual", "lightBath", "rod"].forEach((type) => {
      const typeData = attendancesByDate[type as keyof typeof attendancesByDate];
      if (typeData && typeof typeData === "object") {
        Object.keys(typeData).forEach((status) => {
          const statusData = typeData[status as keyof typeof typeData];
          if (Array.isArray(statusData)) {
            const attendances = statusData as IAttendanceStatusDetail[];
            totalPatients += attendances.length;
            
            if (status === "completed") {
              completedPatients += attendances.length;
            } else if (status === "missed") {
              missedPatients += attendances.length;
            }
          }
        });
      }
    });

    return {
      totalPatients,
      completedPatients,
      missedPatients,
      completionTime: new Date(),
    };
  }

  /**
   * Check day status for end-of-day workflow
   */
  static checkEndOfDayStatus(attendancesByDate: IAttendanceByDate | null) {
    if (!attendancesByDate) {
      return {
        type: "completed" as const,
        incompleteAttendances: [],
        scheduledAbsences: [],
      };
    }

    // Check for incomplete attendances (checked-in or ongoing)
    const incompleteAttendances: IAttendanceStatusDetail[] = [];
    ["spiritual", "lightBath", "rod"].forEach((type) => {
      ["checkedIn", "onGoing"].forEach((status) => {
        const typeData = attendancesByDate[type as keyof typeof attendancesByDate];
        if (typeData && typeof typeData === "object") {
          const statusData = typeData[status as keyof typeof typeData];
          if (Array.isArray(statusData)) {
            incompleteAttendances.push(
              ...(statusData as IAttendanceStatusDetail[])
            );
          }
        }
      });
    });

    // Check for scheduled absences
    const scheduledAbsences: IAttendanceStatusDetail[] = [];
    ["spiritual", "lightBath", "rod"].forEach((type) => {
      const typeData = attendancesByDate[type as keyof typeof attendancesByDate];
      if (typeData && typeof typeData === "object" && "scheduled" in typeData) {
        const scheduledData = typeData.scheduled;
        if (Array.isArray(scheduledData)) {
          scheduledAbsences.push(
            ...(scheduledData as IAttendanceStatusDetail[])
          );
        }
      }
    });

    if (incompleteAttendances.length > 0) {
      return { 
        type: "incomplete" as const, 
        incompleteAttendances, 
        scheduledAbsences 
      };
    }

    if (scheduledAbsences.length > 0) {
      return { 
        type: "scheduled_absences" as const, 
        incompleteAttendances, 
        scheduledAbsences 
      };
    }

    return { 
      type: "completed" as const, 
      incompleteAttendances, 
      scheduledAbsences 
    };
  }
}

export default TreatmentService;

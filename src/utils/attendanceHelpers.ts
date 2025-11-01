import type {
  TreatmentSessionResponseDto,
  TreatmentRecordResponseDto,
} from "@/api/types";
import type { PreviousAttendance, AttendanceType } from "@/types/types";

// Grouped attendance by date and treatment type
export interface GroupedAttendance {
  date: Date;
  attendanceId: string;
  notes: string;
  treatments: {
    spiritual?: {
      notes?: string;
      recommendations?: {
        food?: string;
        water?: string;
        ointment?: string;
        lightBath?: boolean;
        rod?: boolean;
        spiritualTreatment?: boolean;
        returnWeeks?: number;
      };
    };
    lightBath?: {
      bodyLocations: string[];
      color?: string;
      duration?: number;
      sessions: number;
    };
    rod?: {
      bodyLocations: string[];
      sessions: number;
    };
  };
}

/**
 * Group attendance history by date and combine treatment data
 * @param attendances - Array of previous attendances
 * @param treatmentSessions - Array of treatment sessions
 * @param treatmentRecords - Array of treatment records
 * @returns Array of grouped attendances sorted by date (most recent first)
 */
export const groupAttendancesByDate = (
  attendances: PreviousAttendance[],
  treatmentSessions: TreatmentSessionResponseDto[],
  treatmentRecords: TreatmentRecordResponseDto[]
): GroupedAttendance[] => {
  const attendanceMap = new Map<string, GroupedAttendance>();

  // First, create base attendances from the regular attendance data
  attendances.forEach((attendance) => {
    const dateKey = attendance.date.toISOString().split("T")[0];

    if (!attendanceMap.has(dateKey)) {
      attendanceMap.set(dateKey, {
        date: attendance.date,
        attendanceId: attendance.attendanceId,
        notes: attendance.notes,
        treatments: {},
      });
    }

    const grouped = attendanceMap.get(dateKey)!;

    // Add spiritual attendance data
    if (attendance.type === "spiritual") {
      // Try to find treatment record for this attendance
      const treatmentRecord = treatmentRecords.find(
        (record) => record.attendance_id === Number(attendance.attendanceId)
      );

      grouped.treatments.spiritual = {
        notes: attendance.notes,
        recommendations: treatmentRecord
          ? {
              food: treatmentRecord.food || "",
              water: treatmentRecord.water || "",
              ointment: treatmentRecord.ointments || "",
              lightBath: treatmentRecord.light_bath || false,
              rod: treatmentRecord.rod || false,
              spiritualTreatment: treatmentRecord.spiritual_treatment || false,
              returnWeeks: treatmentRecord.return_in_weeks || 0,
            }
          : attendance.recommendations || undefined,
      };
    }
  });

  // Then, enhance with treatment session data for completed sessions
  treatmentSessions.forEach((session) => {
    const dateKey = session.start_date;

    // Only include completed sessions that match attendance dates
    if (session.status === "completed" || session.completed_sessions > 0) {
      // Find or create attendance for this date
      let grouped = attendanceMap.get(dateKey);
      if (!grouped) {
        // If no attendance exists for this date, create one
        grouped = {
          date: new Date(session.start_date + "T00:00:00"), // Timezone-agnostic: parse as local time
          attendanceId: session.attendance_id.toString(),
          notes: session.notes || "",
          treatments: {},
        };
        attendanceMap.set(dateKey, grouped);
      }

      // Add treatment session data
      if (session.treatment_type === "light_bath") {
        if (!grouped.treatments.lightBath) {
          grouped.treatments.lightBath = {
            bodyLocations: [],
            color: session.color,
            duration: session.duration_minutes,
            sessions: 0,
          };
        }
        grouped.treatments.lightBath.bodyLocations.push(session.body_location);
        grouped.treatments.lightBath.sessions += session.completed_sessions;
      } else if (session.treatment_type === "rod") {
        if (!grouped.treatments.rod) {
          grouped.treatments.rod = {
            bodyLocations: [],
            sessions: 0,
          };
        }
        grouped.treatments.rod.bodyLocations.push(session.body_location);
        grouped.treatments.rod.sessions += session.completed_sessions;
      }
    }
  });

  return Array.from(attendanceMap.values()).sort(
    (a, b) => b.date.getTime() - a.date.getTime()
  ); // Most recent first
};

/**
 * Get treatment types label from grouped attendance treatments
 * @param treatments - Treatment data from grouped attendance
 * @returns Formatted string with treatment types
 */
export const getTreatmentTypesLabel = (
  treatments: GroupedAttendance["treatments"]
): string => {
  const types: string[] = [];

  if (treatments.spiritual) {
    types.push("Consulta Espiritual");
  }
  if (treatments.lightBath) {
    types.push("Banho de Luz");
  }
  if (treatments.rod) {
    types.push("Bastão");
  }

  return types.length > 0 ? types.join(" + ") : "Tipo não especificado";
};

// Grouped scheduled attendance by date and treatment type
export interface GroupedScheduledAttendance {
  date: Date;
  attendanceId: string;
  notes: string;
  treatments: {
    spiritual?: {
      isScheduled: boolean;
    };
    lightBath?: {
      bodyLocations: string[];
      color?: string;
      duration?: number;
      sessions: number;
    };
    rod?: {
      bodyLocations: string[];
      sessions: number;
    };
  };
}

/**
 * Group scheduled attendances by date and combine treatment data
 * @param scheduledAttendances - Array of scheduled attendances
 * @param treatmentSessions - Array of treatment sessions
 * @returns Array of grouped scheduled attendances sorted by date (earliest first)
 */
export const groupScheduledAttendancesByDate = (
  scheduledAttendances: { date: Date; type: AttendanceType }[],
  treatmentSessions: TreatmentSessionResponseDto[]
): GroupedScheduledAttendance[] => {
  const attendanceMap = new Map<string, GroupedScheduledAttendance>();

  // First, create base scheduled attendances from the regular attendance data
  scheduledAttendances.forEach((attendance, index) => {
    const dateKey = attendance.date.toISOString().split("T")[0];

    if (!attendanceMap.has(dateKey)) {
      attendanceMap.set(dateKey, {
        date: attendance.date,
        attendanceId: `scheduled-${index}`,
        notes: "",
        treatments: {},
      });
    }

    const grouped = attendanceMap.get(dateKey)!;

    // Add scheduled spiritual attendance data
    if (attendance.type === "spiritual") {
      grouped.treatments.spiritual = {
        isScheduled: true,
      };
    }
  });
  
  // Then, enhance with treatment session data for scheduled/future sessions
  treatmentSessions.forEach((treatment) => {
    treatment.sessionRecords?.forEach((session) => {
      
      const sessionDate = new Date(session.scheduled_date); // Timezone-agnostic: parse as local time
      const today = new Date();
      today.setHours(0, 0, 0, 0);
  
      // Only include future/scheduled sessions
      if (
        sessionDate >= today &&
        (session.status === "scheduled")
      ) {
        const dateKey = sessionDate.toISOString().split("T")[0];
  
        // Find or create attendance for this date
        const grouped = attendanceMap.get(dateKey);
        if (grouped) {
          if (treatment.treatment_type === "light_bath") {
            if (!grouped.treatments.lightBath) {
              grouped.treatments.lightBath = {
                bodyLocations: [],
                color: treatment.color,
                duration: treatment.duration_minutes,
                sessions: 0,
              };
            }
            grouped.treatments.lightBath.bodyLocations.push(treatment.body_location);
            grouped.treatments.lightBath.sessions += treatment.planned_sessions;
          } else if (treatment.treatment_type === "rod") {
            if (!grouped.treatments.rod) {
              grouped.treatments.rod = {
                bodyLocations: [],
                sessions: 0,
              };
            }
            grouped.treatments.rod.bodyLocations.push(treatment.body_location);
            grouped.treatments.rod.sessions += treatment.planned_sessions;
          }
        }
  
        // Add treatment session data
      }
    });
  });


  return Array.from(attendanceMap.values()).sort(
    (a, b) => a.date.getTime() - b.date.getTime()
  ); // Earliest first for scheduled
};

/**
 * Get treatment types label from grouped scheduled attendance treatments
 * @param treatments - Treatment data from grouped scheduled attendance
 * @returns Formatted string with treatment types
 */
export const getScheduledTreatmentTypesLabel = (
  treatments: GroupedScheduledAttendance["treatments"]
): string => {
  const types: string[] = [];

  if (treatments.spiritual) {
    types.push("Consulta Espiritual");
  }
  if (treatments.lightBath) {
    types.push("Banho de Luz");
  }
  if (treatments.rod) {
    types.push("Bastão");
  }

  return types.length > 0 ? types.join(" + ") : "Agendamento";
};
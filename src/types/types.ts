/**
 * Unified Type System - Modern TypeScript Types
 * 
 * This file defines all type definitions for the application using modern TypeScript conventions.
 * Primary types use clean names without prefixes (Priority, Status, AttendanceType, etc.).
 * Legacy I-prefixed types are maintained as aliases for backward compatibility.
 * New API types are re-exported for seamless integration.
 */

// Re-export new API types
export {
  PatientPriority,
  TreatmentStatus,
  type PatientResponseDto,
  type AttendanceResponseDto,
  type AttendanceAgendaDto,
  type TreatmentRecordResponseDto,
  type CreatePatientRequest,
  type UpdatePatientRequest,
  type CreateAttendanceRequest,
  type UpdateAttendanceRequest,
  type CreateTreatmentRecordRequest,
  type UpdateTreatmentRecordRequest,
  type ScheduleSettingResponseDto
} from '@/api/types';

// Primary types (modern naming without I-prefix)
export type Priority = "1" | "2" | "3";
export type Status = "N" | "T" | "A" | "F";
export type AttendanceType = "spiritual" | "lightBath" | "rod" | "combined"; // combined for calendar view
export type AttendanceProgression = "scheduled" | "checkedIn" | "onGoing" | "completed";

// UI section types for the room layout  
export type UISection = "spiritual" | "mixed"; // spiritual room and mixed room (lightBath + rod)

export interface Recommendations {
  food: string;
  water: string;
  ointment: string;
  lightBath: boolean;
  rod: boolean;
  spiritualTreatment: boolean;
  returnWeeks: number;
}

export interface AttendanceStatusDetail {
  name: string; 
  priority: Priority; 
  checkedInTime?: string | null; 
  onGoingTime?: string | null; 
  completedTime?: string | null;
  // Backend sync data
  attendanceId?: number;
  patientId?: number;
}

export interface AttendanceStatus {
    scheduled: AttendanceStatusDetail[],
    checkedIn: AttendanceStatusDetail[],
    onGoing: AttendanceStatusDetail[],
    completed: AttendanceStatusDetail[],
  }

export type AttendanceByDate = {
  date: Date;
} & {
  [type in AttendanceType]: AttendanceStatus;
};

export interface AgendaItem {
  date: Date;
  patients: {
    id: string;
    name: string;
    priority: Priority;
    attendanceId?: number; // Backend attendance ID for deletion
    attendanceType?: AttendanceType; // Specific attendance type for individual patients
  }[];
}

export type Agenda = {
  [K in AttendanceType]: AgendaItem[];
};

// Specialized agenda type for calendar view (combines lightBath and rod into lightBath)
export type CalendarAgenda = {
  spiritual: AgendaItem[];
  lightBath: AgendaItem[];
};

export interface PatientBasic {
  name: string,
  id: string,
  phone: string,
  priority: Priority,
  status: Status,
}

export interface Patient extends PatientBasic {
  birthDate: Date,
  mainComplaint: string,
  startDate: Date,
  dischargeDate: Date | null,
  timezone?: string,
  nextAttendanceDates: {
    date: Date,
    type: AttendanceType
  }[],
  currentRecommendations: {
    date: Date,
  } & Recommendations,
  previousAttendances: PreviousAttendance[]
}

export interface PreviousAttendance {
  attendanceId: string;
  date: Date;
  type: AttendanceType;
  notes: string;
  recommendations: Recommendations | null;
}

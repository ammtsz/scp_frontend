/**
 * Frontend types using camelCase naming convention
 * These are the types used throughout the React components
 */

// Base types
export type Priority = "1" | "2" | "3";
export type TreatmentStatus = "T" | "A" | "F";
export type AttendanceType = "spiritual" | "lightBath" | "rod";
export type AttendanceProgression = "scheduled" | "checkedIn" | "onGoing" | "completed" | "cancelled";

// Patient types
export interface Patient {
  id: number;
  name: string;
  phone?: string;
  priority: Priority;
  treatmentStatus: TreatmentStatus;
  birthDate?: Date;
  mainComplaint?: string;
  dischargeDate?: Date;
  startDate: Date;
  timezone?: string; // Patient's timezone preference
  createdAt: Date;
  updatedAt: Date;
}

// Attendance types
export interface Attendance {
  id: number;
  patientId: number;
  type: AttendanceType;
  status: AttendanceProgression;
  scheduledDate: Date;
  scheduledTime: string; // HH:mm format
  checkedInTime?: string; // HH:mm:ss
  startedTime?: string; // HH:mm:ss
  completedTime?: string; // HH:mm:ss
  cancelledDate?: Date; // Only set when cancelled
  absenceJustified?: boolean;
  absenceNotes?: string; // Notes explaining reason for absence
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  patient?: Patient;
}

// Treatment Record types
export interface TreatmentRecord {
  id: number;
  attendanceId: number;
  food?: string;
  water?: string;
  ointments?: string;
  lightBath?: boolean;
  rod?: boolean;
  spiritualTreatment?: boolean;
  returnInWeeks?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Schedule Setting types
export interface ScheduleSetting {
  id: number;
  dayOfWeek: number; // 0 = Sunday, 6 = Saturday
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  maxConcurrentSpiritual: number;
  maxConcurrentLightBath: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Request types for creating/updating
export interface CreatePatientRequest {
  name: string;
  phone?: string;
  priority?: Priority;
  treatmentStatus?: TreatmentStatus;
  birthDate?: Date;
  mainComplaint?: string;
}

export interface UpdatePatientRequest {
  name?: string;
  phone?: string;
  priority?: Priority;
  treatmentStatus?: TreatmentStatus;
  birthDate?: Date;
  mainComplaint?: string;
  dischargeDate?: Date;
}

export interface CreateAttendanceRequest {
  patientId: number;
  type: AttendanceType;
  scheduledDate: Date;
  scheduledTime: string;
  notes?: string;
}

export interface UpdateAttendanceRequest {
  type?: AttendanceType;
  status?: AttendanceProgression;
  scheduledDate?: Date;
  scheduledTime?: string;
  checkedInTime?: string; // HH:mm:ss
  startedTime?: string; // HH:mm:ss
  completedTime?: string; // HH:mm:ss
  cancelledDate?: Date; // Optional since only cancellations set this
  absenceJustified?: boolean;
  absenceNotes?: string; // Notes explaining reason for absence
  notes?: string;
}

// Component-specific types (keeping existing ones that work well)
export interface AttendanceStatusDetail {
  name: string;
  priority: Priority;
  checkedInTime?: Date | null;
  onGoingTime?: Date | null;
  completedTime?: Date | null;
}

export interface AttendanceStatus {
  scheduled: AttendanceStatusDetail[];
  checkedIn: AttendanceStatusDetail[];
  onGoing: AttendanceStatusDetail[];
  completed: AttendanceStatusDetail[];
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
  }[];
}

export type Agenda = {
  [K in AttendanceType]: AgendaItem[];
};

export interface Recommendations {
  food: string;
  water: string;
  ointment: string;
  lightBath: boolean;
  rod: boolean;
  spiritualTreatment: boolean;
  returnWeeks: number;
}

export interface PreviousAttendance {
  attendanceId: string;
  date: Date;
  type: AttendanceType;
  notes: string;
  recommendations: Recommendations | null;
}

export interface PatientDetails extends Patient {
  nextAttendanceDates: {
    date: Date;
    type: AttendanceType;
  }[];
  currentRecommendations: {
    date: Date;
  } & Recommendations;
  previousAttendances: PreviousAttendance[];
}

// Treatment Session types (frontend camelCase version)
export type TreatmentSessionStatus = 'active' | 'completed' | 'suspended' | 'cancelled';
export type TreatmentSessionFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly';

export interface TreatmentSession {
  id: number;
  patientId: number;
  type: AttendanceType;
  status: TreatmentSessionStatus;
  totalSessionsRecommended: number;
  sessionsCompleted: number;
  startDate: Date;
  endDate?: Date;
  frequency: TreatmentSessionFrequency;
  notes?: string;
  completionDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Treatment Session Record types (frontend camelCase version)
export type TreatmentSessionRecordStatus = 'scheduled' | 'completed' | 'missed' | 'rescheduled' | 'cancelled';

export interface TreatmentSessionRecord {
  id: number;
  treatmentSessionId: number;
  attendanceId?: number;
  sessionNumber: number;
  status: TreatmentSessionRecordStatus;
  scheduledDate: Date;
  scheduledTime: string; // HH:mm
  completionDate?: Date;
  missedDate?: Date;
  notes?: string;
  completionNotes?: string;
  missedReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Treatment Analytics types
export interface TreatmentAnalytics {
  completionRate: number;
  totalSessions: number;
  completedSessions: number;
  missedSessions: number;
  patientId?: number;
  periodStart?: Date;
  periodEnd?: Date;
}

export interface MissedSessionsAnalytics {
  totalMissed: number;
  missedByReason: Record<string, number>;
  patientId?: number;
  periodStart?: Date;
  periodEnd?: Date;
}

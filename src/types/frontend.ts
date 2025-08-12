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
  checkedInAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
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
  checkedInAt?: Date;
  startedAt?: Date;
  completedAt?: Date;
  cancelledAt?: Date;
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

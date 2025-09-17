// API Response types that match backend DTOs

// Enums matching backend
export enum PatientPriority {
  EMERGENCY = '1',
  INTERMEDIATE = '2',
  NORMAL = '3'
}

export enum TreatmentStatus {
  NEW_PATIENT = 'N',
  IN_TREATMENT = 'T',
  DISCHARGED = 'A',
  ABSENT = 'F'
}

export enum AttendanceType {
  SPIRITUAL = 'spiritual',
  LIGHT_BATH = 'light_bath',
  ROD = 'rod'
}

export enum AttendanceStatus {
  SCHEDULED = 'scheduled',
  CHECKED_IN = 'checked_in',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  MISSED = 'missed'
}

// API Response DTOs matching backend
export interface PatientResponseDto {
  id: number;
  name: string;
  phone?: string;
  priority: PatientPriority;
  treatment_status: TreatmentStatus;
  birth_date?: string; // ISO date string
  main_complaint?: string;
  discharge_date?: string; // ISO date string
  start_date: string; // ISO date string
  missing_appointments_streak: number;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
}

export interface AttendanceResponseDto {
  id: number;
  patient_id: number;
  type: AttendanceType;
  status: AttendanceStatus;
  scheduled_date: string; // YYYY-MM-DD
  scheduled_time: string; // HH:mm
  checked_in_at?: string; // ISO datetime string
  started_at?: string; // ISO datetime string
  completed_at?: string; // ISO datetime string
  cancelled_at?: string; // ISO datetime string
  absence_justified?: boolean;
  absence_notes?: string; // Notes explaining reason for absence
  notes?: string;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
  patient?: PatientResponseDto; // Optional patient data
}

// Optimized DTOs for specific use cases
export interface AttendanceAgendaDto {
  id: number;
  patient_id: number;
  type: AttendanceType;
  status: AttendanceStatus;
  scheduled_date: string; // YYYY-MM-DD
  notes?: string;
  patient_name: string;
  patient_priority: string;
}

export interface NextAttendanceDateDto {
  next_date: string; // YYYY-MM-DD
}

export interface TreatmentRecordResponseDto {
  id: number;
  attendance_id: number;
  food?: string;
  water?: string;
  ointments?: string;
  light_bath?: boolean;
  light_bath_color?: string;
  rod?: boolean;
  spiritual_treatment?: boolean;
  return_in_weeks?: number;
  notes?: string;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
}

export interface UpdateTreatmentRecordResponseDto {
  record: TreatmentRecordResponseDto;
  treatmentSessions?: {
    lightBathResult?: {
      success: boolean;
      errors: string[];
    };
    rodResult?: {
      success: boolean;
      errors: string[];
    };
  };
}

export interface ScheduleSettingResponseDto {
  id: number;
  day_of_week: number; // 0 = Sunday, 6 = Saturday
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  max_concurrent_spiritual: number;
  max_concurrent_light_bath: number;
  is_active: boolean;
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
}

// API Request types
export interface CreatePatientRequest {
  name: string;
  phone?: string;
  priority?: PatientPriority;
  treatment_status?: TreatmentStatus;
  birth_date?: string; // ISO date string
  main_complaint?: string;
}

export interface UpdatePatientRequest {
  name?: string;
  phone?: string;
  priority?: PatientPriority;
  treatment_status?: TreatmentStatus;
  birth_date?: string; // ISO date string
  main_complaint?: string;
  discharge_date?: string; // ISO date string
}

export interface CreateAttendanceRequest {
  patient_id: number;
  type: AttendanceType;
  scheduled_date: string; // YYYY-MM-DD
  scheduled_time: string; // HH:mm
  notes?: string;
}

export interface UpdateAttendanceRequest {
  type?: AttendanceType;
  status?: AttendanceStatus;
  scheduled_date?: string; // YYYY-MM-DD
  scheduled_time?: string; // HH:mm
  checked_in_at?: string; // ISO datetime string
  started_at?: string; // ISO datetime string
  completed_at?: string; // ISO datetime string
  cancelled_at?: string; // ISO datetime string
  absence_justified?: boolean;
  absence_notes?: string; // Notes explaining reason for absence
  notes?: string;
}

export interface CreateTreatmentRecordRequest {
  attendance_id: number;
  food?: string;
  water?: string;
  ointments?: string;
  light_bath?: boolean;
  light_bath_color?: string;
  rod?: boolean;
  spiritual_treatment?: boolean;
  return_in_weeks?: number; // 1-52 weeks
  notes?: string;
}

export interface UpdateTreatmentRecordRequest {
  attendance_id?: number;
  food?: string;
  water?: string;
  ointments?: string;
  light_bath?: boolean;
  light_bath_color?: string;
  rod?: boolean;
  spiritual_treatment?: boolean;
  return_in_weeks?: number; // 1-52 weeks
  notes?: string;
}

export interface CreateScheduleSettingRequest {
  day_of_week: number; // 0 = Sunday, 6 = Saturday
  start_time: string; // HH:mm
  end_time: string; // HH:mm
  max_concurrent_spiritual?: number;
  max_concurrent_light_bath?: number;
  is_active?: boolean;
}

export interface UpdateScheduleSettingRequest {
  day_of_week?: number; // 0 = Sunday, 6 = Saturday
  start_time?: string; // HH:mm
  end_time?: string; // HH:mm
  max_concurrent_spiritual?: number;
  max_concurrent_light_bath?: number;
  is_active?: boolean;
}

// Common API Response wrapper
export interface ApiResponse<T> {
  success: boolean;
  value?: T;
  error?: string;
}

// Treatment Session types
export type TreatmentSessionStatus = 'active' | 'completed' | 'suspended' | 'cancelled';
export type TreatmentSessionFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly';

export interface TreatmentSessionResponseDto {
  id: number;
  treatment_record_id: number;
  attendance_id: number;
  patient_id: number;
  treatment_type: 'light_bath' | 'rod';
  body_location: string;
  start_date: string; // ISO date string
  planned_sessions: number;
  completed_sessions: number;
  end_date?: string; // ISO date string
  status: string;
  duration_minutes?: number;
  color?: string;
  notes?: string;
  sessionRecords?: TreatmentSessionRecordResponseDto[];
  created_at: string; // ISO datetime string
  updated_at: string; // ISO datetime string
}

export interface CreateTreatmentSessionRequest {
  treatment_record_id: number;
  attendance_id: number;
  patient_id: number;
  treatment_type: 'light_bath' | 'rod';
  body_location: string;
  start_date: string; // ISO date string
  planned_sessions: number;
  end_date?: string; // ISO date string
  duration_minutes?: number; // Required for light_bath
  color?: string; // Required for light_bath
  notes?: string;
}

export interface UpdateTreatmentSessionRequest {
  total_sessions_recommended?: number;
  end_date?: string; // ISO date string
  frequency?: TreatmentSessionFrequency;
  notes?: string;
}

// Treatment Session Record types
export type TreatmentSessionRecordStatus = 'scheduled' | 'completed' | 'missed' | 'cancelled';

export interface TreatmentSessionRecordResponseDto {
  id: number;
  treatment_session_id: number;
  attendance_id?: number;
  session_number: number;
  scheduled_date: string;
  start_time?: string;
  end_time?: string;
  status: TreatmentSessionRecordStatus;
  notes?: string;
  missed_reason?: string;
  performed_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTreatmentSessionRecordRequest {
  treatment_session_id: number;
  attendance_id?: number;
  session_number: number;
  scheduled_date: string; // ISO date string
  scheduled_time: string; // HH:mm
  notes?: string;
}

export interface UpdateTreatmentSessionRecordRequest {
  scheduled_date?: string; // ISO date string
  scheduled_time?: string; // HH:mm
  notes?: string;
}

export interface CompleteTreatmentSessionRecordRequest {
  completion_notes?: string;
}

export interface MarkMissedTreatmentSessionRecordRequest {
  missed_reason?: string;
}

export interface RescheduleTreatmentSessionRecordRequest {
  new_date: string; // ISO date string
  new_time: string; // HH:mm
  reschedule_reason?: string;
}

export interface CompleteTreatmentSessionRequest {
  completion_notes?: string;
}

export interface SuspendTreatmentSessionRequest {
  suspension_reason?: string;
}

// Analytics types
export interface TreatmentAnalyticsData {
  completion_rate: number;
  total_sessions: number;
  completed_sessions: number;
  missed_sessions: number;
  patient_id?: number;
  period_start?: string;
  period_end?: string;
}

export interface MissedSessionsAnalyticsData {
  total_missed: number;
  missed_by_reason: Record<string, number>;
  patient_id?: number;
  period_start?: string;
  period_end?: string;
}

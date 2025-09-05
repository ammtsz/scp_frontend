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

import { z } from 'zod';

// Enhanced Type Definitions with Zod validation
// These schemas provide both TypeScript types and runtime validation

// Enums with proper validation
export const PatientPrioritySchema = z.enum(['1', '2', '3'], {
  message: 'Priority must be 1 (Emergency), 2 (Intermediate), or 3 (Normal)'
});

export const TreatmentStatusSchema = z.enum(['N', 'T', 'A', 'F'], {
  message: 'Treatment status must be N, T, A, or F'
});

export const AttendanceTypeSchema = z.enum(['spiritual', 'light_bath', 'rod'], {
  message: 'Attendance type must be spiritual, light_bath, or rod'
});

export const AttendanceStatusSchema = z.enum([
  'scheduled', 'checked_in', 'in_progress', 'completed', 'cancelled', 'missed'
], {
  message: 'Invalid attendance status'
});

// Base Patient Schema with validation
export const PatientBaseSchema = z.object({
  id: z.number().positive('Patient ID must be positive'),
  name: z.string().min(1, 'Patient name is required').max(255, 'Name too long'),
  phone: z.string().optional().nullable(),
  priority: PatientPrioritySchema,
  treatment_status: TreatmentStatusSchema,
  birth_date: z.string().datetime().optional().nullable(),
  main_complaint: z.string().optional().nullable(),
  discharge_date: z.string().datetime().optional().nullable(),
  start_date: z.string().datetime('Invalid start date format'),
  missing_appointments_streak: z.number().min(0, 'Missing appointments cannot be negative'),
  timezone: z.string().default('America/Sao_Paulo'),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Enhanced Patient Schema with computed fields
export const PatientResponseSchema = PatientBaseSchema.extend({
  // Runtime validation ensures data integrity
}).transform((data) => ({
  ...data,
  // Add computed fields with type safety
  isEmergency: data.priority === '1',
  isActive: ['N', 'T'].includes(data.treatment_status),
  daysSinceTreatmentStart: Math.floor(
    (Date.now() - new Date(data.start_date).getTime()) / (1000 * 60 * 60 * 24)
  ),
}));

// Attendance Schema with relationships
export const AttendanceResponseSchema = z.object({
  id: z.number().positive(),
  patient_id: z.number().positive(),
  type: AttendanceTypeSchema,
  status: AttendanceStatusSchema,
  scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD format'),
  scheduled_time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be HH:mm format'),
  checked_in_time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/).optional().nullable(),
  started_time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/).optional().nullable(),
  completed_time: z.string().regex(/^\d{2}:\d{2}:\d{2}$/).optional().nullable(),
  cancelled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().nullable(),
  absence_justified: z.boolean().optional().nullable(),
  absence_notes: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
  patient: PatientBaseSchema.optional(),
});

// Treatment Record Schema
export const TreatmentRecordSchema = z.object({
  id: z.number().positive(),
  attendance_id: z.number().positive(),
  food: z.string().optional().nullable(),
  water: z.string().optional().nullable(),
  ointments: z.string().optional().nullable(),
  light_bath: z.boolean().optional().nullable(),
  light_bath_color: z.string().optional().nullable(),
  rod: z.boolean().optional().nullable(),
  spiritual_treatment: z.boolean().optional().nullable(),
  return_in_weeks: z.number().min(1).max(52).optional().nullable(),
  notes: z.string().optional().nullable(),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// Patient Notes Schema
export const PatientNoteSchema = z.object({
  id: z.number().positive(),
  patient_id: z.number().positive(),
  category: z.enum([
    'general', 'treatment', 'observation', 'behavior', 
    'medication', 'progress', 'family', 'emergency'
  ]),
  content: z.string().min(1, 'Note content cannot be empty').max(2000, 'Note too long'),
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

// API Request Schemas
export const CreatePatientRequestSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  phone: z.string().optional(),
  priority: PatientPrioritySchema,
  treatment_status: TreatmentStatusSchema.default('N'),
  birth_date: z.string().datetime().optional(),
  main_complaint: z.string().optional(),
  timezone: z.string().default('America/Sao_Paulo'),
});

export const UpdatePatientRequestSchema = CreatePatientRequestSchema.partial().extend({
  discharge_date: z.string().datetime().optional(),
});

export const CreateAttendanceRequestSchema = z.object({
  patient_id: z.number().positive(),
  type: AttendanceTypeSchema,
  scheduled_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  scheduled_time: z.string().regex(/^\d{2}:\d{2}$/),
  notes: z.string().optional(),
});

// Infer TypeScript types from Zod schemas
export type PatientResponse = z.infer<typeof PatientResponseSchema>;
export type AttendanceResponse = z.infer<typeof AttendanceResponseSchema>;
export type TreatmentRecord = z.infer<typeof TreatmentRecordSchema>;
export type PatientNote = z.infer<typeof PatientNoteSchema>;
export type CreatePatientRequest = z.infer<typeof CreatePatientRequestSchema>;
export type UpdatePatientRequest = z.infer<typeof UpdatePatientRequestSchema>;
export type CreateAttendanceRequest = z.infer<typeof CreateAttendanceRequestSchema>;

// Export enum types for convenience
export type PatientPriority = z.infer<typeof PatientPrioritySchema>;
export type TreatmentStatus = z.infer<typeof TreatmentStatusSchema>;
export type AttendanceType = z.infer<typeof AttendanceTypeSchema>;
export type AttendanceStatus = z.infer<typeof AttendanceStatusSchema>;

// Validation helper functions
export const validatePatientResponse = (data: unknown): PatientResponse => {
  return PatientResponseSchema.parse(data);
};

export const validateAttendanceResponse = (data: unknown): AttendanceResponse => {
  return AttendanceResponseSchema.parse(data);
};

export const validatePatientNote = (data: unknown): PatientNote => {
  return PatientNoteSchema.parse(data);
};

// Safe validation functions that return Results instead of throwing
export const safeValidatePatientResponse = (data: unknown) => {
  return PatientResponseSchema.safeParse(data);
};

export const safeValidateAttendanceResponse = (data: unknown) => {
  return AttendanceResponseSchema.safeParse(data);
};

// Type guards
export const isValidPatientPriority = (priority: unknown): priority is PatientPriority => {
  return PatientPrioritySchema.safeParse(priority).success;
};

export const isValidAttendanceType = (type: unknown): type is AttendanceType => {
  return AttendanceTypeSchema.safeParse(type).success;
};

export const isValidAttendanceStatus = (status: unknown): status is AttendanceStatus => {
  return AttendanceStatusSchema.safeParse(status).success;
};

// Complex validation for business rules
export const validateBusinessRules = {
  canScheduleAttendance: (patient: PatientResponse, date: string): boolean => {
    // Business rule: Cannot schedule for discharged patients
    if (patient.treatment_status === 'A') return false;
    
    // Business rule: Cannot schedule in the past
    const scheduledDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return scheduledDate >= today;
  },
  
  isValidTreatmentProgression: (
    fromStatus: AttendanceStatus, 
    toStatus: AttendanceStatus
  ): boolean => {
    const validTransitions: Record<AttendanceStatus, AttendanceStatus[]> = {
      scheduled: ['checked_in', 'cancelled', 'missed'],
      checked_in: ['in_progress', 'completed', 'cancelled'],
      in_progress: ['completed', 'cancelled'],
      completed: ['scheduled'], // Can reschedule
      cancelled: ['scheduled'], // Can reschedule
      missed: ['scheduled'], // Can reschedule
    };
    
    return validTransitions[fromStatus]?.includes(toStatus) ?? false;
  },
  
  validateAppointmentTime: (time: string): boolean => {
    const [hours, minutes] = time.split(':').map(Number);
    // Business hours: 8:00 AM to 6:00 PM
    const totalMinutes = hours * 60 + minutes;
    return totalMinutes >= 8 * 60 && totalMinutes <= 18 * 60;
  },
};
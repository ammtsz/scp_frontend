/**
 * Services barrel export
 * 
 * Centralized exports for all AttendanceManagement services
 */

export { AttendanceService } from './attendanceService';
export { PatientService } from './patientService';
export { TreatmentService } from './treatmentService';

// Re-export types for convenience
export type { 
  CreateAttendanceParams,
  CheckInParams,
  UpdateStatusParams,
  BulkUpdateParams
} from './attendanceService';

export type {
  CreatePatientParams,
  UpdatePatientParams
} from './patientService';

export type {
  AbsenceJustification,
  EndOfDayCompletionData
} from './treatmentService';

/**
 * AttendanceManagement hooks barrel export
 * 
 * This centralizes all hooks related to attendance management.
 * NEW: Service-layer based hooks for better organization.
 */

// ===== NEW ORGANIZED HOOKS =====
// These hooks use the service layer for business logic

/**
 * useAttendanceData - Consolidated data management hook
 * Replaces scattered data logic from multiple useAttendanceManagement hooks.
 * Use this for: fetching data, patient operations, basic CRUD
 */
export { useAttendanceData } from './useAttendanceData';
export type { 
  UseAttendanceDataProps, 
  UseAttendanceDataReturn 
} from './useAttendanceData';

/**
 * useAttendanceForm - Form management hook  
 * Handles form state and validation for creating new attendances.
 * Use this for: attendance creation forms, patient registration forms
 */
export { useAttendanceForm } from './useAttendanceForm';
export type {
  UseAttendanceFormProps,
  UseAttendanceFormReturn
} from './useAttendanceForm';

// ===== EXISTING HOOKS =====
// These are maintained for compatibility but may be refactored

/**
 * useTreatmentWorkflow - Treatment-specific workflows
 * Handles spiritual consultations and treatment processes.
 */
export { useTreatmentWorkflow } from './useTreatmentWorkflow';

/**
 * useAttendanceManagement - LEGACY HOOK
 * Large complex hook with drag & drop, form management, and data operations.
 * ⚠️  Being gradually replaced by specialized hooks above.
 * ⚠️  Use new hooks for new implementations.
 */
export { useAttendanceManagement } from './useAttendanceManagement';

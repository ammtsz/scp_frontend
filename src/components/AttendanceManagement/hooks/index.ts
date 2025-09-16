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
 * useDragAndDrop - Drag and drop functionality
 * Handles all drag and drop operations, confirmations, and multi-section logic.
 * Use this for: patient movement between statuses, drag interactions
 */
export { useDragAndDrop } from './useDragAndDrop';

/**
 * useModalManagement - Modal state management
 * Handles all modal states and their lifecycle.
 * Use this for: patient edit modals, treatment form modals
 */
export { useModalManagement } from './useModalManagement';
export type { ModalManagementState } from './useModalManagement';

/**
 * useAttendanceWorkflow - Workflow state management
 * Handles workflow-specific states like day finalization, collapsed sections.
 * Use this for: day finalization, UI state, attendance completion/rescheduling
 */
export { useAttendanceWorkflow } from './useAttendanceWorkflow';

/**
 * useExternalCheckIn - External check-in processing
 * Handles external check-in functionality from props.
 * Use this for: processing unscheduled check-ins from external sources
 */
export { useExternalCheckIn } from './useExternalCheckIn';

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

// ===== LEGACY HOOKS - DEPRECATED =====
// These hooks are being replaced by the organized hooks above.
// Do not use in new implementations.

/**
 * useAttendanceManagement - LEGACY HOOK
 * Large complex hook with drag & drop, form management, and data operations.
 * ⚠️  DEPRECATED: Replaced by specialized hooks above.
 * ⚠️  Removed from exports - migration complete.
 */
// export { useAttendanceManagement } from './useAttendanceManagement'; // REMOVED

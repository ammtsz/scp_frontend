/**
 * AttendanceManagement hooks barrel export
 * 
 * This centralizes all hooks related to attendance management.
 * NEW: Service-layer based hooks for better organization.
 */

// ===== NEW ORGANIZED HOOKS =====
// These hooks use the service layer for business logic

/**
 * useAttendanceData Hook
 * 
 * Centralized hook for managing attendance data operations.
 * Replaces scattered data logic from specialized hooks.
 * 
 * Features:
 * - Attendance data fetching and state management
 * - Context integration with AttendancesContext
 * - Error handling and loading states
 * - Data transformation and validation
 * 
 * This hook provides:
 * - `attendancesByDate`: Organized attendance data by date
 * - `isLoading`: Loading state for async operations
 * - `error`: Error state for failed operations
 * - `refreshAttendances`: Function to refresh data
 * 
 * Dependencies:
 * - AttendancesContext for global state
 * - Backend API through attendance services
 * - Date utilities for data organization
 * 
 * Migration Note: This hook is part of the specialized hooks architecture
 * that replaced the legacy monolithic hook approach for better maintainability.
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

// ===== MIGRATION COMPLETE =====
// The monolithic useAttendanceManagement hook (609 lines) has been successfully
// replaced with the specialized hooks architecture above. This provides:
// ✅ Better separation of concerns  ✅ Improved testability
// ✅ Enhanced maintainability      ✅ Service layer integration

/**
 * AttendanceManagement Module - Main Export
 * 
 * This module has been reorganized with a service layer architecture.
 * Import patterns:
 * 
 * // For business logic (can be used in non-React code)
 * import { AttendanceService, PatientService, TreatmentService } from './services';
 * 
 * // For React hooks (data management, forms, workflows)  
 * import { useAttendanceData, useAttendanceForm, useTreatmentWorkflow } from './hooks';
 * 
 * // For UI components
 * import { AttendanceColumn, AttendanceCard } from './components';
 */

// Service layer - Business logic without React dependencies
export * from './services';

// Hooks layer - React state management using services
export * from './hooks';

// Component layer - UI components using hooks
export { default as AttendanceColumn } from './components/AttendanceColumn';
export { default as AttendanceCard } from './components/Cards/AttendanceCard';

// Types
export * from './types';

// Main component - default export
export { default } from './AttendanceManagement';

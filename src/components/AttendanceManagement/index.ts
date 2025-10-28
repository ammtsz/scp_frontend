/**
 * AttendanceManagement Module - Main Export
 * 
 * This module has been refactored to use React Query hooks directly.
 * Import patterns:
 * 
 * // For React hooks (data management, forms, workflows)  
 * import { useAttendanceData, useAttendanceForm, useTreatmentWorkflow } from './hooks';
 * 
 * // For UI components
 * import { AttendanceColumn, AttendanceCard } from './components';
 * 
 * // For utilities (validation, calculations)
 * import { validatePatientData, calculateAge } from '@/utils/patientUtils';
 */

// Hooks layer - React state management using services
export * from './hooks';

// Component layer - UI components using hooks
export { default as AttendanceColumn } from './components/AttendanceColumn';
export { default as AttendanceCard } from './components/AttendanceCards/AttendanceCard';

// Types
export * from './types';

// Main component - default export
export { default } from './AttendanceManagement';

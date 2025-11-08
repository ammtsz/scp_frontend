/**
 * Modals Directory Index
 * 
 * Centralized exports for all modal components to ensure reliable imports
 */

export { default as ModalRegistry } from './ModalRegistry';
export { default as CancellationModal } from './CancellationModal';
export { default as EndOfDayModal } from './EndOfDayModal';
export { default as MultiSectionModal } from './MultiSectionModal';
export { default as NewPatientCheckInModal } from './NewPatientCheckInModal';
export { default as PostAttendanceModal } from './PostAttendanceModal';
export { default as PostTreatmentModal } from './PostTreatmentModal';

// Re-export types and utilities
export { getRegisteredModals } from './ModalRegistry';
export type { ModalRegistryEntry } from './ModalRegistry';
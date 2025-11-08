import React from "react";

const LazyCancellationModal = React.lazy(() => import("./CancellationModal"));
const LazyMultiSectionModal = React.lazy(() => import("./MultiSectionModal"));
const LazyNewPatientCheckInModal = React.lazy(
  () => import("./NewPatientCheckInModal")
);
const LazyPostAttendanceModal = React.lazy(
  () => import("./PostAttendanceModal")
);
const LazyEndOfDayModal = React.lazy(() => import("./EndOfDayModal"));
const LazyPostTreatmentModal = React.lazy(() => import("./PostTreatmentModal"));

/**
 * Modal Registry - Single component that renders all Zustand-managed modals
 *
 * Benefits:
 * - Zero prop drilling
 * - Single import in AttendanceManagement
 * - Easy to add new modals (just add to this registry)
 * - Automatic lazy loading and performance optimization
 * - Centralized modal management
 */

const MODAL_REGISTRY = [
  {
    name: "cancellation",
    component: LazyCancellationModal,
    description: "Handles attendance cancellation with reason input",
  },
  {
    name: "multiSection",
    component: LazyMultiSectionModal,
    description: "Handles drag-drop operations affecting multiple sections",
  },
  {
    name: "newPatientCheckIn",
    component: LazyNewPatientCheckInModal,
    description: "New patient registration and check-in workflow",
  },
  {
    name: "postAttendance",
    component: LazyPostAttendanceModal,
    description: "Spiritual treatment form for completed attendances",
  },
  {
    name: "endOfDay",
    component: LazyEndOfDayModal,
    description: "End of day finalization and absence justification",
  },
  {
    name: "postTreatment",
    component: LazyPostTreatmentModal,
    description: "Modal for recording post-treatment details",
  },
];

/**
 * ModalRegistry Component
 *
 * Automatically renders all registered modals. Each modal manages its own
 * visibility through Zustand store state. No props needed!
 */
const ModalRegistry: React.FC = () => {
  return (
    <>
      {MODAL_REGISTRY.map(({ name, component: ModalComponent }) => (
        <ModalComponent key={name} />
      ))}
    </>
  );
};

/**
 * Helper function to get modal information for debugging
 */
export const getRegisteredModals = () => {
  return MODAL_REGISTRY.map(({ name, description }) => ({
    name,
    description,
  }));
};

/**
 * Type for adding new modals to registry
 */
export type ModalRegistryEntry = {
  name: string;
  component: React.ComponentType;
  description: string;
};

// Export both named and default for compatibility
export { ModalRegistry };
export default ModalRegistry;

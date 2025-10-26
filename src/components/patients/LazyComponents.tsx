import React from "react";
import LoadingFallback from "@/components/common/LoadingFallback";

// Lazy load patient detail components for code splitting
export const LazyHeaderCard = React.lazy(() =>
  import("@/components/patients/HeaderCard").then((module) => ({
    default: module.HeaderCard,
  }))
);

export const LazyCurrentTreatmentCard = React.lazy(() =>
  import("@/components/patients/CurrentTreatmentCard").then((module) => ({
    default: module.CurrentTreatmentCard,
  }))
);

export const LazyAttendanceHistoryCard = React.lazy(() =>
  import("@/components/patients/AttendanceHistoryCard").then((module) => ({
    default: module.AttendanceHistoryCard,
  }))
);

export const LazyFutureAppointmentsCard = React.lazy(() =>
  import("@/components/patients/FutureAppointmentsCard").then((module) => ({
    default: module.FutureAppointmentsCard,
  }))
);

export const LazyPatientNotesCard = React.lazy(() =>
  import("@/components/patients/PatientNotesCard").then((module) => ({
    default: module.PatientNotesCard,
  }))
);

export const LazyPatientStatusOverview = React.lazy(() =>
  import("@/components/patients/TreatmentStatusBadge").then((module) => ({
    default: module.PatientStatusOverview,
  }))
);

// Reusable Suspense wrapper with patient-specific loading state
interface LazyComponentWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function LazyComponentWrapper({
  children,
  fallback = (
    <LoadingFallback size="medium" message="Carregando componente..." />
  ),
}: LazyComponentWrapperProps) {
  return <React.Suspense fallback={fallback}>{children}</React.Suspense>;
}

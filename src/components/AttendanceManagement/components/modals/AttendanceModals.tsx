import React, { lazy, Suspense } from "react";
import ConfirmModal from "@/components/common/ConfirmModal/index";
import LoadingFallback from "@/components/common/LoadingFallback";

// Lazy load heavy modal components for better bundle optimization
const PatientEditModal = lazy(
  () => import("@/components/PatientForm/PatientEditModal")
);
const SpiritualTreatmentFormTabbed = lazy(() =>
  import("../Forms/PostAttendanceForms").then((module) => ({
    default: module.SpiritualTreatmentFormTabbed,
  }))
);
const EndOfDayModal = lazy(() => import("../EndOfDay/EndOfDayContainer"));
const NewPatientCheckInModal = lazy(() => import("./NewPatientCheckInModal"));
import type {
  SpiritualTreatmentData,
  TreatmentStatus,
} from "../Forms/PostAttendanceForms";
import type { Patient } from "@/types/types";
import { IAttendanceStatusDetailWithType } from "../../utils/attendanceDataUtils";

interface AttendanceModalsProps {
  // Confirm modals
  confirmOpen: boolean;
  multiSectionModalOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  onMultiSectionConfirm: () => void;
  onMultiSectionCancel: () => void;

  // Patient edit modal
  editPatientModalOpen: boolean;
  patientToEdit: { id: string; name: string } | null;
  onEditPatientCancel: () => void;
  onEditPatientSuccess: () => void;

  // New patient check-in
  patientToCheckIn: Patient | null;
  attendanceId?: number;
  onCloseNewPatientCheckIn: () => void;
  onNewPatientSuccess: (updatedPatient: Patient) => void;

  // Treatment workflow modals - Removed unused spiritual consultation

  // Treatment form modal (when completing attendance)
  treatmentFormOpen: boolean;
  selectedAttendanceForTreatment: {
    id: number;
    patientId: number;
    patientName: string;
    attendanceType: string;
    currentTreatmentStatus: TreatmentStatus;
    currentStartDate?: Date;
    currentReturnWeeks?: number;
    isFirstAttendance: boolean;
  } | null;
  onTreatmentFormSubmit: (
    data: SpiritualTreatmentData
  ) => Promise<{ treatmentRecordId: number }>;
  onTreatmentFormCancel: () => void;

  // End of day modal
  endOfDayModalOpen: boolean;
  onEndOfDayClose: () => void;
  onHandleCompletion: (attendanceId: number) => Promise<void>;
  onReschedule: (attendanceId: number) => Promise<void>;
  onEndOfDayFinalize: (
    absenceJustifications: Array<{
      patientId: number;
      patientName: string;
      attendanceType: string;
      justified: boolean;
      justification?: string;
    }>
  ) => Promise<void>;
  incompleteAttendances: IAttendanceStatusDetailWithType[];
  scheduledAbsences: IAttendanceStatusDetailWithType[];
  completedAttendances: IAttendanceStatusDetailWithType[];
  selectedDate: string;
}

export const AttendanceModals: React.FC<AttendanceModalsProps> = ({
  confirmOpen,
  multiSectionModalOpen,
  onConfirm,
  onCancel,
  onMultiSectionConfirm,
  onMultiSectionCancel,
  editPatientModalOpen,
  patientToEdit,
  onEditPatientCancel,
  onEditPatientSuccess,
  // TODO: These props are for the future NewPatientCheckInForm component

  patientToCheckIn,
  attendanceId,

  onCloseNewPatientCheckIn,

  onNewPatientSuccess,
  treatmentFormOpen,
  selectedAttendanceForTreatment,
  onTreatmentFormSubmit,
  onTreatmentFormCancel,
  endOfDayModalOpen,
  onEndOfDayClose,
  onHandleCompletion,
  onReschedule,
  onEndOfDayFinalize,
  incompleteAttendances,
  scheduledAbsences,
  completedAttendances,
  selectedDate,
}) => {
  return (
    <>
      {/* Confirm Modals */}
      <ConfirmModal
        open={confirmOpen}
        message="Tem certeza que deseja mover este atendimento para uma etapa anterior?"
        onConfirm={onConfirm}
        onCancel={onCancel}
      />
      <ConfirmModal
        open={multiSectionModalOpen}
        message="Este paciente está agendado nas duas consultas. Deseja mover para 'Sala de Espera' em ambas?"
        confirmLabel="Mover em ambas"
        cancelLabel="Apenas nesta seção"
        onConfirm={onMultiSectionConfirm}
        onCancel={onMultiSectionCancel}
      />

      {/* Patient Edit Modal */}
      {patientToEdit && (
        <Suspense
          fallback={
            <LoadingFallback
              message="Carregando edição do paciente..."
              size="small"
            />
          }
        >
          <PatientEditModal
            isOpen={editPatientModalOpen}
            onClose={onEditPatientCancel}
            patientId={patientToEdit.id}
            patientName={patientToEdit.name}
            onSuccess={onEditPatientSuccess}
          />
        </Suspense>
      )}

      {/* New Patient Check-in for drag-and-drop of new patients */}
      {patientToCheckIn && (
        <Suspense
          fallback={
            <LoadingFallback message="Carregando check-in..." size="small" />
          }
        >
          <NewPatientCheckInModal
            patient={patientToCheckIn}
            attendanceId={attendanceId}
            isOpen={true}
            onClose={onCloseNewPatientCheckIn}
            onSuccess={onNewPatientSuccess}
          />
        </Suspense>
      )}

      {/* Treatment Form Modal (when completing attendance) */}
      {treatmentFormOpen && selectedAttendanceForTreatment && (
        <Suspense
          fallback={
            <LoadingFallback
              message="Carregando formulário de tratamento..."
              size="small"
            />
          }
        >
          <SpiritualTreatmentFormTabbed
            attendanceId={selectedAttendanceForTreatment.id}
            patientId={selectedAttendanceForTreatment.patientId}
            patientName={selectedAttendanceForTreatment.patientName}
            currentTreatmentStatus={
              selectedAttendanceForTreatment.currentTreatmentStatus
            }
            onSubmit={onTreatmentFormSubmit}
            onCancel={onTreatmentFormCancel}
          />
        </Suspense>
      )}

      <Suspense
        fallback={
          <LoadingFallback
            message="Carregando finalizador do dia..."
            size="small"
          />
        }
      >
        <EndOfDayModal
          isOpen={endOfDayModalOpen}
          onClose={onEndOfDayClose}
          onSubmitEndOfDay={async (absenceJustifications) => {
            await onEndOfDayFinalize(
              absenceJustifications.map((item) => ({
                patientId: item.patientId,
                patientName: item.patientName,
                attendanceType: item.attendanceType,
                justified: item.justified ?? false,
                justification: item.justification,
              }))
            );
          }}
          incompleteAttendances={incompleteAttendances}
          scheduledAbsences={scheduledAbsences}
          completedAttendances={completedAttendances}
          selectedDate={selectedDate}
          onHandleCompletion={onHandleCompletion}
          onReschedule={onReschedule}
        />
      </Suspense>
    </>
  );
};

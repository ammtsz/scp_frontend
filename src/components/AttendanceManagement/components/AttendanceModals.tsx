import React from "react";
import ConfirmModal from "@/components/ConfirmModal/index";
import PatientEditModal from "@/components/PatientForm/PatientEditModal";
import SpiritualConsultationForm from "./TreatmentForms/SpiritualConsultationForm";
import EndOfDayModal from "./endOfDay/EndOfDayModal";
import type { SpiritualConsultationData } from "./TreatmentForms/SpiritualConsultationForm";
import type { IAttendanceStatusDetail, IPatient } from "@/types/globals";
import { IAttendanceStatusDetailWithType } from "../utils/attendanceDataUtils";

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
  patientToCheckIn: IPatient | null;
  onCloseNewPatientCheckIn: () => void;
  onNewPatientSuccess: (updatedPatient: IPatient) => void;

  // Treatment workflow modals
  spiritualConsultationOpen: boolean;
  selectedAttendanceForConsultation: { id: number; patientName: string } | null;
  onSpiritualConsultationSubmit: (
    data: SpiritualConsultationData
  ) => Promise<void>;
  onSpiritualConsultationCancel: () => void;

  // End of day modal
  endOfDayModalOpen: boolean;
  onEndOfDayClose: () => void;
  onHandleCompletion: (attendanceId: number) => Promise<void>;
  onReschedule: (attendanceId: number) => Promise<void>;
  onEndOfDayFinalize: (data: {
    incompleteAttendances: IAttendanceStatusDetail[];
    scheduledAbsences: IAttendanceStatusDetail[];
    absenceJustifications: Array<{
      patientId: number;
      patientName: string;
      justified: boolean;
      notes: string;
    }>;
  }) => Promise<void>;
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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  patientToCheckIn,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onCloseNewPatientCheckIn,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onNewPatientSuccess,
  spiritualConsultationOpen,
  selectedAttendanceForConsultation,
  onSpiritualConsultationSubmit,
  onSpiritualConsultationCancel,
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
        <PatientEditModal
          isOpen={editPatientModalOpen}
          onClose={onEditPatientCancel}
          patientId={patientToEdit.id}
          patientName={patientToEdit.name}
          onSuccess={onEditPatientSuccess}
        />
      )}

      {/* TODO: New Patient Check-in - Need to recreate component for checking in existing patients */}
      {/* 
      {patientToCheckIn && (
        <PatientWalkInForm
          patient={patientToCheckIn}
          isOpen={true}
          onClose={onCloseNewPatientCheckIn}
          onSuccess={onNewPatientSuccess}
        />
      )}
      */}

      {/* Treatment Workflow Modals */}
      {spiritualConsultationOpen && selectedAttendanceForConsultation && (
        <SpiritualConsultationForm
          attendanceId={selectedAttendanceForConsultation.id}
          patientName={selectedAttendanceForConsultation.patientName}
          onSubmit={onSpiritualConsultationSubmit}
          onCancel={onSpiritualConsultationCancel}
          isLoading={false}
        />
      )}

      <EndOfDayModal
        isOpen={endOfDayModalOpen}
        onClose={onEndOfDayClose}
        onSubmitEndOfDay={async (absenceJustifications) => {
          await onEndOfDayFinalize({
            incompleteAttendances,
            scheduledAbsences,
            absenceJustifications: absenceJustifications.map((item) => ({
              patientId: item.patientId,
              patientName: item.patientName,
              justified: item.justified ?? false,
              notes: item.justification ?? "",
            })),
          });
        }}
        incompleteAttendances={incompleteAttendances}
        scheduledAbsences={scheduledAbsences}
        completedAttendances={completedAttendances}
        selectedDate={selectedDate}
        onHandleCompletion={onHandleCompletion}
        onReschedule={onReschedule}
      />
    </>
  );
};

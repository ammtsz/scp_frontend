import React from "react";
import BaseModal from "@/components/common/BaseModal";
import { SpiritualTreatmentForm } from "./TreatmentForms";
import type { SpiritualTreatmentData, TreatmentStatus } from "./TreatmentForms";

interface TreatmentFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  attendanceId: number;
  patientId: number;
  patientName: string;
  currentTreatmentStatus: TreatmentStatus;
  onSubmit: (
    data: SpiritualTreatmentData
  ) => Promise<{ treatmentRecordId: number }>;
  isLoading?: boolean;
}

const TreatmentFormModal: React.FC<TreatmentFormModalProps> = ({
  isOpen,
  onClose,
  attendanceId,
  patientId,
  patientName,
  currentTreatmentStatus,
  onSubmit,
  isLoading = false,
}) => {
  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Pós consulta"
      subtitle="Complete o formulário com os detalhes do tratamento espiritual"
      maxWidth="2xl"
    >
      <div className="max-h-[80vh] overflow-y-auto">
        <SpiritualTreatmentForm
          attendanceId={attendanceId}
          patientId={patientId}
          patientName={patientName}
          currentTreatmentStatus={currentTreatmentStatus}
          onSubmit={onSubmit}
          onCancel={onClose}
          isLoading={isLoading}
        />
      </div>
    </BaseModal>
  );
};

export default TreatmentFormModal;

import { useState, useCallback } from "react";
import { createTreatmentRecord } from "@/api/treatment-records";
import { updatePatient } from "@/api/patients";
import type { CreateTreatmentRecordRequest, TreatmentStatus } from "@/api/types";
import type { SpiritualTreatmentData } from "../components/Forms/PostAttendanceForms";

export interface ModalManagementState {
  // Patient edit modal
  editPatientModalOpen: boolean;
  patientToEdit: { id: string; name: string } | null;
  
  // Treatment form modal
  treatmentFormOpen: boolean;
  selectedAttendanceForTreatment: {
    id: number;
    patientId: number;
    patientName: string;
    attendanceType: string;
    currentTreatmentStatus: "N" | "T" | "A" | "F";
    currentStartDate?: Date;
    currentReturnWeeks?: number;
    isFirstAttendance: boolean;
  } | null;
}

interface UseModalManagementProps {
  refreshData?: () => void;
}

export const useModalManagement = ({
  refreshData,
}: UseModalManagementProps = {}) => {
  // Patient edit modal state
  const [editPatientModalOpen, setEditPatientModalOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // Treatment form modal state (for when completing attendance)
  const [treatmentFormOpen, setTreatmentFormOpen] = useState(false);
  const [selectedAttendanceForTreatment, setSelectedAttendanceForTreatment] =
    useState<{
      id: number;
      patientId: number;
      patientName: string;
      attendanceType: string;
      currentTreatmentStatus: "N" | "T" | "A" | "F";
      currentStartDate?: Date;
      currentReturnWeeks?: number;
      isFirstAttendance: boolean;
    } | null>(null);

  // Patient edit modal handlers
  const handleEditPatientCancel = useCallback(() => {
    setEditPatientModalOpen(false);
    setPatientToEdit(null);
  }, []);

  const handleEditPatientSuccess = useCallback(() => {
    setEditPatientModalOpen(false);
    setPatientToEdit(null);
    // Refresh current date to show updated data
    refreshData?.();
  }, [refreshData]);

  const openEditPatientModal = useCallback(
    (patient: { id: string; name: string }) => {
      setPatientToEdit(patient);
      setEditPatientModalOpen(true);
    },
    []
  );

  // Treatment form modal handlers
  const handleTreatmentFormCancel = useCallback(() => {
    setTreatmentFormOpen(false);
    setSelectedAttendanceForTreatment(null);
  }, []);

  const openTreatmentFormModal = useCallback(
    (attendanceDetails: {
      id: number;
      patientId: number;
      patientName: string;
      attendanceType: string;
      currentTreatmentStatus: "N" | "T" | "A" | "F";
      currentStartDate?: Date;
      currentReturnWeeks?: number;
      isFirstAttendance: boolean;
    }) => {
      setSelectedAttendanceForTreatment(attendanceDetails);
      setTreatmentFormOpen(true);
    },
    []
  );

  const handleTreatmentFormSubmit = useCallback(
    async (data: SpiritualTreatmentData): Promise<{ treatmentRecordId: number }> => {
      if (!selectedAttendanceForTreatment) {
        throw new Error("No attendance selected for treatment");
      }

      try {
        // Create the treatment record request
        const treatmentRequest: CreateTreatmentRecordRequest = {
          attendance_id: selectedAttendanceForTreatment.id,
          main_complaint: data.mainComplaint,
          treatment_status: data.treatmentStatus, // Used for patient update, ignored by backend
          food: data.food,
          water: data.water,
          ointments: data.ointments,
          spiritual_treatment: true, // This is always true for spiritual consultations
          return_in_weeks: data.returnWeeks,
          notes: data.notes,
          // Legacy lightbath/rod flags for backward compatibility
          light_bath: data.recommendations.lightBath ? true : false,
          light_bath_color:
            data.recommendations.lightBath?.treatments?.[0]?.color,
          rod: data.recommendations.rod ? true : false,
        };

        // Create the treatment record
        const response = await createTreatmentRecord(treatmentRequest);

        if (!response.success || !response.value) {
          throw new Error(response.error || "Failed to create treatment record");
        }

        // Update patient treatment status and discharge date if applicable
        if (data.treatmentStatus === 'A') {
          const patientUpdateResponse = await updatePatient(selectedAttendanceForTreatment.patientId.toString(), {
            treatment_status: data.treatmentStatus as TreatmentStatus
          });
          
          if (!patientUpdateResponse.success) {
            console.error("Failed to update patient treatment status:", patientUpdateResponse.error);
            // Don't throw error here as the treatment record was created successfully
          }
        }

        // Close modal and refresh data
        setTreatmentFormOpen(false);
        setSelectedAttendanceForTreatment(null);
        refreshData?.();

        // The backend returns { record: { id: 15, ... } }, so we access record.id
        const treatmentRecordId = response.value.record.id;
        return { treatmentRecordId };
      } catch (error) {
        console.error("Error creating treatment record:", error);
        throw error;
      }
    },
    [selectedAttendanceForTreatment, refreshData]
  );

  return {
    // State
    editPatientModalOpen,
    patientToEdit,
    treatmentFormOpen,
    selectedAttendanceForTreatment,

    // Patient edit modal handlers
    handleEditPatientCancel,
    handleEditPatientSuccess,
    openEditPatientModal,

    // Treatment form modal handlers
    handleTreatmentFormCancel,
    handleTreatmentFormSubmit,
    openTreatmentFormModal,
  };
};

export default useModalManagement;

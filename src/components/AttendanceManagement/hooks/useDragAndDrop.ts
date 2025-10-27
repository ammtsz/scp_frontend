import { useState, useCallback } from "react";
import { useAttendances } from "@/contexts/AttendancesContext";
import { usePatients } from "@/hooks/usePatientQueries";
import { updateAttendanceStatus } from "@/api/attendanceSync";
import { sortPatientsByPriority } from "@/utils/businessRules";

import type {
  AttendanceProgression,
  AttendanceType,
  AttendanceStatusDetail,
  PatientBasic,
} from "@/types/types";
import type { IDraggedItem } from "../types";

interface UseDragAndDropProps {
  onNewPatientDetected?: (patient: PatientBasic, attendanceId?: number) => void;
  onTreatmentFormOpen?: (attendanceDetails: {
    id: number;
    patientId: number;
    patientName: string;
    attendanceType: string;
    currentTreatmentStatus: "N" | "T" | "A" | "F";
    currentStartDate?: Date;
    currentReturnWeeks?: number;
    isFirstAttendance: boolean;
  }) => void;
  onTreatmentCompletionOpen?: (attendanceDetails: {
    attendanceId: number;
    patientId: number;
    patientName: string;
    attendanceType: AttendanceType;
    onComplete: (success: boolean) => void;
  }) => void;
}

export const useDragAndDrop = ({
  onNewPatientDetected,
  onTreatmentFormOpen,
  onTreatmentCompletionOpen,
}: UseDragAndDropProps = {}) => {
  const { data: patients = [] } = usePatients();
  const { attendancesByDate, setAttendancesByDate } = useAttendances();

  // Drag and drop state
  const [dragged, setDragged] = useState<IDraggedItem | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDrop, setPendingDrop] = useState<{
    toType: AttendanceType;
    toStatus: AttendanceProgression;
  } | null>(null);
  const [multiSectionModalOpen, setMultiSectionModalOpen] = useState(false);
  const [multiSectionPending, setMultiSectionPending] = useState<{
    patientId: number;
    fromStatus: AttendanceProgression;
    toStatus: AttendanceProgression;
    draggedType: AttendanceType;
  } | null>(null);

  // Helper function to find patient by ID
  const findPatient = useCallback(
    (
      type: AttendanceType,
      status: AttendanceProgression,
      patientId: number
    ): AttendanceStatusDetail | undefined => {
      return attendancesByDate?.[type]?.[status]?.find(
        (p) => p.patientId === patientId
      );
    },
    [attendancesByDate]
  );

  // Helper function to update patient timestamps
  const updatePatientTimestamps = useCallback(
    (
      patient: AttendanceStatusDetail,
      status: AttendanceProgression
    ): AttendanceStatusDetail => {
      const updates: Partial<AttendanceStatusDetail> = {};
      if (status === "checkedIn") updates.checkedInTime = new Date().toTimeString().split(' ')[0];
      if (status === "onGoing") updates.onGoingTime = new Date().toTimeString().split(' ')[0];
      if (status === "completed") {
        updates.completedTime = new Date().toTimeString().split(' ')[0];
        
        // Route to correct modal based on attendance type
        const fullPatient = patients.find((p) => p.name === patient.name);
        if (fullPatient && patient.attendanceId && patient.patientId) {
          const attendanceType = dragged?.type;
          
          if (attendanceType === "spiritual") {
            // Spiritual consultations should open PostAttendanceModal for recommendations
            const isFirstAttendance = fullPatient.status === "N";
            onTreatmentFormOpen?.({
              id: patient.attendanceId,
              patientId: patient.patientId,
              patientName: patient.name,
              attendanceType,
              currentTreatmentStatus: "N",
              currentStartDate: undefined,
              currentReturnWeeks: undefined,
              isFirstAttendance,
            });
          } else if (attendanceType === "lightBath" || attendanceType === "rod") {
            // Light Bath and Rod treatments should open PostTreatmentModal for session completion
            onTreatmentCompletionOpen?.({
              attendanceId: patient.attendanceId,
              patientId: patient.patientId,
              patientName: patient.name,
              attendanceType,
              onComplete: (success: boolean) => {
                // Handle completion callback if needed
                console.log(`Treatment completion ${success ? 'successful' : 'failed'}:`, patient.name);
              }
            });
          }
        }
      }
      return { ...patient, ...updates };
    },
    [patients, dragged, onTreatmentFormOpen, onTreatmentCompletionOpen]
  );

  // Get patients for a specific type and status
  const getPatients = useCallback(
    (
      type: AttendanceType,
      status: AttendanceProgression
    ): AttendanceStatusDetail[] => {
      if (!attendancesByDate) return [];

      const patients = attendancesByDate[type][status] || [];

      // Sort checkedIn patients by priority using business rules
      if (status === "checkedIn") {
        return sortPatientsByPriority(patients) as AttendanceStatusDetail[];
      }

      return patients;
    },
    [attendancesByDate]
  );

  // Drag and drop handlers
  const handleDragStart = useCallback(
    (
      type: AttendanceType,
      idx: number,
      status: AttendanceProgression,
      patientId?: number
    ) => {
      let patient;

      if (patientId) {
        patient = findPatient(type, status, patientId);
      } else {
        // Fallback to index-based lookup
        const patients = getPatients(type, status);
        patient = patients[idx];
      }

      if (!patient?.patientId) {
        console.error(
          "Patient not found at index",
          idx,
          "or patientId",
          patientId,
          "or patient missing patientId"
        );
        return;
      }

      // Check if this patient has treatments in both lightBath and rod (combined treatment)
      const lightBathPatient = findPatient("lightBath", status, patient.patientId);
      const rodPatient = findPatient("rod", status, patient.patientId);
      const isCombinedTreatment = !!(lightBathPatient && rodPatient);
      
      let treatmentTypes: AttendanceType[] = [type];
      if (isCombinedTreatment) {
        treatmentTypes = ["lightBath", "rod"];
      }

      setDragged({ 
        type, 
        status, 
        idx, 
        patientId: patient.patientId,
        isCombinedTreatment,
        treatmentTypes
      });
    },
    [findPatient, getPatients]
  );

  const handleDragEnd = useCallback(() => {
    setDragged(null);
  }, []);

  // Helper function for performing the actual move
  const performMove = useCallback(
    async (toType: AttendanceType, toStatus: AttendanceProgression) => {
      if (!dragged || !attendancesByDate || !setAttendancesByDate) return;

      // For combined treatments, we need to move both treatment types atomically
      const treatmentTypesToMove = dragged.isCombinedTreatment && dragged.treatmentTypes 
        ? dragged.treatmentTypes 
        : [dragged.type];

      // Create immutable update by spreading arrays
      let newAttendancesByDate = { ...attendancesByDate };

      // Process each treatment type that needs to be moved
      for (const treatmentType of treatmentTypesToMove) {
        // Find patient for this specific treatment type
        const patient = findPatient(treatmentType, dragged.status, dragged.patientId);
        if (!patient) continue; // Skip if patient not found for this treatment type

        // Sync with backend if attendanceId is available
        if (patient.attendanceId) {
          const result = await updateAttendanceStatus(patient.attendanceId, toStatus);
          if (!result.success) {
            console.warn(`Backend sync failed for ${treatmentType}, continuing with local update`);
          }
        }

        // Update source type (remove patient)
        newAttendancesByDate = {
          ...newAttendancesByDate,
          [treatmentType]: {
            ...newAttendancesByDate[treatmentType],
            [dragged.status]: newAttendancesByDate[treatmentType][
              dragged.status
            ].filter((p) => p.patientId !== dragged.patientId),
          },
        };

        // For combined treatments, we need to use the correct destination type for each treatment
        const destinationType = dragged.isCombinedTreatment ? treatmentType : toType;

        // Update destination type (add patient)
        newAttendancesByDate = {
          ...newAttendancesByDate,
          [destinationType]: {
            ...newAttendancesByDate[destinationType],
            [toStatus]: [
              ...newAttendancesByDate[destinationType][toStatus],
              updatePatientTimestamps(patient, toStatus),
            ],
          },
        };
      }

      // Update state with new object
      setAttendancesByDate(newAttendancesByDate);
    },
    [
      dragged,
      attendancesByDate,
      setAttendancesByDate,
      findPatient,
      updatePatientTimestamps,
    ]
  );

  const handleDropWithConfirm = useCallback(
    (toType: AttendanceType, toStatus: AttendanceProgression) => {
      if (!dragged || !attendancesByDate) return;

      // Find patient by ID using helper function
      const patient = findPatient(dragged.type, dragged.status, dragged.patientId);
      if (!patient) return; // Patient not found

      // For combined treatments, allow dropping on either lightBath or rod sections
      // but prevent moves to spiritual section
      if (dragged.isCombinedTreatment) {
        if (toType === "spiritual") {
          setDragged(null);
          return;
        }
        // Combined treatments can be dropped on lightBath or rod sections
      } else {
        // Prevent moves between different consultation types for single treatments
        if (dragged.type !== toType) {
          setDragged(null);
          return;
        }
      }

      // Check if this is a new patient (status 'N') being moved to 'checkedIn'
      if (toStatus === "checkedIn") {
        const patientData = patients.find(
          (p) => p.id === patient.patientId?.toString()
        );
        if (patientData?.status === "N") {
          // This is a new patient - trigger new patient check-in modal
          onNewPatientDetected?.(patientData, patient.attendanceId);
          setDragged(null);
          return;
        }
      }

      // TODO: update to rod and combined types or remove feature
      // Check if patient is scheduled in both consultation types
      const isInBothTypes =
        findPatient("spiritual", "scheduled", dragged.patientId) &&
        findPatient("lightBath", "scheduled", dragged.patientId);

      // If patient is in both types and we're moving from scheduled to checkedIn, show multi-section modal
      if (
        isInBothTypes &&
        dragged.status === "scheduled" &&
        toStatus === "checkedIn"
      ) {
        setMultiSectionPending({
          patientId: dragged.patientId,
          fromStatus: dragged.status,
          toStatus: toStatus,
          draggedType: dragged.type,
        });
        setMultiSectionModalOpen(true);

        return;
      }

      // For combined treatments or same-type moves (not involving multi-type scenarios)
      const isValidMove = dragged.isCombinedTreatment 
        ? (toType === "lightBath" || toType === "rod") && dragged.status !== toStatus
        : dragged.type === toType && dragged.status !== toStatus;

      if (isValidMove) {
        // Perform the move - modal logic is handled in updatePatientTimestamps
        performMove(toType, toStatus);
        setDragged(null);
        return;
      }

      // Same type and same status, or invalid move - no action needed
      setDragged(null);
    },
    [
      dragged,
      attendancesByDate,
      findPatient,
      patients,
      onNewPatientDetected,
      performMove,
    ]
  );

  const handleConfirm = useCallback(async () => {
    if (!dragged || !pendingDrop) return;

    // Use the helper function to perform the move
    await performMove(pendingDrop.toType, pendingDrop.toStatus);

    // Reset state
    setConfirmOpen(false);
    setPendingDrop(null);
    setDragged(null);
  }, [dragged, pendingDrop, performMove]);

  const handleCancel = useCallback(() => {
    setConfirmOpen(false);
    setPendingDrop(null);
    setDragged(null);
  }, []);

  const handleMultiSectionConfirm = useCallback(async () => {
    if (!multiSectionPending || !attendancesByDate || !setAttendancesByDate)
      return;

    // Find patient using helper function
    const patient = findPatient(
      multiSectionPending.draggedType,
      multiSectionPending.fromStatus,
      multiSectionPending.patientId
    );
    if (!patient) return; // Patient not found

    // Sync with backend for all types if attendanceIds are available
    const syncPromises = (["spiritual", "lightBath", "rod"] as AttendanceType[])
      .map((type) =>
        findPatient(type, "scheduled", multiSectionPending.patientId)
      )
      .filter((p) => p?.attendanceId)
      .map((p) => updateAttendanceStatus(p!.attendanceId!, "checkedIn"));

    // Wait for all backend syncs to complete
    if (syncPromises.length > 0) {
      try {
        await Promise.all(syncPromises);
      } catch {
        console.warn("Some backend syncs failed, continuing with local update");
      }
    }

    // Create immutable update for all consultation types
    let newAttendancesByDate = { ...attendancesByDate };

    (["spiritual", "lightBath", "rod"] as AttendanceType[]).forEach((type) => {
      const patientToMove = findPatient(
        type,
        "scheduled",
        multiSectionPending.patientId
      );

      if (patientToMove) {
        newAttendancesByDate = {
          ...newAttendancesByDate,
          [type]: {
            ...newAttendancesByDate[type],
            scheduled: newAttendancesByDate[type].scheduled.filter(
              (p) => p.patientId !== multiSectionPending.patientId
            ),
            checkedIn: [
              ...newAttendancesByDate[type].checkedIn,
              updatePatientTimestamps(patientToMove, "checkedIn"),
            ],
          },
        };
      }
    });

    // Update state with new object
    setAttendancesByDate(newAttendancesByDate);

    // Reset state
    setMultiSectionModalOpen(false);
    setMultiSectionPending(null);
    setDragged(null);
  }, [
    multiSectionPending,
    attendancesByDate,
    setAttendancesByDate,
    findPatient,
    updatePatientTimestamps,
  ]);

  const handleMultiSectionCancel = useCallback(async () => {
    if (!multiSectionPending || !dragged) return;

    // Only move in the dragged type, not in both types
    await performMove(dragged.type, multiSectionPending.toStatus);

    // Reset state
    setMultiSectionModalOpen(false);
    setMultiSectionPending(null);
    setDragged(null);
  }, [multiSectionPending, dragged, performMove]);

  return {
    // State
    dragged,
    confirmOpen,
    multiSectionModalOpen,

    // Handlers
    handleDragStart,
    handleDragEnd,
    handleDropWithConfirm,
    handleConfirm,
    handleCancel,
    handleMultiSectionConfirm,
    handleMultiSectionCancel,

    // Utility functions
    getPatients,
    findPatient,
  };
};

export default useDragAndDrop;

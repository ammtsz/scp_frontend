import { useState, useCallback } from "react";
import { useAttendances } from "@/contexts/AttendancesContext";
import { usePatients } from "@/contexts/PatientsContext";
import { updateAttendanceStatus } from "@/api/attendanceSync";
import { sortPatientsByPriority } from "@/utils/businessRules";
import type {
  IAttendanceProgression,
  IAttendanceType,
  IAttendanceStatusDetail,
  IPatients,
} from "@/types/globals";
import type { IDraggedItem } from "../types";

interface UseDragAndDropProps {
  onNewPatientDetected?: (patient: IPatients, attendanceId?: number) => void;
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
}

export const useDragAndDrop = ({
  onNewPatientDetected,
  onTreatmentFormOpen,
}: UseDragAndDropProps = {}) => {
  const { patients } = usePatients();
  const { attendancesByDate, setAttendancesByDate } = useAttendances();

  // Drag and drop state
  const [dragged, setDragged] = useState<IDraggedItem | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDrop, setPendingDrop] = useState<{
    toType: IAttendanceType;
    toStatus: IAttendanceProgression;
  } | null>(null);
  const [multiSectionModalOpen, setMultiSectionModalOpen] = useState(false);
  const [multiSectionPending, setMultiSectionPending] = useState<{
    patientId: number;
    fromStatus: IAttendanceProgression;
    toStatus: IAttendanceProgression;
    draggedType: IAttendanceType;
  } | null>(null);

  // Helper function to find patient by ID
  const findPatient = useCallback(
    (
      type: IAttendanceType,
      status: IAttendanceProgression,
      patientId: number
    ): IAttendanceStatusDetail | undefined => {
      return attendancesByDate?.[type]?.[status]?.find(
        (p) => p.patientId === patientId
      );
    },
    [attendancesByDate]
  );

  // Helper function to update patient timestamps
  const updatePatientTimestamps = useCallback(
    (
      patient: IAttendanceStatusDetail,
      status: IAttendanceProgression
    ): IAttendanceStatusDetail => {
      const updates: Partial<IAttendanceStatusDetail> = {};
      if (status === "checkedIn") updates.checkedInTime = new Date();
      if (status === "onGoing") updates.onGoingTime = new Date();
      if (status === "completed") {
        updates.completedTime = new Date();
        // Trigger treatment form modal when attendance is completed
        const fullPatient = patients.find((p) => p.name === patient.name);
        if (fullPatient && patient.attendanceId && patient.patientId) {
          // Get the attendance type from the dragged item or determine from data
          const attendanceType = dragged?.type || "spiritual";
          
          // Determine if this is a first attendance based on patient status
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
        }
      }
      return { ...patient, ...updates };
    },
    [patients, dragged, onTreatmentFormOpen]
  );

  // Get patients for a specific type and status
  const getPatients = useCallback(
    (
      type: IAttendanceType,
      status: IAttendanceProgression
    ): IAttendanceStatusDetail[] => {
      if (!attendancesByDate) return [];

      const patients = attendancesByDate[type][status] || [];

      // Sort checkedIn patients by priority using business rules
      if (status === "checkedIn") {
        return sortPatientsByPriority(patients) as IAttendanceStatusDetail[];
      }

      return patients;
    },
    [attendancesByDate]
  );

  // Drag and drop handlers
  const handleDragStart = useCallback(
    (
      type: IAttendanceType,
      idx: number,
      status: IAttendanceProgression,
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
      setDragged({ type, status, idx, patientId: patient.patientId });
    },
    [findPatient, getPatients]
  );

  const handleDragEnd = useCallback(() => {
    setDragged(null);
  }, []);

  // Helper function for performing the actual move
  const performMove = useCallback(
    async (toType: IAttendanceType, toStatus: IAttendanceProgression) => {
      if (!dragged || !attendancesByDate || !setAttendancesByDate) return;

      // Find patient using helper function
      const patient = findPatient(dragged.type, dragged.status, dragged.patientId);
      if (!patient) return; // Patient not found

      // Sync with backend if attendanceId is available
      if (patient.attendanceId) {
        const result = await updateAttendanceStatus(patient.attendanceId, toStatus);
        if (!result.success) {
          console.warn("Backend sync failed, continuing with local update");
        }
      }

      // Create immutable update by spreading arrays
      let newAttendancesByDate = { ...attendancesByDate };

      // Update source type (remove patient)
      newAttendancesByDate = {
        ...newAttendancesByDate,
        [dragged.type]: {
          ...newAttendancesByDate[dragged.type],
          [dragged.status]: newAttendancesByDate[dragged.type][
            dragged.status
          ].filter((p) => p.patientId !== dragged.patientId),
        },
      };

      // Update destination type (add patient)
      newAttendancesByDate = {
        ...newAttendancesByDate,
        [toType]: {
          ...newAttendancesByDate[toType],
          [toStatus]: [
            ...newAttendancesByDate[toType][toStatus],
            updatePatientTimestamps(patient, toStatus),
          ],
        },
      };

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
    (toType: IAttendanceType, toStatus: IAttendanceProgression) => {
      if (!dragged || !attendancesByDate) return;

      // Find patient by ID using helper function
      const patient = findPatient(dragged.type, dragged.status, dragged.patientId);
      if (!patient) return; // Patient not found

      // Prevent moves between different consultation types
      if (dragged.type !== toType) {
        setDragged(null);
        return;
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

      // For same type moves (not involving multi-type scenarios), perform move directly
      if (dragged.type === toType && dragged.status !== toStatus) {
        performMove(toType, toStatus);
        setDragged(null);
        return;
      }

      // Same type and same status - no action needed
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
    const syncPromises = (["spiritual", "lightBath", "rod"] as IAttendanceType[])
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

    (["spiritual", "lightBath", "rod"] as IAttendanceType[]).forEach((type) => {
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

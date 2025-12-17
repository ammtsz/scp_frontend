import { useState, useCallback } from "react";
import { useAttendanceManagement } from "@/hooks/useAttendanceManagement";
import { usePatients } from "@/hooks/usePatientQueries";
import { updateAttendanceStatus } from "@/api/attendanceSync";
import { sortPatientsByPriority } from "@/utils/businessRules";

import type {
  AttendanceProgression,
  AttendanceType,
  AttendanceStatusDetail,
} from "@/types/types";
import type { IDraggedItem } from "../types";
import { useOpenMultiSection, useOpenNewPatientCheckIn, useOpenPostAttendance, useOpenPostTreatment } from "@/stores/modalStore";

export const useDragAndDrop = () => {
  const { data: patients = [] } = usePatients();
  const { attendancesByDate, setAttendancesByDate } = useAttendanceManagement();

  // Drag and drop state
  const [dragged, setDragged] = useState<IDraggedItem | null>(null);

  const openPostAttendance = useOpenPostAttendance();
  const openPostTreatment = useOpenPostTreatment();
  const openNewPatientCheckIn = useOpenNewPatientCheckIn();
  const openMultiSection = useOpenMultiSection();

  // Helper function to find all attendances for a patient
  const findAllPatientAttendances = useCallback(
    (
      type: AttendanceType,
      status: AttendanceProgression,
      patientId: number
    ): number[] => {
      const statusAttendances =
        attendancesByDate?.[type] && status in attendancesByDate[type]
          ? (attendancesByDate[type][status as keyof typeof attendancesByDate[typeof type]] as AttendanceStatusDetail[])
          : [];
      return statusAttendances
        ?.filter((p) => p.patientId === patientId)
        ?.map((p) => p.attendanceId as number) || [];
    },
    [attendancesByDate]
  );

  // Helper function to find patient by ID
  const findPatient = useCallback(
    (
      type: AttendanceType,
      status: AttendanceProgression,
      patientId: number
    ): AttendanceStatusDetail | undefined => {
      const patient = attendancesByDate?.[type]?.[status]?.find(
        (p) => p.patientId === patientId
      );
      return patient ? {...patient, treatmentAttendanceIds: findAllPatientAttendances(type, status, patientId)} : undefined;
    },
    [attendancesByDate, findAllPatientAttendances]
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
      }
      return { ...patient, ...updates };
    },
    []
  );

  // Get patients for a specific type and status
  const getPatients = useCallback(
    (
      type: AttendanceType,
      status: AttendanceProgression
    ): AttendanceStatusDetail[] => {
      if (!attendancesByDate) return [];

      const patients = attendancesByDate[type][status as keyof typeof attendancesByDate[typeof type]] || [];

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

      // For combined treatments, we treat them as a single draggable item
      
      let treatmentTypes: AttendanceType[] = [type];
      if (isCombinedTreatment) {  
        // For combined lightBath+rod, include both
        treatmentTypes = ["lightBath", "rod"];
        // Also include the original dragged type if it's not already there
        if (type !== "lightBath" && type !== "rod") {
          treatmentTypes.unshift(type);
        }
      }
      if (lightBathPatient?.treatmentAttendanceIds?.length) {
        for (let i = 1; i < lightBathPatient.treatmentAttendanceIds?.length; i++) {
          treatmentTypes.push("lightBath");
        } 
      }
      if (rodPatient?.treatmentAttendanceIds?.length) {
        for (let i = 1; i < rodPatient.treatmentAttendanceIds?.length; i++) {
          treatmentTypes.push("rod");
        } 
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

      // Determine which treatment types to move
      let treatmentTypesToMove: Set<AttendanceType> | AttendanceType[];
      
      if (dragged.isCombinedTreatment && dragged.treatmentTypes) {
        // For combined treatments (green cards):
        // - If dragged from lightBath/rod section AND moving within lightBath/rod: move both parts
        // - If dragged from spiritual: move only spiritual
        const isLightBathRodCombined = dragged.treatmentTypes.includes("lightBath") && dragged.treatmentTypes.includes("rod");
        const isDraggingLightBathRod = dragged.type === "lightBath" || dragged.type === "rod";
        const isTargetLightBathRod = toType === "lightBath" || toType === "rod";
        
        if (isLightBathRodCombined && isDraggingLightBathRod && isTargetLightBathRod) {
          // Combined lightBath+rod treatment: move both parts together
          treatmentTypesToMove = new Set<AttendanceType>(["lightBath", "rod"]);
        } else {
          // Other cases: move only the dragged type
          treatmentTypesToMove = [dragged.type];
        }
      } else {
        // Single treatment: move only the dragged type
        treatmentTypesToMove = [dragged.type];
      }

      // Create immutable update by spreading arrays
      let newAttendancesByDate = { ...attendancesByDate };

      // Process each treatment type that needs to be moved
      for (const treatmentType of treatmentTypesToMove) {
        // Find patient for this specific treatment type
        const patient = findPatient(treatmentType as AttendanceType, dragged.status, dragged.patientId);
        if (!patient) continue; // Skip if patient not found for this treatment type

        // Sync with backend if attendanceId is available
        const attendanceIds = patient.treatmentAttendanceIds && patient.treatmentAttendanceIds.length > 0 
          ? patient.treatmentAttendanceIds 
          : (patient.attendanceId ? [patient.attendanceId] : []);
          
        if (attendanceIds.length > 0) {
          for (const attendanceId of attendanceIds) {
            const result = await updateAttendanceStatus(attendanceId, toStatus);
            if (!result.success) {
              console.warn(`Backend sync failed for ${treatmentType} attendanceId ${attendanceId}, continuing with local update`);
            }
          }
        }

        // Update source type (remove patient)
        const sourceType = treatmentType as AttendanceType;
        newAttendancesByDate = {
          ...newAttendancesByDate,
          [sourceType]: {
            ...newAttendancesByDate[sourceType],
            [dragged.status]: (newAttendancesByDate[sourceType][dragged.status] as AttendanceStatusDetail[])
              .filter((p: AttendanceStatusDetail) => p.patientId !== dragged.patientId),
          },
        };

        // For combined treatments, we need to use the correct destination type for each treatment
        const destinationType = dragged.isCombinedTreatment ? (treatmentType as AttendanceType) : toType;

        // Update destination type (add patient)
        newAttendancesByDate = {
          ...newAttendancesByDate,
          [destinationType]: {
            ...newAttendancesByDate[destinationType],
            [toStatus]: [
              ...(newAttendancesByDate[destinationType][toStatus] as AttendanceStatusDetail[]),
              updatePatientTimestamps(patient, toStatus),
            ],
          },
        };
      }

      // Update state with new object
      setAttendancesByDate(newAttendancesByDate);
    },
    [dragged, attendancesByDate, setAttendancesByDate, findPatient, updatePatientTimestamps]
  );

  const handleDropWithConfirm = useCallback(
    (toType: AttendanceType, toStatus: AttendanceProgression) => {
      if (!dragged || !attendancesByDate) return;

      // Find patient by ID using helper function
      const patient = findPatient(dragged.type, dragged.status, dragged.patientId);
      if (!patient) return; // Patient not found
      if (dragged.isCombinedTreatment) {
        // Combined treatments: lightBath/rod cards can move between lightBath and rod sections
        // Allow moves between lightBath and rod, but not to/from spiritual
        const isLightBathRodMove = (dragged.type === "lightBath" || dragged.type === "rod") && 
                                  (toType === "lightBath" || toType === "rod");
        
        if (!isLightBathRodMove && dragged.type !== toType) {
          setDragged(null);
          return;
        }
      } else {
        // Single treatments: only allow moves within the same consultation type
        // This ensures spiritual cards stay in spiritual, lightBath in lightBath, etc.
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
          openNewPatientCheckIn({
            attendanceId: patient.attendanceId,
            patient: patientData,
            onComplete: async (checkInSuccess: boolean) => {
              if (checkInSuccess) {
                await performMove(dragged.type, "checkedIn");
              }
            },
          });

          setDragged(null);
          return;
        }
      }

      // Handle completion moves - open modal BEFORE moving the card
      if (toStatus === "completed") {
        const patient = findPatient(dragged.type, dragged.status, dragged.patientId);
        if (patient && patient.attendanceId && patient.patientId) {
          const attendanceType = dragged.type;
          const fullPatient = patients.find((p) => p.name === patient.name);
          const isFirstAttendance = fullPatient?.status === "N";
          
          if(attendanceType === "spiritual") {
            // Open modal directly - backend will handle duplicate prevention
            openPostAttendance({
              attendanceId: patient.attendanceId!,
              patientId: patient.patientId!,
              patientName: patient.name,
              attendanceType,
              currentTreatmentStatus: "T",
              currentStartDate: undefined,
              currentReturnWeeks: undefined,
              isFirstAttendance: isFirstAttendance,
              // Form will handle its own treatment submission with built-in logic
              // We only need to know when it's done to move the card
              onComplete: async () => {
                // After successful treatment submission, move the card to completed
                await performMove(attendanceType, "completed");
              },
            });
          }

          if(attendanceType !== "spiritual") {
            openPostTreatment({
              attendanceId: patient.attendanceId,
              patientId: patient.patientId,
              patientName: patient.name,
              attendanceType,
              onComplete: async (success) => {
                if (success) {
                  // After successful treatment completion, move the card to completed
                  await performMove(attendanceType, "completed");
                }
              },
            });
          }

          // Don't move the card yet - the modal will handle it
          setDragged(null);
          return;
        }
      }

      // TODO: update to rod and combined types or remove feature
      // Check if patient is scheduled in both consultation types
      const spiritualPatient = findPatient("spiritual", "scheduled", dragged.patientId);
      const lightBathPatient = findPatient("lightBath", "scheduled", dragged.patientId);
      const isInBothTypes = !!spiritualPatient && !!lightBathPatient;

      // If patient is in both types and we're moving from scheduled to checkedIn, show multi-section modal
      if (
        isInBothTypes &&
        dragged.status === "scheduled" &&
        toStatus === "checkedIn"
      ) {
        // Capture current values to avoid stale closures
        const currentPending = {
          patientId: dragged.patientId,
          fromStatus: dragged.status,
          toStatus: toStatus,
          draggedType: dragged.type,
        };

        // Open the Zustand modal with inline handlers
        openMultiSection(
          async () => {            
            if (!attendancesByDate || !setAttendancesByDate) return;

            // Sync with backend for ALL attendance IDs of each type
            const syncPromises: Promise<{success: boolean}>[] = [];
            (["spiritual", "lightBath", "rod"] as AttendanceType[]).forEach((type) => {
              const patientForType = findPatient(type, "scheduled", currentPending.patientId);
              if (patientForType) {
                // Get all attendance IDs for this type
                const attendanceIds = patientForType.treatmentAttendanceIds && patientForType.treatmentAttendanceIds.length > 0 
                  ? patientForType.treatmentAttendanceIds 
                  : (patientForType.attendanceId ? [patientForType.attendanceId] : []);
                
                // Sync each attendance ID
                attendanceIds.forEach((attendanceId) => {
                  syncPromises.push(updateAttendanceStatus(attendanceId, "checkedIn"));
                });
              }
            });

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
                currentPending.patientId
              );

              if (patientToMove) {
                newAttendancesByDate = {
                  ...newAttendancesByDate,
                  [type]: {
                    ...newAttendancesByDate[type],
                    scheduled: newAttendancesByDate[type].scheduled.filter(
                      (p) => p.patientId !== currentPending.patientId
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
            setDragged(null);
          },
          async () => {
            // Temporarily restore the dragged state so performMove works correctly
            const originalDraggedState = {
              type: currentPending.draggedType,
              status: currentPending.fromStatus,
              idx: 0, // Not used by performMove
              patientId: currentPending.patientId,
              // Check if it's a combined treatment
              isCombinedTreatment: !!(
                findPatient("lightBath", currentPending.fromStatus, currentPending.patientId) &&
                findPatient("rod", currentPending.fromStatus, currentPending.patientId)
              ),
              treatmentTypes: [] as AttendanceType[], // Will be set below
            };

            // Set treatment types based on combined status
            if (originalDraggedState.isCombinedTreatment) {
              originalDraggedState.treatmentTypes = ["lightBath", "rod"];
            } else {
              originalDraggedState.treatmentTypes = [currentPending.draggedType];
            }

            // Temporarily set dragged state for performMove
            setDragged(originalDraggedState);
            
            // Use existing performMove logic - it already handles everything correctly
            await performMove(currentPending.draggedType, currentPending.toStatus);

            // Reset state (performMove doesn't reset dragged, we need to do it)
            setDragged(null);
          }
        );
        setDragged(null);
        return;
      }

      // For combined treatments or same-type moves (not involving multi-type scenarios)
      const isCombinedLightBathRodMove = dragged.isCombinedTreatment && 
                                        (dragged.type === "lightBath" || dragged.type === "rod") &&
                                        (toType === "lightBath" || toType === "rod");
      
      const isValidMove = (dragged.type === toType && dragged.status !== toStatus) || 
                          (isCombinedLightBathRodMove && dragged.status !== toStatus);

      if (isValidMove) {
        // Perform the move - modal logic is handled in updatePatientTimestamps
        performMove(toType, toStatus);
        setDragged(null);
        return;
      }

      // Same type and same status, or invalid move - no action needed
      setDragged(null);
    },
    [dragged, attendancesByDate, findPatient, patients, openNewPatientCheckIn, performMove, openPostAttendance, openPostTreatment, openMultiSection, setAttendancesByDate, updatePatientTimestamps]
  );

  return {
    dragged,
    handleDragStart,
    handleDragEnd,
    handleDropWithConfirm,
    getPatients,
  };
};

export default useDragAndDrop;

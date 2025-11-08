import { useCallback } from "react";
import { createTreatmentRecord } from "@/api/treatment-records";
import type { CreateTreatmentRecordRequest } from "@/api/types";
import type { SpiritualTreatmentData } from "../components/Forms/PostAttendanceForms";

/**
 * Hook that handles spiritual treatment record creation
 * Separated from form logic to allow reuse and better testability
 */
export const useSpiritualTreatmentSubmission = () => {
  const submitTreatmentRecord = useCallback(
    async (data: SpiritualTreatmentData, attendanceId: number): Promise<{ treatmentRecordId: number }> => {
      try {
        // Create the treatment record request
        const treatmentRequest: CreateTreatmentRecordRequest = {
          attendance_id: attendanceId,
          main_complaint: data.mainComplaint,
          treatment_status: data.treatmentStatus,
          food: data.food,
          water: data.water,
          ointments: data.ointments,
          spiritual_treatment: true, // This is always true for spiritual consultations
          return_in_weeks: data.returnWeeks,
          notes: data.notes,
          // Legacy lightbath/rod flags for backward compatibility
          light_bath: data.recommendations.lightBath ? true : false,
          light_bath_color: data.recommendations.lightBath?.treatments?.[0]?.color,
          rod: data.recommendations.rod ? true : false,
        };

        // Create the treatment record
        const response = await createTreatmentRecord(treatmentRequest);

        if (response.success && response.value) {
          return { treatmentRecordId: response.value.record.id };
        } else {
          throw new Error(response.error || "Failed to create treatment record");
        }
      } catch (error) {
        console.error("Error submitting treatment record:", error);
        throw error;
      }
    },
    []
  );

  return {
    submitTreatmentRecord,
  };
};
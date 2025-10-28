/**
 * useAttendanceData - Consolidated data management hook
 * 
 * This hook combines and consolidates the scattered data management logic
 * from multiple hooks into a single, focused hook that handles:
 * - Attendance data fetching and state management
 * - Patient operations within attendance context
 * - Integration with AttendancesContext and PatientsContext
 */

import { useState, useCallback } from "react";
import { useAttendanceManagement } from "@/hooks/useAttendanceManagement";
import { usePatients, useCreatePatient } from "@/hooks/usePatientQueries";
import { 
  useCreateAttendance, 
  useCheckInAttendance, 
  useDeleteAttendance 
} from "@/hooks/useAttendanceQueries";
import { 
  AttendanceStatusDetail,
  Priority,
  PatientBasic,
  AttendanceByDate 
} from "@/types/types";
import { AttendanceType } from "@/api/types";
import { validatePatientData, calculateAge } from "@/utils/patientUtils";
import { transformPriorityToApi } from "@/utils/apiTransformers";
import { sortPatientsByPriority } from "@/utils/businessRules";

export interface UseAttendanceDataProps {
  onNewPatientDetected?: (patient: PatientBasic) => void;
  onCheckInProcessed?: () => void;
}

interface PatientCreationResult {
  success: boolean;
  patient?: PatientBasic;
  error?: string;
}

export interface UseAttendanceDataReturn {
  // Data state
  attendancesByDate: AttendanceByDate | null;
  selectedDate: string;
  loading: boolean;
  error: string | null;
  
  // Patient data
  patients: PatientBasic[];
  
  // Actions
  createAttendance: (params: {
    patientId: number;
    attendanceType: AttendanceType;
    scheduledDate?: string;
  }) => Promise<boolean>;
  
  checkInAttendance: (params: {
    attendanceId: number;
    patientName: string;
  }) => Promise<boolean>;
  
  createPatient: (params: {
    name: string;
    phone?: string;
    priority: Priority;
    birthDate: Date;
    mainComplaint?: string;
  }) => Promise<PatientCreationResult>;
  
  deleteAttendance: (attendanceId: number) => Promise<boolean>;
  
  refreshData: () => Promise<void>;
  
  // Utility functions
  getIncompleteAttendances: () => AttendanceStatusDetail[];
  getScheduledAbsences: () => AttendanceStatusDetail[];
  getSortedPatients: () => PatientBasic[];
}

export const useAttendanceData = ({
  onNewPatientDetected,
  onCheckInProcessed
}: UseAttendanceDataProps = {}): UseAttendanceDataReturn => {
  
  // Local state
  const [processingAttendance, setProcessingAttendance] = useState(false);
  
  // Hybrid hooks (React Query + Zustand)
  const {
    attendancesByDate,
    selectedDate,
    loading: attendancesLoading,
    error: attendancesError,
    refreshCurrentDate
  } = useAttendanceManagement();
  
  const {
    data: patients = [],
    isLoading: patientsLoading,
    error: patientsError
  } = usePatients();

  // React Query mutations for better cache management
  const createAttendanceMutation = useCreateAttendance();
  const checkInAttendanceMutation = useCheckInAttendance();
  const deleteAttendanceMutation = useDeleteAttendance();
  const createPatientMutation = useCreatePatient();

  // Consolidated loading and error states
  const loading = attendancesLoading || patientsLoading || processingAttendance;
  const error = attendancesError || (patientsError ? (patientsError as Error).message : null);

  /**
   * Create a new attendance
   */
  const createAttendance = useCallback(async (params: {
    patientId: number;
    attendanceType: AttendanceType;
    scheduledDate?: string;
  }) => {
    try {
      setProcessingAttendance(true);
      
      await createAttendanceMutation.mutateAsync({
        patientId: params.patientId,
        attendanceType: params.attendanceType,
        scheduledDate: params.scheduledDate
      });

      await refreshCurrentDate();
      onCheckInProcessed?.();
      return true;
    } catch (error) {
      console.error("Error creating attendance:", error);
      return false;
    } finally {
      setProcessingAttendance(false);
    }
  }, [refreshCurrentDate, onCheckInProcessed, createAttendanceMutation]);

  /**
   * Check in a patient for their attendance
   */
  const checkInAttendance = useCallback(async (params: {
    attendanceId: number;
    patientName: string;
  }) => {
    try {
      setProcessingAttendance(true);
      
      await checkInAttendanceMutation.mutateAsync({
        attendanceId: params.attendanceId,
        patientName: params.patientName
      });

      await refreshCurrentDate();
      return true;
    } catch (error) {
      console.error("Error checking in:", error);
      return false;
    } finally {
      setProcessingAttendance(false);
    }
  }, [refreshCurrentDate, checkInAttendanceMutation]);

  /**
   * Create a new patient
   */
  const createPatient = useCallback(async (params: {
    name: string;
    phone?: string;
    priority: Priority;
    birthDate: Date;
    mainComplaint?: string;
  }) => {
    try {
      setProcessingAttendance(true);
      
      // Validate patient data
      const validation = validatePatientData({
        name: params.name,
        phone: params.phone,
        birthDate: params.birthDate
      });

      if (!validation.isValid) {
        return {
          success: false,
          error: validation.errors.join(", ")
        };
      }

      const newPatientData = await createPatientMutation.mutateAsync({
        name: params.name.trim(),
        phone: params.phone?.trim() || undefined,
        priority: transformPriorityToApi(params.priority),
        birth_date: params.birthDate.toISOString().split('T')[0], // Convert to YYYY-MM-DD format
        main_complaint: params.mainComplaint?.trim() || undefined,
      });

      // React Query automatically refreshes patient lists, no manual refresh needed
      
      // Trigger new patient detection if callback provided
      if (onNewPatientDetected && newPatientData) {
        const newPatient = {
          id: newPatientData.id.toString(),
          name: newPatientData.name,
          phone: newPatientData.phone || "",
          priority: params.priority,
          status: "T", // Default status
          age: calculateAge(params.birthDate),
          attendanceType: "spiritual" as AttendanceType,
          missingAppointmentsStreak: 0
        } as PatientBasic;
        
        onNewPatientDetected(newPatient);
      }
      
      return {
        success: true,
        patient: newPatientData ? {
          id: newPatientData.id.toString(),
          name: newPatientData.name,
          phone: newPatientData.phone || "",
          priority: params.priority,
          status: "T",
          age: calculateAge(params.birthDate),
          attendanceType: "spiritual" as AttendanceType,
          missingAppointmentsStreak: 0
        } as PatientBasic : undefined
      };
    } catch (error) {
      console.error("Error creating patient:", error);
      return {
        success: false,
        error: "An unexpected error occurred while creating the patient"
      };
    } finally {
      setProcessingAttendance(false);
    }
  }, [createPatientMutation, onNewPatientDetected]);

  /**
   * Delete an attendance
   */
  const deleteAttendance = useCallback(async (attendanceId: number) => {
    try {
      setProcessingAttendance(true);
      
      await deleteAttendanceMutation.mutateAsync(attendanceId);

      await refreshCurrentDate();
      return true;
    } catch (error) {
      console.error("Error deleting attendance:", error);
      return false;
    } finally {
      setProcessingAttendance(false);
    }
  }, [refreshCurrentDate, deleteAttendanceMutation]);

  /**
   * Refresh all data
   */
  const refreshData = useCallback(async () => {
    // React Query automatically refreshes patient lists, only refresh attendances
    await refreshCurrentDate();
  }, [refreshCurrentDate]);

  /**
   * Get incomplete attendances from current data
   */
  const getIncompleteAttendances = useCallback((): AttendanceStatusDetail[] => {
    if (!attendancesByDate) return [];

    const incomplete: AttendanceStatusDetail[] = [];
    ["spiritual", "lightBath", "rod"].forEach((type) => {
      ["checkedIn", "onGoing"].forEach((status) => {
        const typeData = attendancesByDate[type as keyof typeof attendancesByDate];
        if (typeData && typeof typeData === "object") {
          const statusData = typeData[status as keyof typeof typeData];
          if (Array.isArray(statusData)) {
            incomplete.push(...(statusData as AttendanceStatusDetail[]));
          }
        }
      });
    });

    return incomplete;
  }, [attendancesByDate]);

  /**
   * Get scheduled absences from current data
   */
  const getScheduledAbsences = useCallback((): AttendanceStatusDetail[] => {
    if (!attendancesByDate) return [];

    const scheduled: AttendanceStatusDetail[] = [];
    ["spiritual", "lightBath", "rod"].forEach((type) => {
      const typeData = attendancesByDate[type as keyof typeof attendancesByDate];
      if (typeData && typeof typeData === "object" && "scheduled" in typeData) {
        const scheduledData = typeData.scheduled;
        if (Array.isArray(scheduledData)) {
          scheduled.push(...(scheduledData as AttendanceStatusDetail[]));
        }
      }
    });

    return scheduled;
  }, [attendancesByDate]);

  /**
   * Get patients sorted by priority
   */
  const getSortedPatients = useCallback((): PatientBasic[] => {
    return sortPatientsByPriority(patients);
  }, [patients]);

  return {
    // Data state
    attendancesByDate,
    selectedDate,
    loading,
    error,
    patients,
    
    // Actions
    createAttendance,
    checkInAttendance,
    createPatient,
    deleteAttendance,
    refreshData,
    
    // Utility functions
    getIncompleteAttendances,
    getScheduledAbsences,
    getSortedPatients
  };
};

export default useAttendanceData;

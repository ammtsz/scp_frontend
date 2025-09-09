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
import { useAttendances } from "@/contexts/AttendancesContext";
import { usePatients } from "@/contexts/PatientsContext";
import { 
  IAttendanceStatusDetail,
  IAttendanceType,
  IPriority,
  IPatients,
  IAttendanceByDate 
} from "@/types/globals";
import { AttendanceService, PatientService } from "../services";
import { sortPatientsByPriority } from "@/utils/businessRules";

export interface UseAttendanceDataProps {
  onNewPatientDetected?: (patient: IPatients) => void;
  onCheckInProcessed?: () => void;
}

interface PatientCreationResult {
  success: boolean;
  patient?: IPatients;
  error?: string;
}

export interface UseAttendanceDataReturn {
  // Data state
  attendancesByDate: IAttendanceByDate | null;
  selectedDate: string;
  loading: boolean;
  error: string | null;
  
  // Patient data
  patients: IPatients[];
  
  // Actions
  createAttendance: (params: {
    patientId: number;
    attendanceType: IAttendanceType;
    scheduledDate?: string;
  }) => Promise<boolean>;
  
  checkInAttendance: (params: {
    attendanceId: number;
    patientName: string;
  }) => Promise<boolean>;
  
  createPatient: (params: {
    name: string;
    phone?: string;
    priority: IPriority;
    birthDate: Date;
    mainComplaint?: string;
  }) => Promise<PatientCreationResult>;
  
  deleteAttendance: (attendanceId: number) => Promise<boolean>;
  
  refreshData: () => Promise<void>;
  
  // Utility functions
  getIncompleteAttendances: () => IAttendanceStatusDetail[];
  getScheduledAbsences: () => IAttendanceStatusDetail[];
  getSortedPatients: () => IPatients[];
}

export const useAttendanceData = ({
  onNewPatientDetected,
  onCheckInProcessed
}: UseAttendanceDataProps = {}): UseAttendanceDataReturn => {
  
  // Local state
  const [processingAttendance, setProcessingAttendance] = useState(false);
  
  // Context hooks
  const {
    attendancesByDate,
    selectedDate,
    loading: attendancesLoading,
    error: attendancesError,
    refreshCurrentDate
  } = useAttendances();
  
  const {
    patients,
    loading: patientsLoading,
    error: patientsError,
    refreshPatients
  } = usePatients();

  // Consolidated loading and error states
  const loading = attendancesLoading || patientsLoading || processingAttendance;
  const error = attendancesError || patientsError;

  /**
   * Create a new attendance
   */
  const createAttendance = useCallback(async (params: {
    patientId: number;
    attendanceType: IAttendanceType;
    scheduledDate?: string;
  }) => {
    try {
      setProcessingAttendance(true);
      
      const result = await AttendanceService.createAttendance({
        patientId: params.patientId,
        attendanceType: params.attendanceType,
        scheduledDate: params.scheduledDate
      });

      if (result.success) {
        await refreshCurrentDate();
        onCheckInProcessed?.();
        return true;
      } else {
        console.error("Failed to create attendance:", result.error);
        return false;
      }
    } catch (error) {
      console.error("Error creating attendance:", error);
      return false;
    } finally {
      setProcessingAttendance(false);
    }
  }, [refreshCurrentDate, onCheckInProcessed]);

  /**
   * Check in a patient for their attendance
   */
  const checkInAttendance = useCallback(async (params: {
    attendanceId: number;
    patientName: string;
  }) => {
    try {
      setProcessingAttendance(true);
      
      const result = await AttendanceService.checkInAttendance({
        attendanceId: params.attendanceId,
        patientName: params.patientName
      });

      if (result.success) {
        await refreshCurrentDate();
        return true;
      } else {
        console.error("Failed to check in:", result.error);
        return false;
      }
    } catch (error) {
      console.error("Error checking in:", error);
      return false;
    } finally {
      setProcessingAttendance(false);
    }
  }, [refreshCurrentDate]);

  /**
   * Create a new patient
   */
  const createPatient = useCallback(async (params: {
    name: string;
    phone?: string;
    priority: IPriority;
    birthDate: Date;
    mainComplaint?: string;
  }) => {
    try {
      setProcessingAttendance(true);
      
      // Validate patient data
      const validation = PatientService.validatePatientData({
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

      const result = await PatientService.createPatient(params);

      if (result.success) {
        await refreshPatients();
        
        // Trigger new patient detection if callback provided
        if (onNewPatientDetected && result.data) {
          const newPatient = {
            id: result.data.id.toString(),
            name: result.data.name,
            phone: result.data.phone || "",
            priority: params.priority,
            status: "T", // Default status
            age: PatientService.calculateAge(params.birthDate),
            attendanceType: "spiritual" as IAttendanceType,
            missingAppointmentsStreak: 0
          } as IPatients;
          
          onNewPatientDetected(newPatient);
        }
        
        return {
          success: true,
          patient: result.data ? {
            id: result.data.id.toString(),
            name: result.data.name,
            phone: result.data.phone || "",
            priority: params.priority,
            status: "T",
            age: PatientService.calculateAge(params.birthDate),
            attendanceType: "spiritual" as IAttendanceType,
            missingAppointmentsStreak: 0
          } as IPatients : undefined
        };
      } else {
        return {
          success: false,
          error: result.error || "Failed to create patient"
        };
      }
    } catch (error) {
      console.error("Error creating patient:", error);
      return {
        success: false,
        error: "An unexpected error occurred while creating the patient"
      };
    } finally {
      setProcessingAttendance(false);
    }
  }, [refreshPatients, onNewPatientDetected]);

  /**
   * Delete an attendance
   */
  const deleteAttendance = useCallback(async (attendanceId: number) => {
    try {
      setProcessingAttendance(true);
      
      const result = await AttendanceService.deleteAttendance(attendanceId);

      if (result.success) {
        await refreshCurrentDate();
        return true;
      } else {
        console.error("Failed to delete attendance:", result.error);
        return false;
      }
    } catch (error) {
      console.error("Error deleting attendance:", error);
      return false;
    } finally {
      setProcessingAttendance(false);
    }
  }, [refreshCurrentDate]);

  /**
   * Refresh all data
   */
  const refreshData = useCallback(async () => {
    await Promise.all([
      refreshCurrentDate(),
      refreshPatients()
    ]);
  }, [refreshCurrentDate, refreshPatients]);

  /**
   * Get incomplete attendances from current data
   */
  const getIncompleteAttendances = useCallback((): IAttendanceStatusDetail[] => {
    if (!attendancesByDate) return [];

    const incomplete: IAttendanceStatusDetail[] = [];
    ["spiritual", "lightBath", "rod"].forEach((type) => {
      ["checkedIn", "onGoing"].forEach((status) => {
        const typeData = attendancesByDate[type as keyof typeof attendancesByDate];
        if (typeData && typeof typeData === "object") {
          const statusData = typeData[status as keyof typeof typeData];
          if (Array.isArray(statusData)) {
            incomplete.push(...(statusData as IAttendanceStatusDetail[]));
          }
        }
      });
    });

    return incomplete;
  }, [attendancesByDate]);

  /**
   * Get scheduled absences from current data
   */
  const getScheduledAbsences = useCallback((): IAttendanceStatusDetail[] => {
    if (!attendancesByDate) return [];

    const scheduled: IAttendanceStatusDetail[] = [];
    ["spiritual", "lightBath", "rod"].forEach((type) => {
      const typeData = attendancesByDate[type as keyof typeof attendancesByDate];
      if (typeData && typeof typeData === "object" && "scheduled" in typeData) {
        const scheduledData = typeData.scheduled;
        if (Array.isArray(scheduledData)) {
          scheduled.push(...(scheduledData as IAttendanceStatusDetail[]));
        }
      }
    });

    return scheduled;
  }, [attendancesByDate]);

  /**
   * Get patients sorted by priority
   */
  const getSortedPatients = useCallback((): IPatients[] => {
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

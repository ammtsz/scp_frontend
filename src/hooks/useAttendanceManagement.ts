/**
 * useAttendanceManagement - Hybrid Hook
 * 
 * Combines React Query (server state) and Zustand (UI state) to replace
 * the complex 398-line AttendancesContext with modern state management.
 * 
 * This hook demonstrates the proven hybrid pattern:
 * - React Query: Server operations, caching, mutations
 * - Zustand: UI state, drag & drop, workflows
 * - Individual Selectors: Performance optimization
 */

import { useCallback, useEffect } from 'react';
import {
  useAttendancesByDate,
  useNextAttendanceDate,
  useBulkUpdateAttendanceStatus,
  useRefreshAttendances,
  useHandleIncompleteAttendances,
  useHandleAbsenceJustifications,
} from '@/hooks/useAttendanceQueries';
import {
  useSelectedDate,
  useAttendanceLoading,
  useAttendanceDataLoading,
  useAttendanceError,
  useSetSelectedDate,
  useSetAttendanceLoading,
  useSetAttendanceDataLoading,
  useSetAttendanceError,
  useCheckEndOfDayStatus,
  // useFinalizeEndOfDay, // Not implemented yet
  useSetDayFinalized,
  useDayFinalized,
  useEndOfDayStatus,
} from '@/stores';
import { 
  AttendanceByDate,
  AttendanceStatusDetail
} from '@/types/types';

// Interfaces matching the original Context for compatibility
interface AbsenceJustification {
  attendanceId: number;
  patientName: string;
  justified: boolean;
  notes: string;
}

interface EndOfDayData {
  incompleteAttendances: AttendanceStatusDetail[];
  scheduledAbsences: AttendanceStatusDetail[];
  absenceJustifications: Array<{
    patientId: number;
    patientName: string;
    justified: boolean;
    notes: string;
  }>;  
}

interface EndOfDayResult {
  type: "incomplete" | "scheduled_absences" | "completed";
  incompleteAttendances?: AttendanceStatusDetail[];
  scheduledAbsences?: AttendanceStatusDetail[];
  completionData?: {
    totalPatients: number;
    completedPatients: number;
    missedPatients: number;
    completionTime: Date;
  };
}

export interface UseAttendanceManagementReturn {
  // Server state (React Query)
  attendancesByDate: AttendanceByDate | null;
  
  // UI state (Zustand)  
  selectedDate: string;
  loading: boolean;
  dataLoading: boolean;
  error: string | null;
  dayFinalized: boolean;
  endOfDayStatus: EndOfDayResult | null;
  
  // Actions - State Management
  setSelectedDate: (date: string) => void;
  setAttendancesByDate: (data: AttendanceByDate | null) => void; // For compatibility
  
  // Actions - Server Operations  
  loadAttendancesByDate: (date: string) => Promise<AttendanceByDate | null>;
  bulkUpdateStatus: (ids: number[], status: string) => Promise<boolean>;
  initializeSelectedDate: () => Promise<void>;
  refreshCurrentDate: () => Promise<void>;
  
  // Actions - End-of-day Workflow
  checkEndOfDayStatus: () => EndOfDayResult;
  finalizeEndOfDay: (data?: EndOfDayData) => Promise<EndOfDayResult>;
  handleIncompleteAttendances: (
    attendances: AttendanceStatusDetail[],
    action: "complete" | "reschedule"
  ) => Promise<boolean>;
  handleAbsenceJustifications: (
    justifications: AbsenceJustification[]
  ) => Promise<boolean>;
}

/**
 * Hybrid attendance management hook
 * Replaces AttendancesContext with React Query + Zustand pattern
 */
export function useAttendanceManagement(): UseAttendanceManagementReturn {
  // Zustand UI state (individual selectors for performance)
  const selectedDate = useSelectedDate();
  const loading = useAttendanceLoading();
  const dataLoading = useAttendanceDataLoading();  
  const error = useAttendanceError();
  const dayFinalized = useDayFinalized();
  const endOfDayStatus = useEndOfDayStatus();
  
  // Zustand actions (individual selectors for stable references)
  const setSelectedDate = useSetSelectedDate();
  const setLoading = useSetAttendanceLoading();
  const setDataLoading = useSetAttendanceDataLoading();
  const setError = useSetAttendanceError();
  const setDayFinalized = useSetDayFinalized();
  const checkEndOfDayStatusAction = useCheckEndOfDayStatus();
  // const finalizeEndOfDayAction = useFinalizeEndOfDay(); // Not used yet
  
  // React Query server state and mutations
  const { 
    data: attendancesByDate, 
    isLoading: attendancesLoading,
    error: attendancesError,
    refetch: refetchAttendances
  } = useAttendancesByDate(selectedDate);
  
  const { 
    data: nextDate,
    isLoading: nextDateLoading 
  } = useNextAttendanceDate();
  
  // Only create mutations that are actually used
  const bulkUpdateMutation = useBulkUpdateAttendanceStatus();
  const handleIncompletesMutation = useHandleIncompleteAttendances();
  const handleAbsencesMutation = useHandleAbsenceJustifications();
  const refreshAttendances = useRefreshAttendances();
  
  // Sync loading states
  useEffect(() => {
    setLoading(attendancesLoading || nextDateLoading);
  }, [attendancesLoading, nextDateLoading, setLoading]);
  
  // Sync error states
  useEffect(() => {
    const errorMessage = attendancesError ? 
      (attendancesError as Error).message : null;
    setError(errorMessage);
  }, [attendancesError, setError]);
  
  // Load attendances by date
  const loadAttendancesByDate = useCallback(async (date: string): Promise<AttendanceByDate | null> => {
    try {
      setDataLoading(true);
      setError(null);
      
      // Trigger refetch for the new date by updating selectedDate
      // This will cause useAttendancesByDate to refetch
      if (date !== selectedDate) {
        setSelectedDate(date);
      } else {
        await refetchAttendances();
      }
      
      return attendancesByDate || null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to load attendances";
      setError(errorMessage);
      console.error("Error loading attendances by date:", err);
      return null;
    } finally {
      setDataLoading(false);
    }
  }, [selectedDate, setSelectedDate, setDataLoading, setError, refetchAttendances, attendancesByDate]);
  
  // Refresh current date
  const refreshCurrentDate = useCallback(async (): Promise<void> => {
    refreshAttendances(selectedDate);
  }, [refreshAttendances, selectedDate]);
  
  // Bulk update status
  const bulkUpdateStatus = useCallback(async (ids: number[], status: string): Promise<boolean> => {
    try {
      await bulkUpdateMutation.mutateAsync({
        ids,
        status
      });
      return true;
    } catch (err) {
      console.error("Error updating attendance status:", err);
      return false;
    }
  }, [bulkUpdateMutation]);
  
  // Initialize selected date
  const initializeSelectedDate = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      
      if (nextDate) {
        setSelectedDate(nextDate);
      } else {
        // Use current date as fallback
        const currentDate = new Date().toISOString().slice(0, 10);
        setSelectedDate(currentDate);
      }
    } catch (err) {
      console.error("Error initializing selected date:", err);
      // Use current date as fallback
      const currentDate = new Date().toISOString().slice(0, 10);
      setSelectedDate(currentDate);
    } finally {
      setLoading(false);
    }
  }, [nextDate, setSelectedDate, setLoading]);
  
  // Check end-of-day status
  const checkEndOfDayStatus = useCallback((): EndOfDayResult => {
    return checkEndOfDayStatusAction(attendancesByDate || null);
  }, [checkEndOfDayStatusAction, attendancesByDate]);
  
  // Finalize end-of-day
  const finalizeEndOfDay = useCallback(async (data?: EndOfDayData): Promise<EndOfDayResult> => {
    try {
      if (!attendancesByDate) {
        throw new Error("No attendance data available");
      }

      // Handle absence justifications if provided
      if (data?.absenceJustifications && data.absenceJustifications.length > 0) {
        const justifications = data.absenceJustifications.map(j => ({
          attendanceId: j.patientId, // Note: This might need adjustment based on actual data structure
          patientName: j.patientName,
          justified: j.justified,
          notes: j.notes,
        }));
        
        await handleAbsencesMutation.mutateAsync(justifications);
      }

      // Calculate completion data
      const isAttendanceStatus = (value: unknown): value is { completed?: unknown[] } => {
        const candidate = value as { completed?: unknown[] };
        return !!(
          value &&
          typeof value === "object" &&
          Array.isArray(candidate.completed)
        );
      };

      const attendanceValues = Object.values(attendancesByDate).filter(val => 
        typeof val === 'object' && val !== null && 'completed' in val
      );
      
      const completedCount = attendanceValues
        .filter(isAttendanceStatus)
        .reduce((total, typeData) => total + (typeData.completed?.length || 0), 0);

      const result: EndOfDayResult = {
        type: "completed",
        completionData: {
          totalPatients: completedCount,
          completedPatients: completedCount,
          missedPatients: 0, // Would be calculated based on absences
          completionTime: new Date(),
        },
      };

      setDayFinalized(true);
      return result;
    } catch (err) {
      console.error("Error finalizing end of day:", err);
      throw err;
    }
  }, [attendancesByDate, handleAbsencesMutation, setDayFinalized]);
  
  // Handle incomplete attendances
  const handleIncompleteAttendances = useCallback(async (
    attendances: AttendanceStatusDetail[],
    action: "complete" | "reschedule"
  ): Promise<boolean> => {
    try {
      await handleIncompletesMutation.mutateAsync({
        attendances,
        action
      });
      return true;
    } catch (err) {
      console.error("Error handling incomplete attendances:", err);
      return false;
    }
  }, [handleIncompletesMutation]);
  
  // Handle absence justifications
  const handleAbsenceJustifications = useCallback(async (
    justifications: AbsenceJustification[]
  ): Promise<boolean> => {
    try {
      await handleAbsencesMutation.mutateAsync(justifications);
      return true;
    } catch (err) {
      console.error("Error handling absence justifications:", err);
      return false;
    }
  }, [handleAbsencesMutation]);
  
  // Compatibility method for existing components
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const setAttendancesByDate = useCallback((_data: AttendanceByDate | null) => {
    // This is a no-op since React Query manages server state
    // Components should use refreshCurrentDate() instead
    refreshCurrentDate();
  }, [refreshCurrentDate]);
  
  return {
    // Server state
    attendancesByDate: attendancesByDate || null,
    
    // UI state
    selectedDate,
    loading,
    dataLoading,
    error,
    dayFinalized,
    endOfDayStatus,
    
    // Actions - State Management
    setSelectedDate,
    setAttendancesByDate,
    
    // Actions - Server Operations
    loadAttendancesByDate,
    bulkUpdateStatus,
    initializeSelectedDate,
    refreshCurrentDate,
    
    // Actions - End-of-day Workflow
    checkEndOfDayStatus,
    finalizeEndOfDay,
    handleIncompleteAttendances,
    handleAbsenceJustifications,
  };
}

// Export types for convenience
export type {
  AbsenceJustification,
  EndOfDayData,
  EndOfDayResult,
};
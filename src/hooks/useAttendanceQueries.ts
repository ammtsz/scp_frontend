/**
 * useAttendanceQueries - React Query hooks for attendance server state
 * 
 * Manages all server state operations for attendance management including:
 * - Fetching attendances by date
 * - CRUD operations for attendances  
 * - End-of-day workflow operations
 * - Bulk status updates
 * - Real-time synchronization with backend
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAttendancesByDate,
  getNextAttendanceDate,
  bulkUpdateAttendanceStatus,
  updateAttendance,
  markAttendanceAsMissed,
  completeAttendance,
  createAttendance,
  deleteAttendance,
} from '@/api/attendances';
import { 
  AttendanceByDate,
  AttendanceStatusDetail
} from '@/types/types';
import { AttendanceType } from '@/api/types';
import { AttendanceStatus as ApiAttendanceStatus } from '@/api/types';
import { transformAttendanceWithPatientByDate } from '@/utils/apiTransformers';

// Query Keys Factory
export const attendanceKeys = {
  all: ['attendances'] as const,
  lists: () => [...attendanceKeys.all, 'list'] as const,
  list: (filters: string) => [...attendanceKeys.lists(), { filters }] as const,
  details: () => [...attendanceKeys.all, 'detail'] as const,
  detail: (id: number) => [...attendanceKeys.details(), id] as const,
  byDate: (date: string) => [...attendanceKeys.all, 'byDate', date] as const,
  nextDate: () => [...attendanceKeys.all, 'nextDate'] as const,
} as const;

// Interfaces for mutations
interface CreateAttendanceParams {
  patientId: number;
  attendanceType: AttendanceType;
  scheduledDate?: string;
}

interface UpdateAttendanceParams {
  id: string;
  status?: ApiAttendanceStatus;
  absence_justified?: boolean;
  absence_notes?: string;
}

interface BulkUpdateParams {
  ids: number[];
  status: string;
}

interface CompleteAttendanceParams {
  id: string;
}

interface CheckInAttendanceParams {
  attendanceId: number;
  patientName: string;
}

interface MarkMissedParams {
  id: string;
  justified: boolean;
  notes?: string;
}

// End-of-day workflow interfaces
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

/**
 * Fetch attendances by date with automatic caching and background refetch
 */
export function useAttendancesByDate(date: string) {
  return useQuery({
    queryKey: attendanceKeys.byDate(date),
    queryFn: async (): Promise<AttendanceByDate | null> => {
      try {
        const response = await getAttendancesByDate(date);
        if (!response.success) {
          throw new Error(response.error || "Failed to fetch attendances");
        }
        
        return transformAttendanceWithPatientByDate(
          response.value || [],
          date
        );
      } catch (error) {
        console.error("Error fetching attendances by date:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: true,
    refetchOnMount: true,
  });
}

/**
 * Get next available attendance date
 */
export function useNextAttendanceDate() {
  return useQuery({
    queryKey: attendanceKeys.nextDate(),
    queryFn: async (): Promise<string | null> => {
      try {
        const response = await getNextAttendanceDate();
        if (response.success && response.value?.next_date) {
          return response.value.next_date;
        }
        return new Date().toISOString().slice(0, 10); // Fallback to today
      } catch (error) {
        console.error("Error fetching next attendance date:", error);
        return new Date().toISOString().slice(0, 10);
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

/**
 * Create new attendance
 */
export function useCreateAttendance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: CreateAttendanceParams) => {
      const response = await createAttendance({
        patient_id: params.patientId,
        type: params.attendanceType,
        scheduled_date: params.scheduledDate || new Date().toISOString().slice(0, 10),
        scheduled_time: "09:00", // Default time
      });
      
      if (!response.success) {
        throw new Error(response.error || "Failed to create attendance");
      }
      
      return response.value;
    },
    onSuccess: (_, variables) => {
      // Invalidate attendance queries for the scheduled date
      const targetDate = variables.scheduledDate || new Date().toISOString().slice(0, 10);
      queryClient.invalidateQueries({ 
        queryKey: attendanceKeys.byDate(targetDate) 
      });
      
      // Also invalidate next date query
      queryClient.invalidateQueries({ 
        queryKey: attendanceKeys.nextDate() 
      });
    },
    onError: (error) => {
      console.error("Error creating attendance:", error);
    },
  });
}

/**
 * Update attendance (general update)
 */
export function useUpdateAttendance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: UpdateAttendanceParams) => {
      const response = await updateAttendance(params.id, {
        status: params.status,
        absence_justified: params.absence_justified,
        absence_notes: params.absence_notes,
      });
      
      if (!response.success) {
        throw new Error(response.error || "Failed to update attendance");
      }
      
      return response.value;
    },
    onSuccess: () => {
      // Invalidate all attendance queries as we don't know which date was affected
      queryClient.invalidateQueries({ 
        queryKey: attendanceKeys.all 
      });
    },
    onError: (error) => {
      console.error("Error updating attendance:", error);
    },
  });
}

/**
 * Complete attendance
 */
export function useCompleteAttendance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: CompleteAttendanceParams) => {
      const response = await completeAttendance(params.id);
      
      if (!response.success) {
        throw new Error(response.error || "Failed to complete attendance");
      }
      
      return response.value;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: attendanceKeys.all 
      });
    },
    onError: (error) => {
      console.error("Error completing attendance:", error);
    },
  });
}

/**
 * Mark attendance as missed
 */
export function useMarkAttendanceAsMissed() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: MarkMissedParams) => {
      const response = await markAttendanceAsMissed(
        params.id,
        params.justified,
        params.notes
      );
      
      if (!response.success) {
        throw new Error(response.error || "Failed to mark attendance as missed");
      }
      
      return response.value;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: attendanceKeys.all 
      });
    },
    onError: (error) => {
      console.error("Error marking attendance as missed:", error);
    },
  });
}

/**
 * Bulk update attendance status
 */
export function useBulkUpdateAttendanceStatus() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (params: BulkUpdateParams) => {
      await bulkUpdateAttendanceStatus(params.ids, params.status as ApiAttendanceStatus);
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: attendanceKeys.all 
      });
    },
    onError: (error) => {
      console.error("Error bulk updating attendance status:", error);
    },
  });
}

/**
 * Delete attendance
 */
export function useDeleteAttendance() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (attendanceId: number) => {
      const response = await deleteAttendance(attendanceId.toString());
      
      if (!response.success) {
        throw new Error(response.error || "Failed to delete attendance");
      }
      
      return response.value;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: attendanceKeys.all 
      });
    },
    onError: (error) => {
      console.error("Error deleting attendance:", error);
    },
  });
}

/**
 * Check in attendance (alias for status update to checked_in)
 */
export function useCheckInAttendance() {
  const updateMutation = useUpdateAttendance();
  
  return useMutation({
    mutationFn: async (params: CheckInAttendanceParams) => {
      return updateMutation.mutateAsync({
        id: params.attendanceId.toString(),
        status: ApiAttendanceStatus.CHECKED_IN,
      });
    },
    onSuccess: () => {
      // Success handled by updateMutation
    },
    onError: (error) => {
      console.error("Error checking in attendance:", error);
    },
  });
}

/**
 * Refresh attendances for current date
 */
export function useRefreshAttendances() {
  const queryClient = useQueryClient();
  
  return (date?: string) => {
    if (date) {
      return queryClient.invalidateQueries({ 
        queryKey: attendanceKeys.byDate(date) 
      });
    } else {
      return queryClient.invalidateQueries({ 
        queryKey: attendanceKeys.all 
      });
    }
  };
}

/**
 * Handle incomplete attendances (batch operation)
 */
export function useHandleIncompleteAttendances() {
  const completeMutation = useCompleteAttendance();
  const updateMutation = useUpdateAttendance();
  
  return useMutation({
    mutationFn: async (params: {
      attendances: AttendanceStatusDetail[];
      action: "complete" | "reschedule";
    }) => {
      const promises = params.attendances.map(async (attendance) => {
        if (!attendance.attendanceId) return;

        if (params.action === "complete") {
          return completeMutation.mutateAsync({
            id: attendance.attendanceId.toString(),
          });
        } else if (params.action === "reschedule") {
          return updateMutation.mutateAsync({
            id: attendance.attendanceId.toString(),
            status: ApiAttendanceStatus.SCHEDULED,
          });
        }
      });

      await Promise.all(promises.filter(Boolean));
      return { success: true };
    },
    onError: (error) => {
      console.error("Error handling incomplete attendances:", error);
    },
  });
}

/**
 * Handle absence justifications (batch operation)
 */
export function useHandleAbsenceJustifications() {
  const updateMutation = useUpdateAttendance();
  const markMissedMutation = useMarkAttendanceAsMissed();
  
  return useMutation({
    mutationFn: async (justifications: AbsenceJustification[]) => {
      const promises = justifications.map(async (justification) => {
        if (justification.justified) {
          return updateMutation.mutateAsync({
            id: justification.attendanceId.toString(),
            absence_justified: true,
            absence_notes: justification.notes,
            status: ApiAttendanceStatus.MISSED,
          });
        } else {
          return markMissedMutation.mutateAsync({
            id: justification.attendanceId.toString(),
            justified: false,
            notes: justification.notes,
          });
        }
      });

      await Promise.all(promises);
      return { success: true };
    },
    onError: (error) => {
      console.error("Error handling absence justifications:", error);
    },
  });
}

// Export types for convenience
export type {
  CreateAttendanceParams,
  UpdateAttendanceParams,
  BulkUpdateParams,
  CompleteAttendanceParams,
  CheckInAttendanceParams,
  MarkMissedParams,
  AbsenceJustification,
  EndOfDayData,
  EndOfDayResult,
};
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTreatmentRecords,
  getTreatmentRecordByAttendance,
  createTreatmentRecord,
  updateTreatmentRecord,
  deleteTreatmentRecord,
} from '@/api/treatment-records';
import type {
  TreatmentRecordResponseDto,
  CreateTreatmentRecordRequest,
  UpdateTreatmentRecordRequest,
} from '@/api/types';

// Query keys for consistent caching
export const treatmentRecordKeys = {
  all: ['treatmentRecords'] as const,
  lists: () => [...treatmentRecordKeys.all, 'list'] as const,
  details: () => [...treatmentRecordKeys.all, 'detail'] as const,
  detail: (id: string) => [...treatmentRecordKeys.details(), id] as const,
  byAttendance: (attendanceId: string) => [...treatmentRecordKeys.all, 'attendance', attendanceId] as const,
};

/**
 * Query hook for fetching all treatment records (replaces TreatmentRecordsContext)
 * Provides automatic caching, background sync, and error handling
 */
export function useTreatmentRecords() {
  return useQuery({
    queryKey: treatmentRecordKeys.lists(),
    queryFn: async () => {
      const result = await getTreatmentRecords();
      
      if (!result.success || !result.value) {
        throw new Error(result.error || 'Erro ao carregar registros de tratamento');
      }

      return result.value;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - treatment records change less frequently
    gcTime: 10 * 60 * 1000, // 10 minutes in cache
    retry: process.env.NODE_ENV === 'test' ? false : 3, // Don't retry in tests, but retry 3 times in production
  });
}

/**
 * Query hook for fetching a treatment record by attendance ID
 * Used to get treatment record for specific attendance
 */
export function useTreatmentRecordByAttendance(attendanceId: string | number) {
  const attendanceIdStr = attendanceId.toString();
  
  return useQuery({
    queryKey: treatmentRecordKeys.byAttendance(attendanceIdStr),
    queryFn: async () => {
      const result = await getTreatmentRecordByAttendance(attendanceIdStr);
      
      if (!result.success) {
        // Return null if not found (this is expected for some attendances)
        if (result.error?.includes('not found') || result.error?.includes('404')) {
          return null;
        }
        throw new Error(result.error || 'Erro ao carregar registro de tratamento');
      }

      return result.value || null;
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: process.env.NODE_ENV === 'test' ? false : (failureCount, error) => {
      // Don't retry if it's a 404 (not found) - this is expected behavior
      if (error?.message.includes('404') || error?.message.includes('not found')) {
        return false;
      }
      return failureCount < 3; // Retry up to 3 times for other errors
    },
    enabled: !!attendanceId, // Only run query if attendanceId is provided
  });
}

/**
 * Mutation hook for creating treatment records
 * Automatically invalidates relevant queries after successful creation
 */
export function useCreateTreatmentRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreateTreatmentRecordRequest) => {
      const result = await createTreatmentRecord(data);
      
      if (!result.success || !result.value) {
        throw new Error(result.error || 'Erro ao criar registro de tratamento');
      }

      return result.value.record;
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch treatment records list
      queryClient.invalidateQueries({ queryKey: treatmentRecordKeys.lists() });
      
      // If attendance_id is provided, invalidate that specific query too
      if (variables.attendance_id) {
        queryClient.invalidateQueries({ 
          queryKey: treatmentRecordKeys.byAttendance(variables.attendance_id.toString()) 
        });
      }
    },
    onError: (error) => {
      console.error('Error creating treatment record:', error);
    },
  });
}

/**
 * Mutation hook for updating treatment records
 * Automatically invalidates relevant queries after successful update
 */
export function useUpdateTreatmentRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string | number; data: UpdateTreatmentRecordRequest }) => {
      const result = await updateTreatmentRecord(id.toString(), data);
      
      if (!result.success || !result.value) {
        throw new Error(result.error || 'Erro ao atualizar registro de tratamento');
      }

      return result.value;
    },
    onSuccess: (data, { id }) => {
      // Invalidate and refetch treatment records
      queryClient.invalidateQueries({ queryKey: treatmentRecordKeys.lists() });
      queryClient.invalidateQueries({ queryKey: treatmentRecordKeys.detail(id.toString()) });
      
      // If the record has attendance_id, invalidate that query too
      if (data.attendance_id) {
        queryClient.invalidateQueries({ 
          queryKey: treatmentRecordKeys.byAttendance(data.attendance_id.toString()) 
        });
      }
    },
    onError: (error) => {
      console.error('Error updating treatment record:', error);
    },
  });
}

/**
 * Mutation hook for deleting treatment records
 * Automatically invalidates relevant queries after successful deletion
 */
export function useDeleteTreatmentRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string | number) => {
      const result = await deleteTreatmentRecord(id.toString());
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao excluir registro de tratamento');
      }

      return true;
    },
    onSuccess: (_, id) => {
      // Invalidate and refetch treatment records
      queryClient.invalidateQueries({ queryKey: treatmentRecordKeys.lists() });
      queryClient.invalidateQueries({ queryKey: treatmentRecordKeys.detail(id.toString()) });
      
      // Remove all related queries from cache
      queryClient.removeQueries({ queryKey: treatmentRecordKeys.detail(id.toString()) });
    },
    onError: (error) => {
      console.error('Error deleting treatment record:', error);
    },
  });
}

/**
 * Helper hook that provides the same interface as the old TreatmentRecordsContext
 * for easier migration. This can be removed once all components are updated.
 */
export function useTreatmentRecordsCompat() {
  const { data: treatmentRecords = [], isLoading: loading, error: queryError } = useTreatmentRecords();
  const createMutation = useCreateTreatmentRecord();
  const updateMutation = useUpdateTreatmentRecord();
  const deleteMutation = useDeleteTreatmentRecord();
  const queryClient = useQueryClient();

  // Convert React Query error to string for compatibility
  const error = queryError ? (queryError as Error).message : null;

  const refreshTreatmentRecords = async () => {
    await queryClient.invalidateQueries({ queryKey: treatmentRecordKeys.lists() });
  };

  const getTreatmentRecordForAttendance = async (
    attendanceId: number
  ): Promise<TreatmentRecordResponseDto | null> => {
    const result = await queryClient.fetchQuery({
      queryKey: treatmentRecordKeys.byAttendance(attendanceId.toString()),
      queryFn: async () => {
        const apiResult = await getTreatmentRecordByAttendance(attendanceId.toString());
        return apiResult.success ? apiResult.value || null : null;
      },
    });
    return result;
  };

  const createRecord = async (
    data: CreateTreatmentRecordRequest
  ): Promise<TreatmentRecordResponseDto | null> => {
    try {
      return await createMutation.mutateAsync(data);
    } catch (error) {
      console.error('Error in createRecord:', error);
      return null;
    }
  };

  const updateRecord = async (
    id: number,
    data: UpdateTreatmentRecordRequest
  ): Promise<TreatmentRecordResponseDto | null> => {
    try {
      return await updateMutation.mutateAsync({ id, data });
    } catch (error) {
      console.error('Error in updateRecord:', error);
      return null;
    }
  };

  const deleteRecord = async (id: number): Promise<boolean> => {
    try {
      await deleteMutation.mutateAsync(id);
      return true;
    } catch (error) {
      console.error('Error in deleteRecord:', error);
      return false;
    }
  };

  return {
    treatmentRecords,
    loading,
    error,
    refreshTreatmentRecords,
    getTreatmentRecordForAttendance,
    createRecord,
    updateRecord,
    deleteRecord,
  };
}
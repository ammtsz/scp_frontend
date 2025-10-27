import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getPatientById, updatePatient, getPatients, createPatient, deletePatient } from '@/api/patients';
import { getAttendancesByPatient } from '@/api/attendances';
import { 
  transformSinglePatientFromApi, 
  transformPatientWithAttendances,
  transformPatientsFromApi
} from '@/utils/apiTransformers';
import { Patient } from '@/types/types';
import { UpdatePatientRequest, CreatePatientRequest } from '@/api/types';

// Query keys for consistent caching
export const patientKeys = {
  all: ['patients'] as const,
  lists: () => [...patientKeys.all, 'list'] as const,
  list: (filters: string) => [...patientKeys.lists(), { filters }] as const,
  details: () => [...patientKeys.all, 'detail'] as const,
  detail: (id: string) => [...patientKeys.details(), id] as const,
  attendances: (patientId: string) => ['attendances', 'patient', patientId] as const,
};

/**
 * Hook to fetch patient data with attendances
 * Implements parallel fetching with fallback strategy
 */
export function usePatientWithAttendances(patientId: string) {
  return useQuery({
    queryKey: patientKeys.detail(patientId),
    queryFn: async (): Promise<Patient> => {
      // Fetch patient data and attendance history in parallel
      const [patientResult, attendancesResult] = await Promise.all([
        getPatientById(patientId),
        getAttendancesByPatient(patientId),
      ]);

      if (!patientResult.success || !patientResult.value) {
        throw new Error(patientResult.error || 'Paciente não encontrado');
      }

      let transformedPatient: Patient;

      if (attendancesResult.success && attendancesResult.value) {
        // Use enhanced transformer with attendance history
        transformedPatient = transformPatientWithAttendances(
          patientResult.value,
          attendancesResult.value
        );
      } else {
        // Fallback to basic transformer if attendance fetch fails
        transformedPatient = transformSinglePatientFromApi(patientResult.value);
        
        // Log attendance error but don't fail the query
        console.warn('Failed to load attendance data:', attendancesResult.error);
      }

      return transformedPatient;
    },
    enabled: !!patientId,
    // Patient data is relatively stable, cache for 10 minutes
    staleTime: 10 * 60 * 1000,
    // Keep in cache for 30 minutes after last use
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Hook to fetch only patient basic data (without attendances)
 * Useful for lighter queries when attendance data isn't needed
 */
export function usePatient(patientId: string) {
  return useQuery({
    queryKey: [...patientKeys.detail(patientId), 'basic'],
    queryFn: async (): Promise<Patient> => {
      const result = await getPatientById(patientId);
      
      if (!result.success || !result.value) {
        throw new Error(result.error || 'Paciente não encontrado');
      }

      return transformSinglePatientFromApi(result.value);
    },
    enabled: !!patientId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
  });
}

/**
 * Hook to fetch patient attendances separately
 * Allows for independent caching and refetching of attendance data
 */
export function usePatientAttendances(patientId: string) {
  return useQuery({
    queryKey: patientKeys.attendances(patientId),
    queryFn: async () => {
      const result = await getAttendancesByPatient(patientId);
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao carregar atendimentos');
      }

      return result.value || [];
    },
    enabled: !!patientId,
    // Attendance data changes more frequently
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

/**
 * Query hook for fetching all patients (replaces PatientsContext)
 * Provides automatic caching, background sync, and error handling
 */
export function usePatients() {
  return useQuery({
    queryKey: patientKeys.lists(),
    queryFn: async () => {
      const result = await getPatients();
      
      if (!result.success || !result.value) {
        throw new Error(result.error || 'Erro ao carregar pacientes');
      }

      // Transform API response to internal format
      return transformPatientsFromApi(result.value);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - patient list doesn't change frequently
    gcTime: 10 * 60 * 1000, // 10 minutes in cache
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Mutation hook for creating new patients
 * Automatically invalidates patient list after successful creation
 */
export function useCreatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePatientRequest) => {
      const result = await createPatient(data);
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao criar paciente');
      }

      return result.value;
    },
    onSuccess: () => {
      // Invalidate and refetch patient lists
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
    },
    onError: (error) => {
      console.error('Error creating patient:', error);
    },
  });
}

/**
 * Mutation hook for updating patient data
 * Automatically invalidates relevant queries after successful update
 */
export function useUpdatePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ patientId, data }: { patientId: string; data: UpdatePatientRequest }) => {
      const result = await updatePatient(patientId, data);
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao atualizar paciente');
      }

      return result.value;
    },
    onSuccess: (_, { patientId }) => {
      // Invalidate and refetch patient data
      queryClient.invalidateQueries({ queryKey: patientKeys.detail(patientId) });
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
    },
    onError: (error) => {
      console.error('Error updating patient:', error);
    },
  });
}

/**
 * Mutation hook for deleting patients
 * Automatically invalidates patient list after successful deletion
 */
export function useDeletePatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patientId: string) => {
      const result = await deletePatient(patientId);
      
      if (!result.success) {
        throw new Error(result.error || 'Erro ao excluir paciente');
      }

      return result.value;
    },
    onSuccess: () => {
      // Invalidate and refetch patient lists
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() });
    },
    onError: (error) => {
      console.error('Error deleting patient:', error);
    },
  });
}

/**
 * Utility function to prefetch patient data
 * Useful for preloading data on hover or navigation anticipation
 */
export function usePrefetchPatient() {
  const queryClient = useQueryClient();

  return (patientId: string) => {
    queryClient.prefetchQuery({
      queryKey: patientKeys.detail(patientId),
      queryFn: async () => {
        const [patientResult, attendancesResult] = await Promise.all([
          getPatientById(patientId),
          getAttendancesByPatient(patientId),
        ]);

        if (!patientResult.success || !patientResult.value) {
          throw new Error(patientResult.error || 'Paciente não encontrado');
        }

        if (attendancesResult.success && attendancesResult.value) {
          return transformPatientWithAttendances(
            patientResult.value,
            attendancesResult.value
          );
        } else {
          return transformSinglePatientFromApi(patientResult.value);
        }
      },
      staleTime: 10 * 60 * 1000,
    });
  };
}

/**
 * Hook to invalidate patient-related cache
 * Useful for manual cache refresh after external updates
 */
export function useInvalidatePatientCache() {
  const queryClient = useQueryClient();

  return {
    invalidatePatient: (patientId: string) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.detail(patientId) });
    },
    invalidatePatientAttendances: (patientId: string) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.attendances(patientId) });
    },
    invalidateAllPatients: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.all });
    },
  };
}
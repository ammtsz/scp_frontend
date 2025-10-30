import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTreatmentSessionsByPatient, deleteTreatmentSession } from '@/api/treatment-sessions';
import type { TreatmentSessionResponseDto } from '@/api/types';
import { treatmentIndicatorKeys } from './useTreatmentIndicators';

interface UseTreatmentSessionsResult {
  treatmentSessions: TreatmentSessionResponseDto[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

// Query keys for treatment sessions
export const treatmentSessionKeys = {
  all: ['treatmentSessions'] as const,
  byPatient: (patientId: string) => [...treatmentSessionKeys.all, 'patient', patientId] as const,
};

/**
 * Primary hook for treatment sessions using React Query
 * Provides better cache management and automatic refetching
 */
export const useTreatmentSessions = (patientId: number): UseTreatmentSessionsResult => {
  const {
    data: treatmentSessions = [],
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: treatmentSessionKeys.byPatient(patientId.toString()),
    queryFn: async () => {
      const response = await getTreatmentSessionsByPatient(patientId.toString());
      
      if (!response.success) {
        throw new Error(response.error || 'Erro ao carregar sessões de tratamento');
      }

      return response.value || [];
    },
    enabled: patientId > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });

  return {
    treatmentSessions,
    loading,
    error: error?.message || null,
    refetch: async () => {
      await refetch();
    },
  };
};



/**
 * Mutation hook for deleting treatment sessions
 * Automatically invalidates relevant queries after successful deletion
 */
export const useDeleteTreatmentSession = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string) => {
      const response = await deleteTreatmentSession(sessionId);
      
      if (!response.success) {
        throw new Error(response.error || 'Erro ao remover sessão de tratamento');
      }

      return response.value;
    },
    onSuccess: () => {
      // Invalidate treatment sessions queries for all patients
      queryClient.invalidateQueries({ queryKey: treatmentSessionKeys.all });
      
      // Also invalidate treatment indicators since they depend on treatment sessions by date
      queryClient.invalidateQueries({ queryKey: treatmentIndicatorKeys.all });
    },
  });
};
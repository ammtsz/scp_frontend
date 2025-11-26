import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getTreatmentSessions,
  createTreatmentSession,
  activateTreatmentSession,
  suspendTreatmentSession,
  completeTreatmentSession,
  cancelTreatmentSession,
  deleteTreatmentSession,
} from '@/api/treatment-sessions';
import { getPatients } from '@/api/patients';
import type { 
  TreatmentSessionResponseDto, 
  PatientResponseDto,
  CreateTreatmentSessionRequest,
  CompleteTreatmentSessionRequest,
  SuspendTreatmentSessionRequest,
} from '@/api/types';

// Query keys for treatment tracking
export const treatmentTrackingKeys = {
  all: ['treatmentTracking'] as const,
  sessions: () => [...treatmentTrackingKeys.all, 'sessions'] as const,
  patients: () => [...treatmentTrackingKeys.all, 'patients'] as const,
};

/**
 * Hook to fetch all treatment sessions
 */
export function useTreatmentSessions() {
  return useQuery({
    queryKey: treatmentTrackingKeys.sessions(),
    queryFn: async (): Promise<TreatmentSessionResponseDto[]> => {
      const response = await getTreatmentSessions();
      
      if (!response.success) {
        throw new Error(response.error || 'Erro ao carregar sessões de tratamento');
      }

      return response.value || [];
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - treatment data changes frequently
    retry: 2,
  });
}

/**
 * Hook to fetch all patients (for treatment tracking)
 */
export function useTreatmentTrackingPatients() {
  return useQuery({
    queryKey: treatmentTrackingKeys.patients(),
    queryFn: async (): Promise<PatientResponseDto[]> => {
      const response = await getPatients();
      
      if (!response.success) {
        throw new Error(response.error || 'Erro ao carregar pacientes');
      }

      return response.value || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes - patient data is more stable
    retry: 2,
  });
}

/**
 * Combined hook for treatment tracking data (sessions + patients)
 */
export function useTreatmentTrackingData() {
  const sessionsQuery = useTreatmentSessions();
  const patientsQuery = useTreatmentTrackingPatients();

  return {
    sessions: sessionsQuery.data || [],
    patients: patientsQuery.data || [],
    isLoading: sessionsQuery.isLoading || patientsQuery.isLoading,
    error: sessionsQuery.error || patientsQuery.error,
    refetch: async () => {
      await Promise.all([
        sessionsQuery.refetch(),
        patientsQuery.refetch(),
      ]);
    },
  };
}

/**
 * Mutation hook for creating treatment sessions
 */
export function useCreateTreatmentSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionData: CreateTreatmentSessionRequest): Promise<TreatmentSessionResponseDto> => {
      const response = await createTreatmentSession(sessionData);
      
      if (!response.success) {
        throw new Error(response.error || 'Erro ao criar sessão');
      }

      return response.value!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: treatmentTrackingKeys.sessions() });
    },
  });
}

/**
 * Mutation hook for activating treatment sessions
 */
export function useActivateTreatmentSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string): Promise<TreatmentSessionResponseDto> => {
      const response = await activateTreatmentSession(sessionId);
      
      if (!response.success) {
        throw new Error(response.error || 'Erro ao ativar sessão');
      }

      return response.value!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: treatmentTrackingKeys.sessions() });
    },
  });
}

/**
 * Mutation hook for suspending treatment sessions
 */
export function useSuspendTreatmentSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      sessionId, 
      suspensionData 
    }: { 
      sessionId: string; 
      suspensionData: SuspendTreatmentSessionRequest 
    }): Promise<TreatmentSessionResponseDto> => {
      const response = await suspendTreatmentSession(sessionId, suspensionData);
      
      if (!response.success) {
        throw new Error(response.error || 'Erro ao suspender sessão');
      }

      return response.value!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: treatmentTrackingKeys.sessions() });
    },
  });
}

/**
 * Mutation hook for completing treatment sessions
 */
export function useCompleteTreatmentSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      sessionId, 
      completionData 
    }: { 
      sessionId: string; 
      completionData: CompleteTreatmentSessionRequest 
    }): Promise<TreatmentSessionResponseDto> => {
      const response = await completeTreatmentSession(sessionId, completionData);
      
      if (!response.success) {
        throw new Error(response.error || 'Erro ao completar sessão');
      }

      return response.value!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: treatmentTrackingKeys.sessions() });
    },
  });
}

/**
 * Mutation hook for cancelling treatment sessions (sets status to cancelled)
 */
export function useCancelTreatmentSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string): Promise<TreatmentSessionResponseDto> => {
      const response = await cancelTreatmentSession(sessionId);
      
      if (!response.success) {
        throw new Error(response.error || 'Erro ao cancelar tratamento');
      }

      return response.value!;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: treatmentTrackingKeys.sessions() });
    },
  });
}

/**
 * Mutation hook for deleting treatment sessions (actual deletion - use with caution)
 */
export function useDeleteTreatmentSession() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (sessionId: string): Promise<void> => {
      const response = await deleteTreatmentSession(sessionId);
      
      if (!response.success) {
        throw new Error(response.error || 'Erro ao deletar tratamento');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: treatmentTrackingKeys.sessions() });
    },
  });
}
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getTreatmentSessionRecordsBySession, 
  completeTreatmentSessionRecord
} from '@/api/treatment-session-records';
import { updateTreatmentSession } from '@/api/treatment-sessions';
import type { CompleteTreatmentSessionRecordRequest } from '@/api/types';
import { treatmentSessionKeys } from './useTreatmentSessionsQueries';

// Query keys for treatment session records
export const treatmentSessionRecordKeys = {
  all: ['treatmentSessionRecords'] as const,
  bySession: (sessionId: string) => [...treatmentSessionRecordKeys.all, 'session', sessionId] as const,
};

/**
 * Hook to get treatment session records by session ID
 */
export const useTreatmentSessionRecords = (sessionId: number) => {
  return useQuery({
    queryKey: treatmentSessionRecordKeys.bySession(sessionId.toString()),
    queryFn: async () => {
      const response = await getTreatmentSessionRecordsBySession(sessionId.toString());
      
      if (!response.success) {
        throw new Error(response.error || 'Erro ao carregar registros de sessão');
      }

      return response.value || [];
    },
    enabled: sessionId > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: process.env.NODE_ENV === 'test' ? false : 2, // Don't retry in tests, but retry in production
  });
};

/**
 * Mutation hook for completing treatment session records
 * This handles both completing the record and updating the treatment session
 */
export const useCompleteTreatmentSessionRecord = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      recordId,
      sessionId,
      completionData,
      newCompletedCount
    }: {
      recordId: string;
      sessionId: string;
      completionData: CompleteTreatmentSessionRecordRequest;
      newCompletedCount: number;
    }) => {
      // 1. Complete the record
      const recordResponse = await completeTreatmentSessionRecord(recordId, completionData);
      
      if (!recordResponse.success) {
        throw new Error(recordResponse.error || 'Erro ao completar registro de sessão');
      }

      // 2. Update the treatment session progress
      const sessionResponse = await updateTreatmentSession(sessionId, {
        completed_sessions: newCompletedCount
      });

      if (!sessionResponse.success) {
        console.warn(`Failed to update session ${sessionId} progress:`, sessionResponse.error);
        // Don't throw here as the record was completed successfully
      }

      return {
        record: recordResponse.value,
        session: sessionResponse.value
      };
    },
    onSuccess: (_, variables) => {
      // Invalidate and refetch treatment session records for this session
      queryClient.invalidateQueries({ 
        queryKey: treatmentSessionRecordKeys.bySession(variables.sessionId) 
      });
      
      // Invalidate treatment sessions queries to update progress
      queryClient.invalidateQueries({ 
        queryKey: treatmentSessionKeys.all 
      });
    },
    onError: (error) => {
      console.error('Error completing treatment session record:', error);
    },
  });
};

/**
 * Bulk mutation for completing multiple treatment session records
 * Used when multiple treatments are completed in one session
 * This function fetches the records and finds the right ones to complete
 */
export const useBulkCompleteTreatmentSessionRecords = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (completions: Array<{
      sessionId: string;
      completionData: CompleteTreatmentSessionRecordRequest;
      newCompletedCount: number;
    }>) => {
      const results = [];
      
      for (const completion of completions) {
        try {
          // 1. Get existing records for this session
          const recordsResponse = await getTreatmentSessionRecordsBySession(completion.sessionId);
          
          if (!recordsResponse.success || !recordsResponse.value) {
            throw new Error(`Failed to get records for session ${completion.sessionId}: ${recordsResponse.error}`);
          }

          // 2. Find the next record to complete (next scheduled record)
          const nextRecordToComplete = recordsResponse.value.find(record => 
            record.status === 'scheduled' && record.session_number === completion.newCompletedCount
          );

          if (!nextRecordToComplete) {
            throw new Error(`No scheduled record found for session ${completion.sessionId} at session number ${completion.newCompletedCount}`);
          }

          // 3. Complete the record
          const recordResponse = await completeTreatmentSessionRecord(
            nextRecordToComplete.id.toString(), 
            completion.completionData
          );
          
          if (!recordResponse.success) {
            throw new Error(`Record ${nextRecordToComplete.id}: ${recordResponse.error}`);
          }

          // 4. Update the treatment session progress
          const sessionResponse = await updateTreatmentSession(completion.sessionId, {
            completed_sessions: completion.newCompletedCount
          });

          if (!sessionResponse.success) {
            console.warn(`Failed to update session ${completion.sessionId}:`, sessionResponse.error);
          }

          results.push({
            recordId: nextRecordToComplete.id.toString(),
            sessionId: completion.sessionId,
            success: true,
            record: recordResponse.value,
            session: sessionResponse.value
          });
        } catch (error) {
          results.push({
            recordId: `session_${completion.sessionId}`,
            sessionId: completion.sessionId,
            success: false,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }
      
      const failures = results.filter(r => !r.success);
      if (failures.length > 0) {
        throw new Error(`Falhou ao completar ${failures.length} registro(s) de sessão`);
      }
      
      return results;
    },
    onSuccess: (results) => {
      // Get unique session IDs to invalidate
      const sessionIds = [...new Set(results.map(r => r.sessionId))];
      
      // Invalidate treatment session records for all affected sessions
      sessionIds.forEach(sessionId => {
        queryClient.invalidateQueries({ 
          queryKey: treatmentSessionRecordKeys.bySession(sessionId) 
        });
      });
      
      // Invalidate treatment sessions queries to update progress
      queryClient.invalidateQueries({ 
        queryKey: treatmentSessionKeys.all 
      });
    },
    onError: (error) => {
      console.error('Error in bulk completing treatment session records:', error);
    },
  });
};
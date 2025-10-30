import { useQuery } from '@tanstack/react-query';
import { getTreatmentSessionsByDate } from '@/api/treatment-sessions';
import type { TreatmentSessionResponseDto } from '@/api/types';

export interface TreatmentInfo {
  hasLightBath: boolean;
  hasRod: boolean;
  lightBathColor?: string;
  lightBathDuration?: number;
  bodyLocations: string[];
  treatmentType: 'lightbath' | 'rod' | 'combined' | 'none';
}

export interface UseTreatmentIndicatorsReturn {
  treatmentsByPatient: Map<number, TreatmentInfo>;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

// Query keys for treatment indicators
export const treatmentIndicatorKeys = {
  all: ['treatmentIndicators'] as const,
  byDate: (date: string) => [...treatmentIndicatorKeys.all, 'date', date] as const,
};

/**
 * Hook to get treatment session information for a specific date using React Query
 * Used to determine which patients have treatments and show combined indicators
 */
export function useTreatmentIndicators(date: string): UseTreatmentIndicatorsReturn {
  const {
    data: treatmentsByPatient = new Map(),
    isLoading: loading,
    error: queryError,
    refetch,
  } = useQuery({
    queryKey: treatmentIndicatorKeys.byDate(date),
    queryFn: async () => {
      const result = await getTreatmentSessionsByDate(date);
      
      if (!result.success || !result.value) {
        throw new Error(result.error || 'Failed to load treatment sessions');
      }

      const treatmentMap = new Map<number, TreatmentInfo>();
      
      // Group sessions by patient
      const sessionsByPatient = result.value.reduce((acc: Record<number, TreatmentSessionResponseDto[]>, session: TreatmentSessionResponseDto) => {
        const patientId = session.patient_id;
        if (!acc[patientId]) {
          acc[patientId] = [];
        }
        acc[patientId].push(session);
        return acc;
      }, {});

      // Build treatment info for each patient
      Object.entries(sessionsByPatient).forEach(([patientIdStr, sessions]: [string, TreatmentSessionResponseDto[]]) => {
        const patientId = parseInt(patientIdStr);
        const hasLightBath = sessions.some((s: TreatmentSessionResponseDto) => s.treatment_type === 'light_bath');
        const hasRod = sessions.some((s: TreatmentSessionResponseDto) => s.treatment_type === 'rod');
        // Get light bath details
        const lightBathSession = sessions.find((s: TreatmentSessionResponseDto) => s.treatment_type === 'light_bath');
        
        // Collect all body locations from all sessions
        const allBodyLocations = sessions.flatMap((s: TreatmentSessionResponseDto) => s.body_location ? [s.body_location] : []);
        const uniqueBodyLocations = [...new Set(allBodyLocations)];
        
        // Determine treatment type
        let treatmentType: TreatmentInfo['treatmentType'] = 'none';
        if (hasLightBath && hasRod) {
          treatmentType = 'combined';
        } else if (hasLightBath) {
          treatmentType = 'lightbath';
        } else if (hasRod) {
          treatmentType = 'rod';
        }

        const treatmentInfo: TreatmentInfo = {
          hasLightBath,
          hasRod,
          lightBathColor: lightBathSession?.color,
          lightBathDuration: lightBathSession?.duration_minutes,
          bodyLocations: uniqueBodyLocations,
          treatmentType
        };

        treatmentMap.set(patientId, treatmentInfo);
      });

      return treatmentMap;
    },
    enabled: !!date, // Only run query if date is provided
    staleTime: 2 * 60 * 1000, // 2 minutes - treatment sessions change less frequently
    gcTime: 5 * 60 * 1000, // 5 minutes in cache
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  return {
    treatmentsByPatient,
    loading,
    error: queryError?.message || null,
    refresh: async () => {
      await refetch();
    }
  };
}
import { useState, useEffect, useCallback } from 'react';
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

/**
 * Hook to get treatment session information for a specific date
 * Used to determine which patients have treatments and show combined indicators
 */
export function useTreatmentIndicators(date: string): UseTreatmentIndicatorsReturn {
  const [treatmentsByPatient, setTreatmentsByPatient] = useState<Map<number, TreatmentInfo>>(new Map());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTreatmentSessions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getTreatmentSessionsByDate(date);
      
      if (result.success && result.value) {
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
          const allBodyLocations = sessions.flatMap((s: TreatmentSessionResponseDto) => s.body_locations || []);
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

        setTreatmentsByPatient(treatmentMap);
      } else {
        setError(result.error || 'Failed to load treatment sessions');
      }
    } catch (err) {
      console.error('Error fetching treatment sessions:', err);
      setError('Failed to load treatment sessions');
    } finally {
      setLoading(false);
    }
  }, [date]);

  useEffect(() => {
    if (date) {
      fetchTreatmentSessions();
    }
  }, [fetchTreatmentSessions, date]);

  return {
    treatmentsByPatient,
    loading,
    error,
    refresh: fetchTreatmentSessions
  };
}
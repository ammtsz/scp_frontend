import { useState, useEffect, useRef } from 'react';
import { getTreatmentSessionsByPatient } from '@/api/treatment-sessions';
import type { TreatmentSessionResponseDto } from '@/api/types';

interface UseTreatmentSessionsResult {
  treatmentSessions: TreatmentSessionResponseDto[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export const useTreatmentSessions = (patientId: number): UseTreatmentSessionsResult => {
  const [treatmentSessions, setTreatmentSessions] = useState<TreatmentSessionResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const patientIdRef = useRef(patientId);
  
  // Update ref when patientId changes
  patientIdRef.current = patientId;

  const fetchTreatmentSessions = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await getTreatmentSessionsByPatient(patientIdRef.current.toString());
      
      if (response.success && response.value) {
        setTreatmentSessions(response.value);
      } else {
        setError(response.error || 'Erro ao carregar sessões de tratamento');
        setTreatmentSessions([]);
      }
    } catch {
      setError('Erro ao carregar sessões de tratamento');
      setTreatmentSessions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (patientId > 0) {
      fetchTreatmentSessions();
    }
  }, [patientId]); // ✅ Only patientId dependency

  return {
    treatmentSessions,
    loading,
    error,
    refetch: fetchTreatmentSessions,
  };
};
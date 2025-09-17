import { useState, useEffect, useCallback, useMemo } from 'react';
import { getTreatmentSessionsByPatient } from '@/api/treatment-sessions';
import type { TreatmentSessionResponseDto, TreatmentSessionRecordResponseDto } from '@/api/types';

export interface TreatmentProgress {
  treatmentType: 'light_bath' | 'rod' | 'spiritual';
  currentSession: number;
  totalSessions: number;
  completedSessions: number;
  progressPercentage: number;
  status: 'not_started' | 'in_progress' | 'completed' | 'paused';
  nextSessionDate?: string;
  lastCompletedDate?: string;
  estimatedCompletionDate?: string;
}

export interface TreatmentStatistics {
  totalTreatments: number;
  activeTreatments: number;
  completedTreatments: number;
  upcomingSessions: number;
  overallProgress: number;
}

interface UseProgressTrackingProps {
  patientId: number;
  /** Automatically refresh data at intervals */
  autoRefresh?: boolean;
  /** Refresh interval in milliseconds */
  refreshInterval?: number;
  /** Filter by treatment type */
  treatmentType?: 'light_bath' | 'rod' | 'spiritual';
}

interface UseProgressTrackingReturn {
  /** Individual treatment progress data */
  treatmentProgress: TreatmentProgress[];
  /** Overall treatment statistics */
  statistics: TreatmentStatistics;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: string | null;
  /** Manual refresh function */
  refresh: () => Promise<void>;
  /** Clear error */
  clearError: () => void;
  /** Get progress for specific treatment type */
  getProgressByType: (type: 'light_bath' | 'rod' | 'spiritual') => TreatmentProgress | null;
  /** Check if patient has active treatments */
  hasActiveTreatments: boolean;
  /** Get next upcoming session */
  nextUpcomingSession: { date: string; type: string } | null;
}

/**
 * useProgressTracking - Hook for managing treatment session progress tracking
 */
export function useProgressTracking({
  patientId,
  autoRefresh = false,
  refreshInterval = 30000, // 30 seconds
  treatmentType,
}: UseProgressTrackingProps): UseProgressTrackingReturn {
  const [treatmentSessions, setTreatmentSessions] = useState<TreatmentSessionResponseDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Calculate progress for each treatment session
  const treatmentProgress = useMemo((): TreatmentProgress[] => {
    return treatmentSessions
      .filter(session => !treatmentType || session.treatment_type === treatmentType)
      .map(session => {
        const completedSessions = session.completed_sessions || 0;
        const totalSessions = session.planned_sessions || 1;
        const currentSession = Math.min(completedSessions + 1, totalSessions);
        const progressPercentage = Math.round((completedSessions / totalSessions) * 100);

        // Determine status
        let status: TreatmentProgress['status'] = 'not_started';
        if (completedSessions === 0) {
          status = 'not_started';
        } else if (completedSessions === totalSessions) {
          status = 'completed';
        } else {
          status = 'in_progress';
        }

        // Calculate next session date (assuming weekly sessions on Tuesdays)
        let nextSessionDate: string | undefined;
        if (status !== 'completed') {
          const startDate = new Date(session.start_date);
          const weeksToAdd = completedSessions;
          const nextDate = new Date(startDate);
          nextDate.setDate(nextDate.getDate() + (weeksToAdd * 7));
          nextSessionDate = nextDate.toISOString().split('T')[0];
        }

        // Estimate completion date
        let estimatedCompletionDate: string | undefined;
        if (status !== 'completed') {
          const startDate = new Date(session.start_date);
          const weeksToCompletion = totalSessions - 1; // -1 because start date is first session
          const completionDate = new Date(startDate);
          completionDate.setDate(completionDate.getDate() + (weeksToCompletion * 7));
          estimatedCompletionDate = completionDate.toISOString().split('T')[0];
        }

        // Get last completed date (from session records if available)
        let lastCompletedDate: string | undefined;
        if (completedSessions > 0 && session.sessionRecords && session.sessionRecords.length > 0) {
          const lastRecord = session.sessionRecords
            .filter((record: TreatmentSessionRecordResponseDto) => record.status === 'completed')
            .sort((a: TreatmentSessionRecordResponseDto, b: TreatmentSessionRecordResponseDto) => 
              new Date(b.end_time || b.scheduled_date).getTime() - new Date(a.end_time || a.scheduled_date).getTime())[0];
          if (lastRecord) {
            lastCompletedDate = lastRecord.end_time || lastRecord.scheduled_date;
          }
        }

        return {
          treatmentType: session.treatment_type,
          currentSession,
          totalSessions,
          completedSessions,
          progressPercentage,
          status,
          nextSessionDate,
          lastCompletedDate,
          estimatedCompletionDate,
        };
      });
  }, [treatmentSessions, treatmentType]);

  // Calculate overall statistics
  const statistics = useMemo((): TreatmentStatistics => {
    const totalTreatments = treatmentProgress.length;
    const activeTreatments = treatmentProgress.filter(t => t.status === 'in_progress').length;
    const completedTreatments = treatmentProgress.filter(t => t.status === 'completed').length;
    
    const upcomingSessions = treatmentProgress.reduce((sum, treatment) => {
      return sum + (treatment.totalSessions - treatment.completedSessions);
    }, 0);

    const overallProgress = totalTreatments > 0 
      ? Math.round(treatmentProgress.reduce((sum, t) => sum + t.progressPercentage, 0) / totalTreatments)
      : 0;

    return {
      totalTreatments,
      activeTreatments,
      completedTreatments,
      upcomingSessions,
      overallProgress,
    };
  }, [treatmentProgress]);

  // Check if patient has active treatments
  const hasActiveTreatments = useMemo(() => {
    return treatmentProgress.some(t => t.status === 'in_progress' || t.status === 'not_started');
  }, [treatmentProgress]);

  // Get next upcoming session
  const nextUpcomingSession = useMemo(() => {
    const upcomingSessions = treatmentProgress
      .filter(t => t.nextSessionDate && t.status !== 'completed')
      .map(t => ({
        date: t.nextSessionDate!,
        type: t.treatmentType,
        typeLabel: t.treatmentType === 'light_bath' ? 'Banho de Luz' : 
                   t.treatmentType === 'rod' ? 'Bastão' : 'Espiritual'
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return upcomingSessions.length > 0 ? {
      date: upcomingSessions[0].date,
      type: upcomingSessions[0].typeLabel
    } : null;
  }, [treatmentProgress]);

  // Fetch treatment sessions data
  const fetchTreatmentSessions = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await getTreatmentSessionsByPatient(patientId.toString());
      if (response.success && response.value) {
        setTreatmentSessions(response.value);
      } else {
        setError(response.error || 'Erro ao carregar sessões de tratamento');
      }
    } catch (err) {
      setError('Erro ao carregar dados de progresso do tratamento');
      console.error('Error fetching treatment sessions:', err);
    } finally {
      setIsLoading(false);
    }
  }, [patientId]);

  // Manual refresh function
  const refresh = useCallback(async () => {
    await fetchTreatmentSessions();
  }, [fetchTreatmentSessions]);

  // Clear error function
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Get progress for specific treatment type
  const getProgressByType = useCallback((type: 'light_bath' | 'rod' | 'spiritual') => {
    return treatmentProgress.find(p => p.treatmentType === type) || null;
  }, [treatmentProgress]);

  // Initial data fetch
  useEffect(() => {
    fetchTreatmentSessions();
  }, [fetchTreatmentSessions]);

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchTreatmentSessions();
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchTreatmentSessions]);

  return {
    treatmentProgress,
    statistics,
    isLoading,
    error,
    refresh,
    clearError,
    getProgressByType,
    hasActiveTreatments,
    nextUpcomingSession,
  };
}

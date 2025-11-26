import { useState, useMemo } from 'react';
import { useTreatmentFilters } from './useTreatmentFilters';
import type { CreateTreatmentSessionRequest } from '@/api/types';
import {
  useTreatmentTrackingData,
  useCreateTreatmentSession,
  useCompleteTreatmentSession,
  useCancelTreatmentSession,
} from './useTreatmentTrackingQueries';

export function useTreatmentTracking() {
  const [expandedTreatmentId, setExpandedTreatmentId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Get data and mutations from React Query
  const { sessions, patients, isLoading, error, refetch } = useTreatmentTrackingData();
  const createSessionMutation = useCreateTreatmentSession();
  const completeSessionMutation = useCompleteTreatmentSession();
  const cancelSessionMutation = useCancelTreatmentSession();

  // Initialize filter system
  const {
    filters,
    filterSessions,
    updateSearchTerm,
    updateTreatmentTypes,
    updateStatuses,
    updateDateRange,
    setDatePreset,
    clearFilters,
    hasActiveFilters,
    savedPresets,
    savePreset,
    loadPreset,
    deletePreset,
  } = useTreatmentFilters();

  // Apply filters to sessions
  const filteredSessions = useMemo(() => {
    return filterSessions(sessions, patients);
  }, [sessions, patients, filterSessions]);

  // Helper function to get patient name
  const getPatientName = (patientId: number) => {
    const patient = patients.find((p) => p.id === patientId);
    return patient?.name || `Paciente #${patientId}`;
  };

  // Expand/collapse treatment functionality
  const handleToggleExpanded = (sessionId: string) => {
    const wasExpanded = expandedTreatmentId === sessionId;
    setExpandedTreatmentId(wasExpanded ? null : sessionId);

    // Scroll to treatment card when expanding (after a short delay for animation)
    if (!wasExpanded) {
      setTimeout(() => {
        const element = document.getElementById(`treatment-card-${sessionId}`);
        if (element) {
          element.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
            inline: 'nearest',
          });
        }
      }, 100);
    }
  };

  // Modal handlers
  const openCreateModal = () => setIsCreateModalOpen(true);
  const closeCreateModal = () => setIsCreateModalOpen(false);

  // Create session handler
  const handleCreateSession = async (sessionData: CreateTreatmentSessionRequest) => {
    if (patients.length === 0) {
      throw new Error('Nenhum paciente disponível');
    }

    await createSessionMutation.mutateAsync(sessionData);
  };

  // Complete session handler
  const handleCompleteSession = async (sessionId: string) => {
    await completeSessionMutation.mutateAsync({
      sessionId,
      completionData: {
        completion_notes: 'Tratamento completado com sucesso',
      },
    });
  };

  // Cancel session handler
  const handleCancelSession = async (sessionId: string) => {
    // Show confirmation dialog
    const confirmed = window.confirm(
      'Tem certeza que deseja cancelar este tratamento? O status será alterado para cancelado.'
    );
    
    if (!confirmed) return;

    await cancelSessionMutation.mutateAsync(sessionId);
    
    // Close expanded view if this treatment was expanded
    if (expandedTreatmentId === sessionId) {
      setExpandedTreatmentId(null);
    }
  };

  // Aggregate loading and error states
  const isAnyMutationLoading = 
    createSessionMutation.isPending ||
    completeSessionMutation.isPending ||
    cancelSessionMutation.isPending;

  const mutationError = 
    createSessionMutation.error ||
    completeSessionMutation.error ||
    cancelSessionMutation.error;

  return {
    // Data
    sessions,
    patients,
    filteredSessions,
    expandedTreatmentId,

    // Modal state
    isCreateModalOpen,
    openCreateModal,
    closeCreateModal,

    // Loading states
    isLoading: isLoading || isAnyMutationLoading,
    
    // Error states
    error: error?.message || mutationError?.message || null,

    // Filter system
    filters,
    updateSearchTerm,
    updateTreatmentTypes,
    updateStatuses,
    updateDateRange,
    setDatePreset,
    clearFilters,
    hasActiveFilters,
    savedPresets,
    savePreset,
    loadPreset,
    deletePreset,

    // Actions
    handleCreateSession,
    handleCompleteSession,
    handleCancelSession,
    handleToggleExpanded,
    refetch,
    getPatientName,

    // Mutation states for UI feedback
    isCreating: createSessionMutation.isPending,
    isCompleting: completeSessionMutation.isPending,
    isCanceling: cancelSessionMutation.isPending,
  };
}
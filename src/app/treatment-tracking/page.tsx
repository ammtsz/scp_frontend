"use client";

import React from "react";
import { TreatmentCard } from "@/components/TreatmentTracking/TreatmentCard";
import { FilterBar } from "@/components/TreatmentTracking/FilterBar";
import { CreateTreatmentSessionModal } from "@/components/TreatmentTracking/CreateTreatmentSessionModal";
import { useTreatmentTracking } from "@/hooks/useTreatmentTracking";
import type { CreateTreatmentSessionRequest } from "@/api/types";

export default function TreatmentTrackingPage() {
  // Use the custom hook for all treatment tracking logic
  const {
    filteredSessions,
    patients,
    expandedTreatmentId,
    isLoading,
    error,
    isCreateModalOpen,
    openCreateModal,
    closeCreateModal,
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
    handleCreateSession,
    handleActivateSession,
    handleSuspendSession,
    handleCompleteSession,
    handleCancelSession,
    handleToggleExpanded,
    refetch,
    getPatientName,
    isCreating,
  } = useTreatmentTracking();

  // Handle create session with proper error handling
  const handleCreateSessionWithFeedback = async (sessionData: CreateTreatmentSessionRequest) => {
    try {
      await handleCreateSession(sessionData);
    } catch (err) {
      alert(err instanceof Error ? err.message : "Erro ao criar sessão");
    }
  };

  // Handle other actions with proper error handling
  const handleActionWithFeedback = async (
    action: () => Promise<void>,
    errorMessage: string
  ) => {
    try {
      await action();
    } catch (err) {
      alert(err instanceof Error ? err.message : errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">
              Carregando sistema de acompanhamento...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Acompanhamento de Tratamentos
          </h1>
          <p className="text-gray-600">
            Sistema completo para gerenciar sessões de tratamento e registros
            individuais
          </p>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center gap-2">
              <span className="text-red-500">❌</span>
              <p className="text-red-700">{error}</p>
            </div>
            <button
              onClick={() =>
                handleActionWithFeedback(refetch, "Erro ao recarregar dados")
              }
              className="mt-2 px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
            >
              Tentar novamente
            </button>
          </div>
        )}

        {/* Filter Bar */}
        <div className="mb-6">
          <FilterBar
            searchTerm={filters.searchTerm}
            onSearchChange={updateSearchTerm}
            treatmentTypes={filters.treatmentTypes}
            onTreatmentTypesChange={updateTreatmentTypes}
            statuses={filters.statuses}
            onStatusesChange={updateStatuses}
            dateRange={filters.dateRange}
            onDateRangeChange={updateDateRange}
            onDatePresetChange={setDatePreset}
            onClearFilters={clearFilters}
            hasActiveFilters={hasActiveFilters}
            savedPresets={savedPresets}
            onSavePreset={savePreset}
            onLoadPreset={loadPreset}
            onRemovePreset={deletePreset}
            resultCount={filteredSessions.length}
          />
        </div>

        <div className="flex gap-2 mb-6">
          <button
            onClick={openCreateModal}
            disabled={isCreating}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCreating ? "⏳ Criando..." : "➕ Criar Nova Sessão"}
          </button>
          <button
            onClick={() =>
              handleActionWithFeedback(refetch, "Erro ao atualizar dados")
            }
            className="px-4 py-2 bg-gray-600 text-white font-medium rounded-lg hover:bg-gray-700 transition-colors"
          >
            🔄 Atualizar
          </button>
        </div>

        {/* Treatment Sessions with Expandable Records */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Tratamentos ({filteredSessions.length})
          </h2>

          {filteredSessions.length === 0 ? (
            <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
              <p className="text-gray-500">
                {hasActiveFilters
                  ? "Nenhum tratamento encontrado com os filtros aplicados."
                  : "Nenhum tratamento encontrado."}
              </p>
              {!hasActiveFilters && (
                <button
                  onClick={openCreateModal}
                  disabled={isCreating}
                  className="mt-3 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isCreating ? "Criando..." : "Criar primeira sessão"}
                </button>
              )}
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-3 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                >
                  Limpar filtros
                </button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {filteredSessions.map((session) => (
                <div
                  key={session.id}
                  id={`treatment-card-${session.id}`}
                  className="relative scroll-mt-24"
                >
                  <TreatmentCard
                    session={session}
                    patientName={getPatientName(session.patient_id)}
                    onActivate={(id) =>
                      handleActionWithFeedback(
                        () => handleActivateSession(id),
                        "Erro ao ativar sessão"
                      )
                    }
                    onSuspend={(id) =>
                      handleActionWithFeedback(
                        () => handleSuspendSession(id),
                        "Erro ao suspender sessão"
                      )
                    }
                    onComplete={(id) =>
                      handleActionWithFeedback(
                        () => handleCompleteSession(id),
                        "Erro ao completar sessão"
                      )
                    }
                    onCancel={(id) =>
                      handleActionWithFeedback(
                        () => handleCancelSession(id),
                        "Erro ao cancelar tratamento"
                      )
                    }
                    isExpanded={expandedTreatmentId === session.id.toString()}
                    onToggleExpanded={handleToggleExpanded}
                    onRecordUpdate={() =>
                      handleActionWithFeedback(
                        refetch,
                        "Erro ao atualizar dados"
                      )
                    }
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Create Treatment Session Modal */}
        <CreateTreatmentSessionModal
          isOpen={isCreateModalOpen}
          onClose={closeCreateModal}
          onSubmit={handleCreateSessionWithFeedback}
          patients={patients}
          isLoading={isCreating}
        />
      </div>
    </div>
  );
}

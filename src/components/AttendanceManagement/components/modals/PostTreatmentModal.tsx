import React, { useState, useEffect } from "react";

import { useCloseModal, usePostTreatmentModal } from "@/stores/modalStore";
import { useTreatmentSessions } from "@/hooks/useTreatmentSessionsQueries";
import { useBulkCompleteTreatmentSessionRecords } from "@/hooks/useTreatmentSessionRecordsQueries";
import type { TreatmentSessionResponseDto } from "@/api/types";

// Use the actual backend type instead of custom interface
type TreatmentSession = TreatmentSessionResponseDto;

// Interface for individual treatment cards (one per body location)
interface TreatmentCard {
  id: string; // Unique identifier for the card
  treatmentType: "light_bath" | "rod";
  bodyLocation: string;
  sessions: TreatmentSession[];
  color?: string;
  durationMinutes?: number;
  totalPlannedSessions: number;
  totalCompletedSessions: number;
}

const PostTreatmentModal: React.FC = () => {
  const [completedTreatments, setCompletedTreatments] = useState<
    Set<string> // Now using "treatmentType_bodyLocation" as key
  >(new Set());
  const [generalNotes, setGeneralNotes] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const postTreatment = usePostTreatmentModal();
  const closeModal = useCloseModal();

  // React Query mutations
  const bulkCompleteRecords = useBulkCompleteTreatmentSessionRecords();
  const isSubmitting = bulkCompleteRecords.isPending;

  const {
    isOpen,
    patientId,
    patientName,
    // attendanceType,
    onComplete,
  } = postTreatment;

  // Fetch treatment sessions for this patient
  const {
    treatmentSessions,
    loading: treatmentSessionsLoading,
    error: treatmentSessionsError,
    // refetch: refetchTreatmentSessions,
  } = useTreatmentSessions(patientId || 0);


  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCompletedTreatments(new Set());
      setGeneralNotes("");
      setSubmitError(null);
      setSubmitSuccess(false);
    }
  }, [isOpen]);

  // Create individual cards for each body location
  const treatmentCards = React.useMemo(() => {
    const cards: TreatmentCard[] = [];

    treatmentSessions.forEach((session) => {
      // Create a card for this specific body location
      const cardId = `${session.treatment_type}_${session.body_location}`;

      // Check if we already have a card for this treatment type + body location
      let existingCard = cards.find((card) => card.id === cardId);

      if (!existingCard) {
        existingCard = {
          id: cardId,
          treatmentType: session.treatment_type,
          bodyLocation: session.body_location,
          sessions: [],
          color: session.color,
          durationMinutes: session.duration_minutes,
          totalPlannedSessions: 0,
          totalCompletedSessions: 0,
        };
        cards.push(existingCard);
      }

      // Add this session to the card
      existingCard.sessions.push(session);
      existingCard.totalPlannedSessions += session.planned_sessions;
      existingCard.totalCompletedSessions += session.completed_sessions;
    });

    return cards;
  }, [treatmentSessions]);

  const toggleTreatmentCompletion = (cardId: string) => {
    setCompletedTreatments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  const canSubmit = () => {
    return completedTreatments.size > 0;
  };

  const handleSubmit = async () => {
    if (!canSubmit()) {
      setSubmitError(
        "Marque pelo menos um tratamento como realizado nesta sessão."
      );
      return;
    }

    setSubmitError(null);
    setSubmitSuccess(false);

    try {
      // Create the data structure expected by the parent component
      const completedLocationsBySession: Record<number, string[]> = {};

      // For each completed treatment card, mark the sessions with that specific body location
      completedTreatments.forEach((cardId) => {
        const card = treatmentCards.find((c) => c.id === cardId);
        if (card) {
          card.sessions.forEach((session) => {
            if (!completedLocationsBySession[session.id]) {
              completedLocationsBySession[session.id] = [];
            }
            // Only add this specific body location for this session
            if (
              !completedLocationsBySession[session.id].includes(
                card.bodyLocation
              )
            ) {
              completedLocationsBySession[session.id].push(card.bodyLocation);
            }
          });
        }
      });

      // Prepare completions for React Query mutation
      const completions = [];
      
      for (const [sessionId, locations] of Object.entries(completedLocationsBySession)) {
        const session = treatmentSessions.find(s => s.id === parseInt(sessionId));
        if (!session) continue;

        completions.push({
          sessionId: sessionId,
          completionData: {
            notes: generalNotes || `Tratamento realizado para: ${locations.join(', ')}`
          },
          newCompletedCount: session.completed_sessions + 1
        });
      }

      // Execute bulk completion using React Query mutation
      await bulkCompleteRecords.mutateAsync(completions);
      


      // Notify that the completion was successful
      if (onComplete) {
        onComplete(true);
      }

      setSubmitSuccess(true);

      // Auto-close after successful submission
      setTimeout(() => {
        handleClose();
      }, 1000);
    } catch (error) {
      console.error("Error completing treatment:", error);
      setSubmitError("Erro ao completar o tratamento. Tente novamente.");
    }
  };

  const handleClose = () => {
    setCompletedTreatments(new Set());
    setGeneralNotes("");
    setSubmitError(null);
    setSubmitSuccess(false);
    closeModal("postTreatment");
  };

  const getTreatmentTypeLabel = (type: "light_bath" | "rod") => {
    return type === "light_bath" ? "Banho de Luz" : "Bastão";
  };

  const getTreatmentBorderColor = (type: "light_bath" | "rod") => {
    return type === "light_bath" ? "border-l-yellow-400" : "border-l-blue-400";
  };

  const getTreatmentIconColor = (type: "light_bath" | "rod") => {
    return type === "light_bath" ? "text-yellow-600" : "text-blue-600";
  };

  const getProgressPercentage = (card: TreatmentCard) => {
    if (card.totalPlannedSessions === 0) return 0;
    return Math.round(
      (card.totalCompletedSessions / card.totalPlannedSessions) * 100
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gray-60 px-6 py-4 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Registrar Sessão de Tratamento
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Paciente: {patientName}
              </p>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-light"
              disabled={isSubmitting}
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {treatmentSessionsLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">Carregando tratamentos...</div>
            </div>
          ) : treatmentSessionsError ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-red-600">
                Erro ao carregar tratamentos: {treatmentSessionsError}
              </div>
            </div>
          ) : treatmentCards.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-gray-500">
                Nenhum tratamento ativo encontrado para este paciente.
              </div>
            </div>
          ) : (
            <>
              {/* Instructions */}
              <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h3 className="font-medium text-blue-900 mb-2">
                  Como usar esta tela:
                </h3>
                <p className="text-sm text-blue-800">
                  Marque os tratamentos que foram realizados nesta sessão. Cada
                  tratamento mostra o progresso atual e você pode clicar no
                  botão para indicar que foi feito hoje.
                </p>
              </div>

              {/* Treatment Cards */}
              <div className="space-y-4">
                {treatmentCards.map((card) => {
                  const isCompleted = completedTreatments.has(card.id);
                  const progressPercentage = getProgressPercentage(card);

                  return (
                    <div
                      key={card.id}
                      className={`bg-white border-l-4 ${getTreatmentBorderColor(
                        card.treatmentType
                      )} border-r border-t border-b border-gray-200 rounded-r-lg shadow-sm transition-all duration-200 ${
                        isCompleted
                          ? "ring-2 ring-green-300 bg-green-50"
                          : "hover:shadow-md"
                      }`}
                    >
                      <div className="p-5">
                        {/* Treatment Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span
                                className={`text-lg ${getTreatmentIconColor(
                                  card.treatmentType
                                )}`}
                              >
                                {card.treatmentType === "light_bath"
                                  ? "✨"
                                  : "🔸"}
                              </span>
                              <h3 className="font-semibold text-lg text-gray-900">
                                {getTreatmentTypeLabel(card.treatmentType)}
                              </h3>
                            </div>

                            {/* Treatment Details */}
                            <div className="space-y-1 text-sm text-gray-600">
                              <div>
                                <span className="font-medium">Local:</span>{" "}
                                {card.bodyLocation}
                              </div>
                              {card.color && (
                                <div>
                                  <span className="font-medium">Cor:</span>{" "}
                                  {card.color}
                                </div>
                              )}
                              {card.durationMinutes && (
                                <div>
                                  <span className="font-medium">Duração:</span>{" "}
                                  {card.durationMinutes} min
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Progress Circle */}
                          <div className="text-center">
                            <div className="text-lg font-bold text-gray-900">
                              {card.totalCompletedSessions}/
                              {card.totalPlannedSessions}
                            </div>
                            <div className="text-xs text-gray-500">sessões</div>
                            <div className="text-xs text-gray-500">
                              {progressPercentage}% completo
                            </div>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="mb-4">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all duration-300 ${
                                card.treatmentType === "light_bath"
                                  ? "bg-yellow-400"
                                  : "bg-blue-400"
                              }`}
                              style={{ width: `${progressPercentage}%` }}
                            />
                          </div>
                        </div>

                        {/* Action Button */}
                        <button
                          type="button"
                          onClick={() => toggleTreatmentCompletion(card.id)}
                          disabled={isSubmitting}
                          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                            isCompleted
                              ? "bg-green-600 text-white hover:bg-green-700"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                          } disabled:opacity-50`}
                        >
                          {isCompleted ? (
                            <span className="flex items-center justify-center gap-2">
                              <span>✓</span>
                              Realizado nesta sessão
                            </span>
                          ) : (
                            "Marcar como realizado nesta sessão"
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* General Notes */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Observações Gerais (Opcional):
                </label>
                <textarea
                  value={generalNotes}
                  onChange={(e) => setGeneralNotes(e.target.value)}
                  placeholder="Adicione observações sobre a sessão de tratamento..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t">
          {/* Error and Success Messages */}
          {submitError && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              <span className="font-medium">Erro:</span> {submitError}
            </div>
          )}
          {submitSuccess && (
            <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
              <span className="font-medium">Sucesso:</span> Sessão registrada
              com sucesso!
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="text-sm">
              {canSubmit() ? (
                <span className="text-green-600 font-medium bg-green-100 px-3 py-1 rounded-full">
                  ✓ Pronto para registrar
                </span>
              ) : (
                <span className="text-orange-600 font-medium bg-orange-100 px-3 py-1 rounded-full">
                  ⚠️ Marque pelo menos um tratamento
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="button text-gray-700 border border-gray-300 bg-white hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit() || isSubmitting}
                className="button text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition-colors"
              >
                {isSubmitting ? "Registrando..." : "Registrar Sessão"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostTreatmentModal;

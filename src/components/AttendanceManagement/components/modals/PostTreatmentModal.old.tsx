import React, { useState, useEffect } from "react";
import type { TreatmentInfo } from "@/hooks/useTreatmentIndicators";

interface TreatmentSession {
  id: number;
  treatmentType: "light_bath" | "rod";
  bodyLocations: string[];
  startDate: string;
  plannedSessions: number;
  completedSessions: number;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  color?: string;
  durationMinutes?: number;
}

interface PostTreatmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (
    completedLocations: Record<number, string[]>,
    notes: string
  ) => void;
  patientId: number;
  patientName: string;
  treatmentInfo: TreatmentInfo;
  treatmentSessions: TreatmentSession[];
  isLoadingSessions?: boolean;
}

// New interface for the redesigned modal
interface TreatmentGroup {
  type: "light_bath" | "rod";
  sessions: TreatmentSession[];
  bodyLocations: string[];
  color?: string;
  durationMinutes?: number;
  totalPlannedSessions: number;
  totalCompletedSessions: number;
}

interface SessionCompletion {
  treatmentType: "light_bath" | "rod";
  sessionIds: number[];
  completedThisSession: boolean;
}

const PostTreatmentModal: React.FC<PostTreatmentModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  patientName,
  treatmentInfo,
  treatmentSessions,
  isLoadingSessions = false,
}) => {
  const [sessionProgress, setSessionProgress] = useState<
    Record<number, SessionProgress>
  >({});
  const [generalNotes, setGeneralNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Initialize session progress state
  useEffect(() => {
    if (isOpen && treatmentSessions.length > 0) {
      const initialProgress: Record<number, SessionProgress> = {};
      treatmentSessions.forEach((session) => {
        initialProgress[session.id] = {
          sessionId: session.id,
          completedLocations: [],
          notes: "",
        };
      });
      setSessionProgress(initialProgress);
      setGeneralNotes(""); // Reset general notes when opening
    }
  }, [isOpen, treatmentSessions]);

  const toggleLocationCompletion = (sessionId: number, location: string) => {
    setSessionProgress((prev) => {
      const sessionData = prev[sessionId];
      const isCompleted = sessionData.completedLocations.includes(location);

      return {
        ...prev,
        [sessionId]: {
          ...sessionData,
          completedLocations: isCompleted
            ? sessionData.completedLocations.filter((loc) => loc !== location)
            : [...sessionData.completedLocations, location],
        },
      };
    });
  };

  const updateSessionNotes = (sessionId: number, notes: string) => {
    setSessionProgress((prev) => ({
      ...prev,
      [sessionId]: {
        ...prev[sessionId],
        notes,
      },
    }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    
    try {
      // Extract completed locations by session
      const completedLocationsBySession: Record<number, string[]> = {};
      Object.entries(sessionProgress).forEach(([sessionId, progress]) => {
        if (progress.completedLocations.length > 0) {
          completedLocationsBySession[parseInt(sessionId)] =
            progress.completedLocations;
        }
      });

      // Validate that at least one session has completed locations
      if (Object.keys(completedLocationsBySession).length === 0) {
        setSubmitError("Por favor, marque pelo menos um local como tratado antes de completar.");
        return;
      }

      await onComplete(completedLocationsBySession, generalNotes);
      setSubmitSuccess(true);
      
      // Auto-close after successful submission
      setTimeout(() => {
        handleClose();
      }, 1000);
    } catch (error) {
      console.error("Error completing treatment:", error);
      setSubmitError("Erro ao completar o tratamento. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSessionProgress({});
    setGeneralNotes("");
    setIsSubmitting(false);
    setSubmitError(null);
    setSubmitSuccess(false);
    onClose();
  };

  const getTreatmentTypeLabel = (type: "light_bath" | "rod") => {
    return type === "light_bath" ? "Banho de Luz" : "Bastão";
  };

  const getTreatmentTypeColor = (type: "light_bath" | "rod") => {
    return type === "light_bath"
      ? "bg-yellow-100 border-yellow-300"
      : "bg-blue-100 border-blue-300";
  };

  const getProgressPercentage = (session: TreatmentSession) => {
    return Math.round(
      (session.completedSessions / session.plannedSessions) * 100
    );
  };

  const isSessionComplete = (sessionId: number) => {
    const session = treatmentSessions.find((s) => s.id === sessionId);
    const progress = sessionProgress[sessionId];

    if (!session || !progress) return false;

    // Check if all body locations for this session have been completed
    return session.bodyLocations.every((location) =>
      progress.completedLocations.includes(location)
    );
  };

  const canSubmit = () => {
    // At least one session should have some completed locations
    return Object.values(sessionProgress).some(
      (progress) => progress.completedLocations.length > 0
    );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-white text-black px-6 py-4 border-b border-gray-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">
                Finalizar {treatmentSessions.length > 0 ? "sessões" : "sessão"}{" "}
                de {patientName}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="text-gray-700 hover:text-gray-900 text-2xl"
              disabled={isSubmitting}
            >
              ×
            </button>
          </div>
        </div>
        <div>{treatmentInfo.treatmentType}</div>
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          {/* Treatment Overview */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Resumo do Tratamento</h3>
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex items-center gap-4 text-sm">
                <span className="font-medium">Tipos:</span>
                {treatmentInfo.hasLightBath && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded">
                    Banho de Luz
                  </span>
                )}
                {treatmentInfo.hasRod && (
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded">
                    Bastão
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoadingSessions && (
            <div className="flex items-center justify-center py-8">
              <div className="flex items-center gap-3 text-gray-600">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                <span>Carregando sessões de tratamento...</span>
              </div>
            </div>
          )}

          {/* Treatment Sessions */}
          {!isLoadingSessions && (
            <div className="space-y-6">
              {treatmentSessions.map((session) => {
              const progress = sessionProgress[session.id];
              const progressPercentage = getProgressPercentage(session);
              const sessionComplete = isSessionComplete(session.id);

              return (
                <div
                  key={session.id}
                  className={`border rounded-lg p-4 ${getTreatmentTypeColor(
                    session.treatmentType
                  )}`}
                >
                  {/* Session Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-semibold text-lg">
                        {getTreatmentTypeLabel(session.treatmentType)}
                      </h4>
                      {session.treatmentType === "light_bath" &&
                        session.color && (
                          <p className="text-sm text-gray-600">
                            Cor: {session.color} | Duração:{" "}
                            {session.durationMinutes} min
                          </p>
                        )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        Progresso: {session.completedSessions}/
                        {session.plannedSessions} sessões
                      </div>
                      <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {progressPercentage}% completo
                      </div>
                    </div>
                  </div>

                  {/* Body Locations Checklist */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium">
                        Locais para Tratamento:
                      </h5>
                      <div className="flex items-center gap-3">
                        <div className="text-sm text-gray-600">
                          {progress?.completedLocations.length || 0}/{session.bodyLocations.length} tratados
                        </div>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              // Select all locations
                              setSessionProgress((prev) => ({
                                ...prev,
                                [session.id]: {
                                  ...prev[session.id],
                                  completedLocations: [...session.bodyLocations],
                                },
                              }));
                            }}
                            className="text-xs px-2 py-1 text-blue-600 border border-blue-300 rounded hover:bg-blue-50"
                            disabled={progress?.completedLocations.length === session.bodyLocations.length}
                          >
                            Marcar Todos
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              // Clear all selections
                              setSessionProgress((prev) => ({
                                ...prev,
                                [session.id]: {
                                  ...prev[session.id],
                                  completedLocations: [],
                                },
                              }));
                            }}
                            className="text-xs px-2 py-1 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                            disabled={progress?.completedLocations.length === 0}
                          >
                            Limpar
                          </button>
                        </div>
                      </div>
                    </div>
                    {progress?.completedLocations.length === 0 && (
                      <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-blue-700 text-sm">
                        <span className="font-medium">Instruções:</span> Clique nos locais abaixo para marcar como tratados
                      </div>
                    )}
                    <div className={`grid grid-cols-2 md:grid-cols-3 gap-2 ${
                      progress?.completedLocations.length === 0 ? 'ring-2 ring-blue-300 ring-opacity-50 rounded-lg p-2' : ''
                    }`}>
                      {session.bodyLocations.map((location) => {
                        const isCompleted =
                          progress?.completedLocations.includes(location) ||
                          false;
                        return (
                          <label
                            key={location}
                            className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                              isCompleted
                                ? "bg-green-100 border-2 border-green-300 text-green-800 shadow-sm"
                                : "bg-white border-2 border-gray-300 text-gray-700 hover:border-blue-300 hover:bg-blue-50"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isCompleted}
                              onChange={() =>
                                toggleLocationCompletion(session.id, location)
                              }
                              className="mr-3 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium flex-1">{location}</span>
                            {isCompleted && (
                              <span className="ml-2 text-green-600 font-bold text-lg">✓</span>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Session Notes */}
                  <div>
                    <label className="block text-sm font-medium mb-1">
                      Observações da Sessão:
                    </label>
                    <textarea
                      value={progress?.notes || ""}
                      onChange={(e) =>
                        updateSessionNotes(session.id, e.target.value)
                      }
                      placeholder="Adicione observações sobre esta sessão..."
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                      rows={2}
                    />
                  </div>

                  {/* Session Status Indicator */}
                  {sessionComplete && (
                    <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-green-800 text-sm font-medium">
                      ✓ Sessão completa - todos os locais foram tratados
                    </div>
                  )}
                </div>
              );
            })}
            </div>
          )}

          {/* General Notes */}
          <div className="mt-6">
            <label className="block text-sm font-medium mb-2">
              Observações Gerais do Atendimento:
            </label>
            <textarea
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              placeholder="Adicione observações gerais sobre o atendimento..."
              className="w-full p-3 border border-gray-300 rounded"
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4">
          {/* Error and Success Messages */}
          {submitError && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              <span className="font-medium">Erro:</span> {submitError}
            </div>
          )}
          {submitSuccess && (
            <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
              <span className="font-medium">Sucesso:</span> Tratamento completado com sucesso!
            </div>
          )}
          
          <div className="flex items-center justify-between">
            <div className="text-sm">
              {canSubmit() ? (
                <span className="text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                  ✓ Pronto para completar
                </span>
              ) : (
                <span className="text-orange-600 font-medium bg-orange-50 px-2 py-1 rounded">
                  ⚠️ Marque pelo menos um local como tratado para continuar
                </span>
              )}
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                disabled={isSubmitting}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={!canSubmit() || isSubmitting}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Completando..." : "Completar Tratamento"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostTreatmentModal;

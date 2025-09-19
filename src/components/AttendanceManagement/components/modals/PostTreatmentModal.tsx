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
}

interface SessionProgress {
  sessionId: number;
  completedLocations: string[];
  notes: string;
}

const PostTreatmentModal: React.FC<PostTreatmentModalProps> = ({
  isOpen,
  onClose,
  onComplete,
  patientName,
  treatmentInfo,
  treatmentSessions,
}) => {
  const [sessionProgress, setSessionProgress] = useState<
    Record<number, SessionProgress>
  >({});
  const [generalNotes, setGeneralNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    try {
      // Extract completed locations by session
      const completedLocationsBySession: Record<number, string[]> = {};
      Object.entries(sessionProgress).forEach(([sessionId, progress]) => {
        if (progress.completedLocations.length > 0) {
          completedLocationsBySession[parseInt(sessionId)] =
            progress.completedLocations;
        }
      });

      await onComplete(completedLocationsBySession, generalNotes);
      handleClose();
    } catch (error) {
      console.error("Error completing treatment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSessionProgress({});
    setGeneralNotes("");
    setIsSubmitting(false);
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

          {/* Treatment Sessions */}
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
                    <h5 className="font-medium mb-2">
                      Locais para Tratamento:
                    </h5>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {session.bodyLocations.map((location) => {
                        const isCompleted =
                          progress?.completedLocations.includes(location) ||
                          false;
                        return (
                          <label
                            key={location}
                            className={`flex items-center p-2 rounded cursor-pointer transition-colors ${
                              isCompleted
                                ? "bg-green-100 border-green-300 text-green-800"
                                : "bg-white border-gray-300 text-gray-700"
                            } border`}
                          >
                            <input
                              type="checkbox"
                              checked={isCompleted}
                              onChange={() =>
                                toggleLocationCompletion(session.id, location)
                              }
                              className="mr-2"
                            />
                            <span className="text-sm">{location}</span>
                            {isCompleted && (
                              <span className="ml-auto text-green-600">✓</span>
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
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {canSubmit() ? (
              <span className="text-green-600 font-medium">
                ✓ Pronto para completar
              </span>
            ) : (
              <span>
                Marque pelo menos um local como tratado para continuar
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
  );
};

export default PostTreatmentModal;

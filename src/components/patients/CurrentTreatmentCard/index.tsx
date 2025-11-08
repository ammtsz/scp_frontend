import React, { useState, useMemo } from "react";
import { Patient, Recommendations } from "@/types/types";
import {
  useTreatmentSessions,
  useDeleteTreatmentSession,
} from "@/hooks/useTreatmentSessionsQueries";
import { useTreatmentRecords } from "@/hooks/useTreatmentRecords";
import { TreatmentRecommendationsModal } from "../TreatmentRecommendationsModal";
import { usePagination } from "@/hooks/usePagination";
import { TreatmentRecommendationsEmpty } from "@/components/common/CardStates";
import { TreatmentStatusOverview } from "./TreatmentStatusOverview";
import { ActiveTreatmentSessions } from "./ActiveTreatmentSessions";
import { TreatmentRecommendationsDisplay } from "./TreatmentRecommendationsDisplay";
import ConfirmModal from "@/components/common/ConfirmModal";

interface CurrentTreatmentCardProps {
  patient: Patient;
}

export const CurrentTreatmentCard: React.FC<CurrentTreatmentCardProps> = ({
  patient,
}) => {
  // State for treatment recommendations modal
  const [isRecommendationsModalOpen, setIsRecommendationsModalOpen] =
    useState(false);

  // State for confirmation modal
  const [confirmDelete, setConfirmDelete] = useState<{
    sessionId: string;
    sessionType: string;
  } | null>(null);

  // Fetch treatment sessions for progress tracking
  const {
    treatmentSessions,
    loading: sessionsLoading,
    refetch: refetchSessions,
  } = useTreatmentSessions(Number(patient.id));

  // Fetch treatment records to get latest recommendations
  const { data: treatmentRecords = [] } = useTreatmentRecords();

  // Hook for deleting treatment sessions
  const deleteTreatmentSessionMutation = useDeleteTreatmentSession();

  // Get the latest treatment record for this patient
  const latestTreatmentRecord = useMemo(() => {
    // Get all attendance IDs for this patient from previous attendances
    const patientAttendanceIds = new Set(
      patient.previousAttendances.map((att) => Number(att.attendanceId))
    );

    // Filter treatment records by attendance IDs belonging to this patient
    const patientRecords = treatmentRecords.filter((record) =>
      patientAttendanceIds.has(record.attendance_id)
    );

    if (patientRecords.length === 0) return null;

    // Sort by created date and return the most recent
    return patientRecords.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )[0];
  }, [treatmentRecords, patient.previousAttendances]);

  // Compute current recommendations from the latest treatment record
  const currentRecommendations = useMemo(() => {
    if (!latestTreatmentRecord) {
      return patient.currentRecommendations;
    }

    return {
      date: new Date(latestTreatmentRecord.created_at),
      food: latestTreatmentRecord.food || "",
      water: latestTreatmentRecord.water || "",
      ointment: latestTreatmentRecord.ointments || "",
      lightBath: latestTreatmentRecord.light_bath || false,
      rod: latestTreatmentRecord.rod || false,
      spiritualTreatment: latestTreatmentRecord.spiritual_treatment || false,
      returnWeeks: latestTreatmentRecord.return_in_weeks || 0,
    };
  }, [latestTreatmentRecord, patient.currentRecommendations]);

  // Handle treatment session deletion
  const handleDeleteSession = (sessionId: string, sessionType: string) => {
    setConfirmDelete({ sessionId, sessionType });
  };

  // Handle confirmed deletion
  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;

    try {
      await deleteTreatmentSessionMutation.mutateAsync(confirmDelete.sessionId);
      await refetchSessions(); // Refresh the sessions list
      setConfirmDelete(null);
    } catch (error) {
      console.error("Failed to delete treatment session:", error);
      setConfirmDelete(null);
    }
  };

  // Get active treatment sessions grouped by type
  const getActiveTreatmentSessions = () => {
    const activeSessions = treatmentSessions.filter(
      (session) =>
        session.status === "scheduled" ||
        session.status === "active" ||
        session.status === "in_progress"
    );

    return {
      light_bath: activeSessions.filter(
        (session) => session.treatment_type === "light_bath"
      ),
      rod: activeSessions.filter((session) => session.treatment_type === "rod"),
    };
  };

  // Static title for the card (always Spiritual Consultation)
  const groupedActiveSessions = getActiveTreatmentSessions();

  // Implement pagination for light bath sessions
  const {
    visibleItems: visibleLightBathSessions,
    hasMoreItems: hasMoreLightBath,
    showMore: showMoreLightBath,
    totalItems: totalLightBath,
    visibleCount: visibleLightBathCount,
  } = usePagination({
    items: groupedActiveSessions.light_bath,
    initialPageSize: 3,
    incrementSize: 10,
  });

  // Implement pagination for rod sessions
  const {
    visibleItems: visibleRodSessions,
    hasMoreItems: hasMoreRod,
    showMore: showMoreRod,
    totalItems: totalRod,
    visibleCount: visibleRodCount,
  } = usePagination({
    items: groupedActiveSessions.rod,
    initialPageSize: 3,
    incrementSize: 10,
  });

  return (
    <div className="ds-card">
      <div className="ds-card-body">
        <h2 className="ds-text-heading-2 mb-4 flex items-center">
          🗂️ Status do Tratamento
        </h2>

        {/* Delete Error Display */}
        {deleteTreatmentSessionMutation.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">
              Erro ao remover sessão de tratamento:{" "}
              {deleteTreatmentSessionMutation.error.message}
            </p>
          </div>
        )}

        <TreatmentStatusOverview patient={patient} />

        {/* Active Treatment Progress */}
        <ActiveTreatmentSessions
          lightBathSessions={groupedActiveSessions.light_bath}
          rodSessions={groupedActiveSessions.rod}
          visibleLightBathSessions={visibleLightBathSessions}
          visibleRodSessions={visibleRodSessions}
          hasMoreLightBath={hasMoreLightBath}
          hasMoreRod={hasMoreRod}
          showMoreLightBath={showMoreLightBath}
          showMoreRod={showMoreRod}
          totalLightBath={totalLightBath}
          totalRod={totalRod}
          visibleLightBathCount={visibleLightBathCount}
          visibleRodCount={visibleRodCount}
          sessionsLoading={sessionsLoading}
          onDeleteSession={handleDeleteSession}
          isDeleting={deleteTreatmentSessionMutation.isPending}
        />

        {/* Current Recommendations */}
        <div className="border-t pt-4">
          {currentRecommendations &&
          (currentRecommendations.food ||
            currentRecommendations.water ||
            currentRecommendations.ointment ||
            currentRecommendations.lightBath ||
            currentRecommendations.rod ||
            currentRecommendations.spiritualTreatment ||
            (currentRecommendations.returnWeeks &&
              currentRecommendations.returnWeeks > 0)) ? (
            <TreatmentRecommendationsDisplay
              recommendations={currentRecommendations}
            />
          ) : (
            <TreatmentRecommendationsEmpty
              onCreateRecommendations={() =>
                setIsRecommendationsModalOpen(true)
              }
            />
          )}
        </div>
      </div>

      {/* Treatment Recommendations Modal */}
      <TreatmentRecommendationsModal
        isOpen={isRecommendationsModalOpen}
        onClose={() => setIsRecommendationsModalOpen(false)}
        patient={patient}
        onSuccess={(updatedRecommendations: Recommendations) => {
          // The React Query cache will automatically update when the patient data is refetched
          console.log(
            "Treatment recommendations updated:",
            updatedRecommendations
          );
        }}
      />

      {/* Confirmation Modal for Deletion */}
      <ConfirmModal
        open={!!confirmDelete}
        title="Remover Sessão de Tratamento"
        message={
          confirmDelete && (
            <>
              Tem certeza que deseja remover esta sessão de{" "}
              <span className="font-semibold">{confirmDelete.sessionType}</span>
              ?
              <br />
              <span className="text-red-600">
                Esta ação não pode ser desfeita.
              </span>
            </>
          )
        }
        confirmLabel="Remover"
        cancelLabel="Cancelar"
        onCancel={() => setConfirmDelete(null)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
};

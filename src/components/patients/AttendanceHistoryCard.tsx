import React from "react";
import { Patient } from "@/types/types";
import { formatDateBR } from "@/utils/dateHelpers";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { usePatientAttendances } from "@/hooks/usePatientQueries";
import { useTreatmentSessions } from "@/hooks/useTreatmentSessionsQueries";
import { useTreatmentRecords } from "@/hooks/useTreatmentRecords";
import { transformAttendanceToPrevious } from "@/utils/apiTransformers";
import { usePagination } from "@/hooks/usePagination";
import { ShowMoreButton } from "@/components/common/ShowMoreButton";
import {
  groupAttendancesByDate,
  getTreatmentTypesLabel,
  type GroupedAttendance,
} from "@/utils/attendanceHelpers";
import {
  LightBathDetails,
  RodDetails,
  NotesBox,
  RecommendationsBox,
  TreatmentDetailsContainer,
} from "@/components/common/TreatmentDetailBoxes";
import {
  ErrorState,
  AttendanceHistoryEmpty,
} from "@/components/common/CardStates";

interface AttendanceHistoryCardProps {
  patient: Patient;
}

export const AttendanceHistoryCard: React.FC<AttendanceHistoryCardProps> = ({
  patient,
}) => {
  // Use separate attendance query for real-time updates and better cache management
  const {
    data: attendancesData,
    isLoading: attendancesLoading,
    error: attendancesError,
    refetch: refetchAttendances,
  } = usePatientAttendances(patient.id);

  // Fetch treatment sessions for this patient
  const {
    treatmentSessions,
    loading: treatmentSessionsLoading,
    error: treatmentSessionsError,
    refetch: refetchTreatmentSessions,
  } = useTreatmentSessions(parseInt(patient.id));

  // Fetch treatment records to get recommendations data
  const { data: treatmentRecords = [] } = useTreatmentRecords();

  // Transform raw attendance data to previous attendances format
  const enhancedPreviousAttendances = React.useMemo(() => {
    if (!attendancesData) return patient.previousAttendances;

    // Filter completed attendances and transform them
    const completedAttendances = attendancesData
      .filter((attendance) => attendance.status === "completed")
      .sort(
        (a, b) =>
          new Date(b.scheduled_date + "T00:00:00").getTime() -
          new Date(a.scheduled_date + "T00:00:00").getTime()
      )
      .map(transformAttendanceToPrevious);

    return completedAttendances;
  }, [attendancesData, patient.previousAttendances]);

  // Group attendances with treatment session data
  const groupedAttendances = React.useMemo(() => {
    return groupAttendancesByDate(
      enhancedPreviousAttendances,
      treatmentSessions,
      treatmentRecords
    );
  }, [enhancedPreviousAttendances, treatmentSessions, treatmentRecords]);

  // Implement pagination for better performance
  const {
    visibleItems: visibleGroupedAttendances,
    hasMoreItems,
    showMore,
    totalItems,
    visibleCount,
  } = usePagination({
    items: groupedAttendances,
    initialPageSize: 2,
    incrementSize: 10,
  });

  // Use enhanced data if available, fallback to patient data
  const loading = attendancesLoading || treatmentSessionsLoading;
  const error = attendancesError?.message || treatmentSessionsError || null;

  return (
    <div className="ds-card">
      <div className="ds-card-body">
        <div className="flex items-center justify-between mb-4">
          <h2 className="ds-text-heading-2 flex items-center">
            📋 Histórico de Atendimentos
          </h2>
          {!loading && (
            <button
              onClick={() => {
                refetchAttendances();
                refetchTreatmentSessions();
              }}
              className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded transition-colors"
              title="Atualizar histórico"
            >
              🔄 Atualizar
            </button>
          )}
        </div>

        {loading && (
          <LoadingSpinner
            size="medium"
            message="Carregando histórico de atendimentos..."
          />
        )}

        {error && (
          <ErrorState
            title="Erro ao carregar histórico"
            message={error}
            onRetry={() => {
              refetchAttendances();
              refetchTreatmentSessions();
            }}
          />
        )}

        {!loading && !error && (
          <div className="space-y-3">
            {visibleGroupedAttendances.map(
              (groupedAttendance: GroupedAttendance, index: number) => (
                <div
                  key={`attendance-${groupedAttendance.date.toISOString()}-${index}`}
                  className={`p-4 rounded-lg border bg-gray-50 border-gray-300`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium text-gray-900">
                          {formatDateBR(groupedAttendance.date.toISOString())}
                        </div>
                        <div className="text-sm text-gray-600">
                          {getTreatmentTypesLabel(groupedAttendance.treatments)}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Concluído
                      </span>
                    </div>
                  </div>

                  {/* Notes */}
                  {groupedAttendance.notes && (
                    <div className="mt-3">
                      <NotesBox notes={groupedAttendance.notes} />
                    </div>
                  )}

                  {/* Treatment Details */}
                  {(groupedAttendance.treatments.lightBath ||
                    groupedAttendance.treatments.rod) && (
                    <TreatmentDetailsContainer>
                      {/* Light Bath Details */}
                      {groupedAttendance.treatments.lightBath && (
                        <LightBathDetails
                          bodyLocations={
                            groupedAttendance.treatments.lightBath.bodyLocations
                          }
                          color={groupedAttendance.treatments.lightBath.color}
                          duration={
                            groupedAttendance.treatments.lightBath.duration
                          }
                          sessions={
                            groupedAttendance.treatments.lightBath.sessions
                          }
                          showSessions={false}
                        />
                      )}

                      {/* Rod Details */}
                      {groupedAttendance.treatments.rod && (
                        <RodDetails
                          bodyLocations={
                            groupedAttendance.treatments.rod.bodyLocations
                          }
                          sessions={groupedAttendance.treatments.rod.sessions}
                          showSessions={false}
                        />
                      )}
                    </TreatmentDetailsContainer>
                  )}

                  {/* Recommendations */}
                  {groupedAttendance.treatments.spiritual?.recommendations && (
                    <div className="mt-3">
                      <RecommendationsBox
                        recommendations={
                          groupedAttendance.treatments.spiritual.recommendations
                        }
                      />
                    </div>
                  )}
                </div>
              )
            )}

            {/* Show More Button */}
            {hasMoreItems && (
              <ShowMoreButton
                onClick={showMore}
                totalItems={totalItems}
                visibleCount={visibleCount}
                itemLabel="atendimentos"
                disabled={loading}
              />
            )}
          </div>
        )}

        {!loading && !error && totalItems === 0 && (
          <AttendanceHistoryEmpty patient={patient} />
        )}
      </div>
    </div>
  );
};

// Helper function to get treatment types label from grouped attendance

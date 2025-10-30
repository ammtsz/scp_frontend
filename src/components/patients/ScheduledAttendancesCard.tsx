import React from "react";
import { Patient } from "@/types/types";
import { formatDateSafe, getDaysUntil } from "@/utils/dateHelpers";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";
import { usePatientAttendances } from "@/hooks/usePatientQueries";
import { useTreatmentSessions } from "@/hooks/useTreatmentSessionsQueries";
import { transformAttendanceToNext } from "@/utils/apiTransformers";
import { usePagination } from "@/hooks/usePagination";
import { ShowMoreButton } from "@/components/common/ShowMoreButton";
import {
  groupScheduledAttendancesByDate,
  getScheduledTreatmentTypesLabel,
} from "@/utils/attendanceHelpers";
import {
  LightBathDetails,
  RodDetails,
  NotesBox,
  SpiritualConsultationDetails,
  TreatmentDetailsContainer,
} from "@/components/common/TreatmentDetailBoxes";
import {
  ErrorState,
  ScheduledAttendancesEmpty,
} from "@/components/common/CardStates";

interface ScheduledAttendancesCardProps {
  patient: Patient;
}

export const ScheduledAttendancesCard: React.FC<
  ScheduledAttendancesCardProps
> = ({ patient }) => {
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

  // Transform raw attendance data to scheduled attendances format
  const enhancedScheduledAttendances = React.useMemo(() => {
    if (!attendancesData) return patient.nextAttendanceDates || [];

    // Filter scheduled/future attendances and transform them
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0); // Set to start of day for comparison

    const scheduledAttendances = attendancesData
      .filter((attendance) => {
        const isScheduledStatus = [
          "scheduled",
          "checked_in",
          "in_progress",
        ].includes(attendance.status);
        const attendanceDate = new Date(
          attendance.scheduled_date + "T00:00:00"
        ); // Timezone-agnostic: parse as local time
        attendanceDate.setHours(0, 0, 0, 0);
        const isFuture = attendanceDate >= currentDate;
        return isScheduledStatus && isFuture;
      })
      .sort(
        (a, b) =>
          new Date(a.scheduled_date + "T00:00:00").getTime() -
          new Date(b.scheduled_date + "T00:00:00").getTime()
      )
      .map(transformAttendanceToNext);

    return scheduledAttendances;
  }, [attendancesData, patient.nextAttendanceDates]);

  // Group scheduled attendances with treatment session data
  const groupedScheduledAttendances = React.useMemo(() => {
    return groupScheduledAttendancesByDate(
      enhancedScheduledAttendances,
      treatmentSessions
    );
  }, [enhancedScheduledAttendances, treatmentSessions]);

  // Implement pagination for better performance
  const {
    visibleItems: visibleScheduledAttendances,
    hasMoreItems,
    showMore,
    totalItems,
    visibleCount,
  } = usePagination({
    items: groupedScheduledAttendances,
    initialPageSize: 3,
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
            📅 Próximos Agendamentos
          </h2>
          {!loading && (
            <button
              onClick={() => {
                refetchAttendances();
                refetchTreatmentSessions();
              }}
              className="text-blue-600 hover:text-blue-800 text-sm px-2 py-1 rounded transition-colors"
              title="Atualizar agendamentos"
            >
              🔄 Atualizar
            </button>
          )}
        </div>

        {loading && (
          <LoadingSpinner
            size="medium"
            message="Carregando próximos agendamentos..."
          />
        )}

        {error && (
          <ErrorState
            title="Erro ao carregar agendamentos"
            message={error}
            onRetry={() => {
              refetchAttendances();
              refetchTreatmentSessions();
            }}
          />
        )}

        {!loading && !error && (
          <div className="space-y-3">
            {visibleScheduledAttendances.map((groupedScheduled, index) => {
              const daysUntil = getDaysUntil(groupedScheduled.date);
              const isUpcoming = daysUntil <= 7; // Highlight appointments within a week
              const daysText =
                daysUntil === 0
                  ? "hoje"
                  : daysUntil === 1
                  ? "amanhã"
                  : `em ${daysUntil} dias`;

              return (
                <div
                  key={`scheduled-${groupedScheduled.date.toISOString()}-${index}`}
                  className={`p-4 rounded-lg border bg-gray-50 border-gray-200`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <div className="font-medium text-gray-900">
                          {formatDateSafe(groupedScheduled.date)}
                          {daysUntil >= 0 && (
                            <span className="ml-2 text-sm font-normal text-gray-600">
                              ({daysText})
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600">
                          {getScheduledTreatmentTypesLabel(
                            groupedScheduled.treatments
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {index === 0 && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Próximo
                        </span>
                      )}
                      {isUpcoming && index > 0 && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Em breve
                        </span>
                      )}
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        Agendado
                      </span>
                    </div>
                  </div>

                  {/* Scheduled Treatment Details */}
                  <TreatmentDetailsContainer>
                    {/* Spiritual Consultation */}
                    {groupedScheduled.treatments.spiritual && (
                      <SpiritualConsultationDetails description="Consulta agendada para avaliação e orientação espiritual" />
                    )}

                    {/* Light Bath Details */}
                    {groupedScheduled.treatments.lightBath && (
                      <LightBathDetails
                        bodyLocations={
                          groupedScheduled.treatments.lightBath.bodyLocations
                        }
                        color={groupedScheduled.treatments.lightBath.color}
                        duration={
                          groupedScheduled.treatments.lightBath.duration
                        }
                        sessions={
                          groupedScheduled.treatments.lightBath.sessions
                        }
                        showSessions={true}
                        sessionLabel="Sessões Programadas"
                      />
                    )}

                    {/* Rod Details */}
                    {groupedScheduled.treatments.rod && (
                      <RodDetails
                        bodyLocations={
                          groupedScheduled.treatments.rod.bodyLocations
                        }
                        sessions={groupedScheduled.treatments.rod.sessions}
                        showSessions={true}
                        sessionLabel="Sessões Programadas"
                      />
                    )}
                  </TreatmentDetailsContainer>

                  {/* Notes */}
                  {groupedScheduled.notes && (
                    <div className="mt-3">
                      <NotesBox
                        notes={groupedScheduled.notes}
                        label="Observações"
                      />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Show More Button */}
            {hasMoreItems && (
              <ShowMoreButton
                onClick={showMore}
                totalItems={totalItems}
                visibleCount={visibleCount}
                itemLabel="agendamentos"
                disabled={loading}
              />
            )}
          </div>
        )}

        {!loading && !error && totalItems === 0 && (
          <ScheduledAttendancesEmpty patientId={patient.id} />
        )}
      </div>
    </div>
  );
};

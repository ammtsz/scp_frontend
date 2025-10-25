import React from "react";
import { Patient, AttendanceType } from "@/types/types";
import { formatDateBR } from "@/utils/dateHelpers";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

interface FutureAppointmentsCardProps {
  patient: Patient;
  loading?: boolean;
  error?: string | null;
}

export const FutureAppointmentsCard: React.FC<FutureAppointmentsCardProps> = ({
  patient,
  loading = false,
  error = null,
}) => {
  const formatAppointmentDate = (date: Date | string): string => {
    try {
      // Handle both Date objects and string dates
      const dateObj = date instanceof Date ? date : new Date(date);

      // Check if date is valid
      if (isNaN(dateObj.getTime())) {
        return "Data inválida";
      }

      return formatDateBR(dateObj.toISOString());
    } catch {
      return "Data inválida";
    }
  };

  const getDaysUntil = (appointmentDate: Date | string): number => {
    try {
      const today = new Date();
      const appointment = new Date(appointmentDate);

      if (isNaN(appointment.getTime())) {
        return 0;
      }

      const diffTime = appointment.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return Math.max(0, diffDays);
    } catch {
      return 0;
    }
  };

  return (
    <div className="ds-card">
      <div className="ds-card-body">
        <h2 className="ds-text-heading-2 mb-4 flex items-center">
          📅 Próximos Agendamentos
        </h2>

        {loading && (
          <LoadingSpinner
            size="medium"
            message="Carregando agendamentos futuros..."
          />
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <div className="text-red-500 mr-3">⚠️</div>
              <div>
                <p className="text-red-800 font-medium">
                  Erro ao carregar agendamentos
                </p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-3">
            {patient.nextAttendanceDates.map((appointment, index) => {
              const daysUntil = getDaysUntil(appointment.date);
              const isUpcoming = daysUntil <= 7; // Highlight appointments within a week

              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${
                    index === 0
                      ? "bg-green-50 border-green-200"
                      : "bg-blue-50 border-blue-200"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          index === 0 ? "bg-green-500" : "bg-blue-500"
                        }`}
                      ></div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {formatAppointmentDate(appointment.date)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {getAppointmentTypeName(appointment.type)}
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

                  {/* Days until appointment */}
                  {daysUntil >= 0 && (
                    <div className="mt-3 p-3 bg-white rounded border border-green-200">
                      <div className="text-sm text-green-700">
                        <strong>
                          {daysUntil === 0
                            ? "Hoje!"
                            : daysUntil === 1
                            ? "Amanhã"
                            : `Em ${daysUntil} dias`}
                        </strong>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!loading && !error && patient.nextAttendanceDates.length === 0 && (
          <div className="text-center py-8">
            <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <div className="text-2xl">📅</div>
            </div>
            <div className="font-medium text-gray-900 mb-2">
              Nenhum agendamento futuro
            </div>
            <div className="text-sm text-gray-600 mb-4 max-w-sm mx-auto">
              Este paciente não possui agendamentos futuros no momento. Novos
              agendamentos aparecerão aqui quando criados.
            </div>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <button
                className="ds-button-primary"
                onClick={() => {
                  // TODO: Implement schedule appointment functionality
                  console.log(
                    "Schedule new appointment for patient:",
                    patient.id
                  );
                }}
              >
                📅 Agendar Consulta
              </button>
              <button
                className="ds-button-outline"
                onClick={() => {
                  // TODO: Navigate to agenda page
                  console.log("Navigate to agenda");
                }}
              >
                Ver Agenda
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to translate appointment types to Portuguese
function getAppointmentTypeName(type: AttendanceType): string {
  const typeNames: Record<AttendanceType, string> = {
    spiritual: "Consulta Espiritual",
    lightBath: "Banho de Luz",
    rod: "Bastão",
    combined: "Banho de Luz e Bastão",
  };

  return typeNames[type] || type || "Tipo não especificado";
}

import React from "react";
import { Patient, PreviousAttendance } from "@/types/types";
import { formatDateBR } from "@/utils/dateHelpers";
import { LoadingSpinner } from "@/components/common/LoadingSpinner";

interface AttendanceHistoryCardProps {
  patient: Patient;
  loading?: boolean;
  error?: string | null;
}

export const AttendanceHistoryCard: React.FC<AttendanceHistoryCardProps> = ({
  patient,
  loading = false,
  error = null,
}) => {
  const formatAttendanceDate = (date: Date | string): string => {
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

  return (
    <div className="ds-card">
      <div className="ds-card-body">
        <h2 className="ds-text-heading-2 mb-4 flex items-center">
          📋 Histórico de Atendimentos
        </h2>

        {loading && (
          <LoadingSpinner
            size="medium"
            message="Carregando histórico de atendimentos..."
          />
        )}

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center">
              <div className="text-red-500 mr-3">⚠️</div>
              <div>
                <p className="text-red-800 font-medium">
                  Erro ao carregar histórico
                </p>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!loading && !error && (
          <div className="space-y-3">
            {patient.previousAttendances.map(
              (attendance: PreviousAttendance, index: number) => (
                <div
                  key={attendance.attendanceId || `attendance-${index}`}
                  className={`p-4 rounded-lg border ${
                    index === 0
                      ? "bg-blue-50 border-blue-200"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          index === 0 ? "bg-blue-500" : "bg-gray-400"
                        }`}
                      ></div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {formatAttendanceDate(attendance.date)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {getAttendanceTypeLabel(attendance.type) ||
                            "Tipo não especificado"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Concluído
                      </span>
                    </div>
                  </div>

                  {attendance.notes && (
                    <div className="mt-3 p-3 bg-white rounded border border-gray-200">
                      <div className="text-sm text-gray-700">
                        <strong>Notas:</strong> {attendance.notes}
                      </div>
                    </div>
                  )}

                  {attendance.recommendations && (
                    <div className="mt-3 p-3 bg-purple-50 rounded border border-purple-200">
                      <div className="text-sm text-purple-900 font-medium mb-2">
                        Recomendações:
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <strong>Alimentação:</strong>{" "}
                          {attendance.recommendations.food ||
                            "Não especificado"}
                        </div>
                        <div>
                          <strong>Água:</strong>{" "}
                          {attendance.recommendations.water ||
                            "Não especificado"}
                        </div>
                        <div>
                          <strong>Pomada:</strong>{" "}
                          {attendance.recommendations.ointment ||
                            "Não especificado"}
                        </div>
                        <div>
                          <strong>Retorno:</strong>{" "}
                          {attendance.recommendations.returnWeeks
                            ? `${attendance.recommendations.returnWeeks} semanas`
                            : "Não especificado"}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )
            )}
          </div>
        )}

        {!loading && !error && patient.previousAttendances.length === 0 && (
          <div className="text-center py-8">
            <div className="bg-green-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <div className="text-2xl">📝</div>
            </div>
            <div className="font-medium text-gray-900 mb-2">
              Nenhum atendimento concluído
            </div>
            <div className="text-sm text-gray-600 mb-4 max-w-sm mx-auto">
              Este é um novo paciente ou ainda não possui atendimentos
              concluídos. O histórico será exibido aqui após a conclusão dos
              atendimentos.
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <div className="flex items-start gap-3">
                <div className="text-blue-500 text-lg">💡</div>
                <div className="text-sm">
                  <div className="font-medium text-blue-900 mb-1">
                    Próximos passos:
                  </div>
                  <div className="text-blue-800">
                    {patient.nextAttendanceDates.length > 0
                      ? `Próximo atendimento agendado para ${new Date(
                          patient.nextAttendanceDates[0].date
                        ).toLocaleDateString("pt-BR")}`
                      : "Agendar primeiro atendimento para iniciar o tratamento"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Helper function to translate attendance types to Portuguese
function getAttendanceTypeLabel(type: string): string {
  const typeLabels: Record<string, string> = {
    spiritual: "Consulta Espiritual",
    lightBath: "Banho de Luz",
    light_bath: "Banho de Luz",
    rod: "Tratamento com Bastão",
    combined: "Tratamento Combinado",
  };

  return typeLabels[type] || type;
}

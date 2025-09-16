import React from "react";
import type { AbsenceJustification, ScheduledAbsence } from "../types";
import { getAttendanceTypeLabel } from "@/utils/apiTransformers";

interface AbsenceJustificationStepProps {
  scheduledAbsences: ScheduledAbsence[];
  selectedDate: string;
  absenceJustifications: AbsenceJustification[];
  onJustificationChange: (
    patientId: number,
    attendanceType: import("@/types/globals").IAttendanceType,
    justified: boolean,
    justification?: string
  ) => void;
  onNext: () => void;
  onBack: () => void;
}

const AbsenceJustificationStep: React.FC<AbsenceJustificationStepProps> = ({
  scheduledAbsences,
  selectedDate,
  absenceJustifications,
  onJustificationChange,
  onNext,
  onBack,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("pt-BR");
  };

  const allJustified = absenceJustifications.every(
    (j) => j.justified === true || j.justified === false
  );

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">
        Faltas Agendadas - {formatDate(selectedDate)}
      </h3>

      {scheduledAbsences.length === 0 ? (
        <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="h-5 w-5 text-green-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Todas as presenças confirmadas!
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Não há faltas agendadas para justificar.</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-4 mb-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <div className="h-5 w-5 text-yellow-400">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Faltas</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Há {scheduledAbsences.length} paciente(s) que faltaram aos
                    atendimentos agendados. Justifique as faltas para finalizar
                    o dia.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {scheduledAbsences.map((absence) => {
            const justification = absenceJustifications.find(
              (j) =>
                j.patientId === absence.patientId &&
                j.attendanceType === absence.attendanceType
            );

            return (
              <div
                key={`${absence.patientId}-${absence.attendanceType}`}
                className="border border-gray-200 rounded-md p-4 bg-white"
              >
                <div className="space-y-4">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">
                      {absence.patientName}
                    </h4>
                    <p className="text-sm text-gray-500">
                      Paciente ID: {absence.patientId}
                    </p>
                    <p className="text-xs text-blue-600 font-medium">
                      {getAttendanceTypeLabel(absence.attendanceType)}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`absence-${absence.patientId}-${absence.attendanceType}`}
                          checked={justification?.justified === true}
                          onChange={() =>
                            onJustificationChange(
                              absence.patientId,
                              absence.attendanceType,
                              true
                            )
                          }
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Falta justificada
                        </span>
                      </label>
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name={`absence-${absence.patientId}-${absence.attendanceType}`}
                          checked={justification?.justified === false}
                          onChange={() =>
                            onJustificationChange(
                              absence.patientId,
                              absence.attendanceType,
                              false
                            )
                          }
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700">
                          Falta não justificada
                        </span>
                      </label>
                    </div>

                    {justification?.justified === true && (
                      <div>
                        <label
                          htmlFor={`justification-${absence.patientId}-${absence.attendanceType}`}
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Justificativa
                        </label>
                        <textarea
                          id={`justification-${absence.patientId}-${absence.attendanceType}`}
                          value={justification.justification || ""}
                          onChange={(e) =>
                            onJustificationChange(
                              absence.patientId,
                              absence.attendanceType,
                              true,
                              e.target.value
                            )
                          }
                          placeholder="Descreva o motivo da falta..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          rows={2}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Voltar
        </button>
        <button
          onClick={onNext}
          disabled={scheduledAbsences.length > 0 && !allJustified}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
            scheduledAbsences.length > 0 && !allJustified
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
        >
          Próximo
        </button>
      </div>
    </div>
  );
};

export default AbsenceJustificationStep;

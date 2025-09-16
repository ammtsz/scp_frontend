import React from "react";
import type { AbsenceJustification, ScheduledAbsence } from "../types";
import { getAttendanceTypeLabel } from "@/utils/apiTransformers";

interface ConfirmationStepProps {
  selectedDate: string;
  completedAttendances: Array<{ name?: string }>;
  scheduledAbsences: ScheduledAbsence[];
  absenceJustifications: AbsenceJustification[];
  isSubmitting: boolean;
  onSubmit: () => void;
  onBack: () => void;
}

const ConfirmationStep: React.FC<ConfirmationStepProps> = ({
  selectedDate,
  completedAttendances,
  scheduledAbsences,
  absenceJustifications,
  isSubmitting,
  onSubmit,
  onBack,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("pt-BR");
  };

  const justifiedAbsences = absenceJustifications.filter((j) => j.justified);
  const unjustifiedAbsences = absenceJustifications.filter((j) => !j.justified);

  // Helper function to get attendance type for a patient
  const getAttendanceTypeForPatient = (patientId: number) => {
    const scheduledAbsence = scheduledAbsences.find(
      (sa) => sa.patientId === patientId
    );
    return scheduledAbsence?.attendanceType;
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">
        Confirmação - {formatDate(selectedDate)}
      </h3>

      <div className="space-y-6 mb-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-md p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {completedAttendances.length}
              </div>
              <div className="text-sm text-green-800">
                Atendimentos Concluídos
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {justifiedAbsences.length}
              </div>
              <div className="text-sm text-yellow-800">Faltas Justificadas</div>
            </div>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {unjustifiedAbsences.length}
              </div>
              <div className="text-sm text-red-800">Faltas Injustificadas</div>
            </div>
          </div>
        </div>

        {/* Detailed Lists */}
        {completedAttendances.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-md p-4">
            <h4 className="text-md font-medium text-gray-900 mb-3">
              Atendimentos Concluídos
            </h4>
            <ul className="space-y-2">
              {completedAttendances.map((attendance, index) => (
                <li key={index} className="text-sm text-gray-600">
                  • {attendance.name || `Attendance #${index + 1}`}
                </li>
              ))}
            </ul>
          </div>
        )}

        {justifiedAbsences.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-md p-4">
            <h4 className="text-md font-medium text-gray-900 mb-3">
              Faltas Justificadas
            </h4>
            <ul className="space-y-3">
              {justifiedAbsences.map((absence) => {
                const attendanceType = getAttendanceTypeForPatient(
                  absence.patientId
                );
                return (
                  <li
                    key={`${absence.patientId}-${absence.attendanceType}`}
                    className="text-sm"
                  >
                    <div className="font-medium text-gray-700">
                      {absence.patientName}
                    </div>
                    {attendanceType && (
                      <div className="text-xs text-blue-600 font-medium">
                        {getAttendanceTypeLabel(attendanceType)}
                      </div>
                    )}
                    {absence.justification && (
                      <div className="text-gray-600 mt-1">
                        Justificativa: {absence.justification}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {unjustifiedAbsences.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-md p-4">
            <h4 className="text-md font-medium text-gray-900 mb-3">
              Faltas Injustificadas
            </h4>
            <ul className="space-y-2">
              {unjustifiedAbsences.map((absence) => {
                const attendanceType = getAttendanceTypeForPatient(
                  absence.patientId
                );
                return (
                  <li key={absence.patientId} className="text-sm text-gray-600">
                    <div>• {absence.patientName}</div>
                    {attendanceType && (
                      <div className="text-xs text-blue-600 font-medium ml-2">
                        {getAttendanceTypeLabel(attendanceType)}
                      </div>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Final Confirmation */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="h-5 w-5 text-blue-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">
                Finalizar o dia
              </h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Clique em &quot;Finalizar Dia&quot; para confirmar e registrar
                  todas as informações acima. Esta ação não pode ser desfeita.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          onClick={onBack}
          disabled={isSubmitting}
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          Voltar
        </button>
        <button
          onClick={onSubmit}
          disabled={isSubmitting}
          className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Finalizando...
            </>
          ) : (
            "Finalizar Dia"
          )}
        </button>
      </div>
    </div>
  );
};

export default ConfirmationStep;

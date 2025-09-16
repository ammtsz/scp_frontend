import React from "react";
import type { IAttendanceStatusDetailWithType } from "../../../utils/attendanceDataUtils";
import { getAttendanceTypeLabel } from "@/utils/apiTransformers";

interface IncompleteAttendancesStepProps {
  incompleteAttendances: IAttendanceStatusDetailWithType[];
  selectedDate: string;
  onHandleCompletion: (attendanceId: number) => void;
  onReschedule: (attendanceId: number) => void;
  onNext: () => void;
}

const IncompleteAttendancesStep: React.FC<IncompleteAttendancesStepProps> = ({
  incompleteAttendances,
  selectedDate,
  onHandleCompletion,
  onReschedule,
  onNext,
}) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString + "T00:00:00");
    return date.toLocaleDateString("pt-BR");
  };

  return (
    <div>
      <h3 className="text-lg font-semibold mb-4">
        Atendimentos Incompletos - {formatDate(selectedDate)}
      </h3>

      {incompleteAttendances.length === 0 ? (
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
                Todos os atendimentos foram concluídos!
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>Não há atendimentos incompletos para este dia.</p>
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
                <h3 className="text-sm font-medium text-yellow-800">
                  Atendimentos não concluídos
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Há {incompleteAttendances.length} atendimento(s) que não
                    foram concluído(s). Conclua-os antes de finalizar o dia.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {incompleteAttendances.map((attendance) => (
            <div
              key={`${attendance.attendanceId}-${attendance.attendanceType}`}
              className="border border-gray-200 rounded-md p-4 bg-white"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium text-gray-900">
                    {attendance.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    Priority: {attendance.priority}
                  </p>
                  <p className="text-sm font-medium text-blue-600">
                    {getAttendanceTypeLabel(attendance.attendanceType)}
                  </p>
                  {attendance.checkedInTime && (
                    <p className="text-xs text-gray-400">
                      Check-in:{" "}
                      {new Date(attendance.checkedInTime).toLocaleTimeString(
                        "pt-BR",
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  )}
                </div>
                <div className="ml-4 flex space-x-2">
                  <button
                    onClick={() =>
                      attendance.attendanceId &&
                      onReschedule(attendance.attendanceId)
                    }
                    disabled={!attendance.attendanceId}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
                  >
                    Reagendar
                  </button>
                  <button
                    onClick={() =>
                      attendance.attendanceId &&
                      onHandleCompletion(attendance.attendanceId)
                    }
                    disabled={!attendance.attendanceId}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
                  >
                    Concluir
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={onNext}
          disabled={incompleteAttendances.length > 0}
          className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
            incompleteAttendances.length > 0
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

export default IncompleteAttendancesStep;

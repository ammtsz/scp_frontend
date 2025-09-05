import React from "react";
import { IAttendanceStatusDetail } from "@/types/globals";

interface EnhancedAttendanceDetail extends IAttendanceStatusDetail {
  status: "checkedIn" | "onGoing";
  type: "spiritual" | "lightBath" | "rod";
}

interface IncompleteAttendancesModalProps {
  isOpen: boolean;
  onClose: () => void;
  incompleteAttendances: EnhancedAttendanceDetail[];
  onCompleteSelected: (attendances: EnhancedAttendanceDetail[]) => void;
  onRescheduleSelected: (attendances: EnhancedAttendanceDetail[]) => void;
}

export const IncompleteAttendancesModal: React.FC<
  IncompleteAttendancesModalProps
> = ({
  isOpen,
  onClose,
  incompleteAttendances,
  onCompleteSelected,
  onRescheduleSelected,
}) => {
  const [selectedAttendances, setSelectedAttendances] = React.useState<
    Set<string>
  >(new Set());

  const handleToggleAttendance = (attendanceId: string) => {
    const newSelected = new Set(selectedAttendances);
    if (newSelected.has(attendanceId)) {
      newSelected.delete(attendanceId);
    } else {
      newSelected.add(attendanceId);
    }
    setSelectedAttendances(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedAttendances.size === incompleteAttendances.length) {
      setSelectedAttendances(new Set());
    } else {
      setSelectedAttendances(
        new Set(
          incompleteAttendances.map((a) => a.attendanceId?.toString() || "")
        )
      );
    }
  };

  const getSelectedAttendances = () => {
    return incompleteAttendances.filter((a) =>
      selectedAttendances.has(a.attendanceId?.toString() || "")
    );
  };

  const handleComplete = () => {
    onCompleteSelected(getSelectedAttendances());
  };

  const handleReschedule = () => {
    onRescheduleSelected(getSelectedAttendances());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Atendimentos Incompletos
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <div className="mb-4">
          <p className="text-gray-700 mb-4">
            Ainda há pacientes em atendimento ou que fizeram check-in mas não
            completaram o atendimento. Selecione os pacientes e escolha uma
            ação:
          </p>

          <div className="mb-4">
            <button
              onClick={handleSelectAll}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {selectedAttendances.size === incompleteAttendances.length
                ? "Desmarcar Todos"
                : "Selecionar Todos"}
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {incompleteAttendances.map((attendance) => (
              <div
                key={`${attendance.attendanceId}-${attendance.name}`}
                className="flex items-center p-3 border rounded-lg hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={selectedAttendances.has(
                    attendance.attendanceId?.toString() || ""
                  )}
                  onChange={() =>
                    handleToggleAttendance(
                      attendance.attendanceId?.toString() || ""
                    )
                  }
                  className="mr-3"
                />
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {attendance.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    Status:{" "}
                    {attendance.status === "checkedIn"
                      ? "Check-in Realizado"
                      : "Em Atendimento"}{" "}
                    • Tipo:{" "}
                    {attendance.type === "spiritual"
                      ? "Consulta Espiritual"
                      : attendance.type === "lightBath"
                      ? "Banho de Luz"
                      : "Bastão"}
                  </div>
                  {attendance.checkedInTime && (
                    <div className="text-xs text-gray-400">
                      Check-in:{" "}
                      {attendance.checkedInTime.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleReschedule}
            disabled={selectedAttendances.size === 0}
            className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Reagendar Selecionados ({selectedAttendances.size})
          </button>
          <button
            onClick={handleComplete}
            disabled={selectedAttendances.size === 0}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Marcar como Concluídos ({selectedAttendances.size})
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncompleteAttendancesModal;

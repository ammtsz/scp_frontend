import React from "react";

interface DayCompletionModalProps {
  isOpen: boolean;
  completionTime: Date;
  totalPatients: number;
  completedPatients: number;
  missedPatients: number;
}

export const DayCompletionModal: React.FC<DayCompletionModalProps> = ({
  isOpen,
  completionTime,
  totalPatients,
  completedPatients,
  missedPatients,
}) => {
  if (!isOpen) return null;

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
        <div className="mb-6">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M5 13l4 4L19 7"
              ></path>
            </svg>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Dia Finalizado!
          </h2>

          <p className="text-lg text-gray-700">
            Consultas finalizadas às {formatTime(completionTime)} do dia{" "}
            {formatDate(completionTime)}
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Resumo do Dia</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Total de pacientes:</span>
              <span className="font-medium">{totalPatients}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Atendimentos concluídos:</span>
              <span className="font-medium text-green-600">
                {completedPatients}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Faltas registradas:</span>
              <span className="font-medium text-orange-600">
                {missedPatients}
              </span>
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-500 mb-6">
          O sistema foi bloqueado automaticamente. Novos atendimentos podem ser
          agendados para os próximos dias.
        </div>

        <div className="text-xs text-gray-400">
          Sistema finalizado em {formatTime(completionTime)}
        </div>
      </div>
    </div>
  );
};

export default DayCompletionModal;

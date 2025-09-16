import React from "react";
import AttendanceTypeTag from "@/components/AttendanceManagement/components/AttendanceCards/AttendanceTypeTag";
import { formatDateWithDayOfWeekBR } from "@/utils/dateHelpers";
import { IAttendanceType } from "@/types/globals";
import Spinner from "@/components/Spinner";

interface Patient {
  id: string;
  name: string;
  attendanceId?: number;
  attendanceType: IAttendanceType;
}

interface AgendaItem {
  date: Date;
  patients: Patient[];
}

interface AgendaColumnProps {
  title: string;
  agendaItems: AgendaItem[];
  openAgendaIdx: number | null;
  setOpenAgendaIdx: (idx: number | null) => void;
  onRemovePatient: (params: {
    id: string;
    date: Date;
    name: string;
    type: IAttendanceType;
    attendanceId?: number;
  }) => void;
  columnType: "spiritual" | "lightBath";
  isLoading?: boolean;
}

const AgendaColumn: React.FC<AgendaColumnProps> = ({
  title,
  agendaItems,
  openAgendaIdx,
  setOpenAgendaIdx,
  onRemovePatient,
  columnType,
  isLoading = false,
}) => {
  return (
    <div className="flex-1 border border-gray-200 shadow rounded-lg p-4 bg-white">
      {/* Column Header */}
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">
          {agendaItems.length} data{agendaItems.length !== 1 ? "s" : ""} com
          agendamentos
        </p>
      </div>

      {/* Agenda Items */}
      {agendaItems.length > 0 ? (
        agendaItems.map(({ date, patients }, idx: number) => (
          <div
            key={date + "-" + columnType + "-" + idx}
            className={`mb-4 border border-gray-200 rounded-lg shadow-sm ${
              openAgendaIdx !== idx ? "bg-white" : "bg-gray-100"
            }`}
          >
            <button
              type="button"
              className="w-full flex justify-between items-center p-4 font-medium text-gray-800 hover:bg-gray-50 transition rounded-t-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() =>
                setOpenAgendaIdx(openAgendaIdx === idx ? null : idx)
              }
              aria-expanded={openAgendaIdx === idx}
              aria-controls={`agenda-patients-${columnType}-${idx}`}
            >
              <span className="text-left">
                <div className="font-semibold">
                  {formatDateWithDayOfWeekBR(date.toISOString())}
                </div>
                <div className="text-sm text-gray-600 mt-1">
                  {patients.length} paciente
                  {patients.length !== 1 ? "s" : ""} agendado
                  {patients.length !== 1 ? "s" : ""}
                </div>
              </span>
              <div className="flex items-center gap-3">
                <span
                  className={`ml-2 transition-transform text-gray-400 ${
                    openAgendaIdx === idx ? "rotate-90" : ""
                  }`}
                >
                  ▶
                </span>
              </div>
            </button>
            {openAgendaIdx === idx && (
              <div
                id={`agenda-patients-${columnType}-${idx}`}
                className="p-4 pt-0 border-t border-gray-200 bg-gray-100"
              >
                <div className="space-y-2 mt-4">
                  {patients.map(
                    ({ name, id, attendanceId, attendanceType }, i) => (
                      <div
                        key={`${id}-${attendanceType}`}
                        className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg transition-all hover:shadow-sm"
                      >
                        <span className="w-6 h-6 flex items-center justify-center text-xs font-medium text-gray-500 bg-white border border-gray-200 rounded-full">
                          {i + 1}
                        </span>
                        <div className="flex items-center gap-2 flex-1">
                          <span className="font-medium text-gray-800">
                            {name}
                          </span>
                          {attendanceType && (
                            <AttendanceTypeTag type={attendanceType} />
                          )}
                        </div>
                        <button
                          type="button"
                          className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 border border-red-200 rounded transition-colors"
                          onClick={() =>
                            onRemovePatient({
                              id,
                              date,
                              name,
                              type: columnType,
                              attendanceId,
                            })
                          }
                          aria-label="Cancelar agendamento"
                        >
                          Cancelar
                        </button>
                      </div>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        ))
      ) : isLoading ? (
        <div className="text-center py-8 text-gray-500 bg-white border border-gray-200 rounded-lg">
          <div className="flex flex-col items-center justify-center">
            <Spinner size="md" className="text-blue-500 mb-3" />
            <div className="text-sm">Carregando agendamentos...</div>
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 bg-white border border-gray-200 rounded-lg">
          <div className="text-sm">
            {columnType === "spiritual"
              ? "Nenhuma consulta espiritual encontrada."
              : "Nenhum banho de luz/bastão encontrado."}
          </div>
          <div className="text-xs mt-1">
            Selecione uma data diferente ou crie um novo agendamento.
          </div>
        </div>
      )}
    </div>
  );
};

export default AgendaColumn;

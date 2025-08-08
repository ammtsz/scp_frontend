"use client";

import React from "react";
import ConfirmModal from "@/components/ConfirmModal/index";
import NewAttendanceModal from "@/components/NewAttendanceModal";
import { useAgendaCalendar } from "./useAgendaCalendar";
import { formatDateBR } from "@/utils/dateHelpers";

const AgendaCalendar: React.FC = () => {
  const {
    TABS,
    selectedDate,
    setSelectedDate,
    activeTab,
    setActiveTab,
    filteredAgenda,
    openAgendaIdx,
    setOpenAgendaIdx,
    isTabTransitioning,
    confirmRemove,
    setConfirmRemove,
    showNewAttendance,
    setShowNewAttendance,
    handleRemovePatient,
    handleNewAttendance,
  } = useAgendaCalendar();

  return (
    <div className="flex flex-col gap-8 my-16">
      {/* Agenda Calendar Management */}
      <div className="card-shadow">
        <div className="p-4 border-b border-gray-100">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Agenda de Atendimentos
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Visualize e gerencie os agendamentos por data e tipo de
                atendimento
              </p>
            </div>
            <button
              className="button button-primary"
              onClick={() => setShowNewAttendance(true)}
            >
              + Novo Agendamento
            </button>
          </div>
        </div>
        <div className="p-4">
          {/* Date input with label */}
          <div className="mb-6">
            <label
              htmlFor="agenda-date"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Selecione uma data para filtrar
            </label>
            <input
              id="agenda-date"
              type="date"
              className="input"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              lang="pt-BR"
            />
          </div>

          {/* Tabs */}
          <div className="flex w-full bg-gray-50 relative mb-6">
            <div className="absolute bottom-0 left-0 right-0 h-px bg-[#e2e8f0] z-0"></div>
            {TABS.map((tab) => (
              <button
                key={tab.key}
                className={`tab-button${
                  activeTab === tab.key ? " active" : ""
                } flex-1 text-center`}
                onClick={() => setActiveTab(tab.key)}
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div
            className={`transition-opacity duration-200 ${
              isTabTransitioning
                ? "opacity-0 pointer-events-none"
                : "opacity-100"
            }`}
          >
            {filteredAgenda[activeTab].length > 0 ? (
              filteredAgenda[activeTab].map(
                ({ date, patients }, idx: number) => (
                  <div
                    key={date + "-" + activeTab + "-" + idx}
                    className="mb-4 border border-gray-200 rounded-lg bg-white shadow-sm"
                  >
                    <button
                      type="button"
                      className="w-full flex justify-between items-center p-4 font-medium text-gray-800 hover:bg-gray-50 transition rounded-t-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      onClick={() =>
                        setOpenAgendaIdx(openAgendaIdx === idx ? null : idx)
                      }
                      aria-expanded={openAgendaIdx === idx}
                      aria-controls={`agenda-patients-${idx}`}
                    >
                      <span className="text-left">
                        <div className="font-semibold">
                          {formatDateBR(date.toISOString())}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {patients.length} paciente
                          {patients.length !== 1 ? "s" : ""} agendado
                          {patients.length !== 1 ? "s" : ""}
                        </div>
                      </span>
                      <div className="flex items-center gap-3">
                        {openAgendaIdx === idx && (
                          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                            {activeTab === "spiritual"
                              ? "Consultas Espirituais"
                              : "Banhos de Luz/Bastão"}
                          </span>
                        )}
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
                        id={`agenda-patients-${idx}`}
                        className="p-4 pt-0 border-t border-gray-100"
                      >
                        <div className="mb-3">
                          <span className="text-sm font-medium text-gray-700">
                            {patients.length} Pacientes agendados:
                          </span>
                        </div>
                        <div className="space-y-2">
                          {patients.map(({ name, id }, i) => (
                            <div
                              key={id}
                              className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-200 rounded-lg transition-all hover:shadow-sm"
                            >
                              <span className="w-6 h-6 flex items-center justify-center text-xs font-medium text-gray-500 bg-white border border-gray-300 rounded-full">
                                {i + 1}
                              </span>
                              <span className="font-medium text-gray-800 flex-1">
                                {name}
                              </span>
                              <button
                                type="button"
                                className="px-3 py-1 text-sm font-medium text-red-600 hover:text-red-800 hover:bg-red-50 border border-red-200 rounded transition-colors"
                                onClick={() =>
                                  setConfirmRemove({
                                    id,
                                    date,
                                    name,
                                    type: activeTab,
                                  })
                                }
                                aria-label="Cancelar agendamento"
                              >
                                Cancelar
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )
              )
            ) : (
              <div className="text-center py-8 text-gray-500">
                <div className="text-sm">
                  {activeTab === "spiritual"
                    ? "Nenhuma consulta espiritual encontrada."
                    : "Nenhum banho de luz/bastão encontrado."}
                </div>
                <div className="text-xs mt-1">
                  Selecione uma data diferente ou crie um novo agendamento.
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ConfirmModal
        open={!!confirmRemove}
        title="Remover paciente"
        message={
          confirmRemove && (
            <span>
              Tem certeza que deseja remover{" "}
              <span className="text-red-600">{confirmRemove.name}</span> da
              lista?
            </span>
          )
        }
        confirmLabel="Remover"
        cancelLabel="Cancelar"
        onCancel={() => setConfirmRemove(null)}
        onConfirm={handleRemovePatient}
      />
      <NewAttendanceModal
        open={showNewAttendance}
        onClose={() => {
          setShowNewAttendance(false);
        }}
        onSubmit={handleNewAttendance}
      />
    </div>
  );
};

export default AgendaCalendar;

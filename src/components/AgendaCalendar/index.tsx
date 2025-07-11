"use client";

import React from "react";
import ConfirmModal from "@/components/ConfirmModal";
import NewAttendanceModal from "@/components/NewAttendanceModal";
import { useAgendaCalendar } from "./useAgendaCalendar";

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
    formatDateBR,
  } = useAgendaCalendar();

  return (
    <div className="max-w-2xl mx-auto p-4 bg-[color:var(--surface)] rounded shadow border border-[color:var(--border)]">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-[color:var(--primary-dark)]">
          Agenda
        </h2>
        <button
          className="button button-primary"
          onClick={() => setShowNewAttendance(true)}
        >
          + Novo Agendamento
        </button>
      </div>
      {/* Date input with label */}
      <label
        htmlFor="agenda-date"
        className="block text-sm font-medium text-[color:var(--primary-dark)] mb-1"
      >
        Selecione uma data para filtrar
      </label>
      <input
        id="agenda-date"
        type="date"
        className="input mb-4"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        lang="pt-BR"
      />
      {/* Tabs */}
      <div className="flex gap-0 mb-4 mt-8 width-full">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`tab-button${activeTab === tab.key ? " active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        className={`transition-opacity duration-200 ${
          isTabTransitioning ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
      >
        <div>
          {filteredAgenda[activeTab].length > 0 ? (
            filteredAgenda[activeTab].map(({ date, patients }, idx: number) => (
              <div
                key={date + "-" + activeTab + "-" + idx}
                className="mb-2 border rounded border-[color:var(--border)] bg-[color:var(--surface)]"
              >
                <button
                  type="button"
                  className="w-full flex justify-between items-center p-2 font-semibold text-[color:var(--primary-dark)] hover:bg-[color:var(--primary-light)]/20 transition rounded-t focus:outline-none"
                  onClick={() =>
                    setOpenAgendaIdx(openAgendaIdx === idx ? null : idx)
                  }
                  aria-expanded={openAgendaIdx === idx}
                  aria-controls={`agenda-patients-${idx}`}
                >
                  <span>
                    <b>Data:</b>{" "}
                    {formatDateBR(date.toLocaleDateString("pt-BR"))}
                  </span>
                  {openAgendaIdx === idx ? (
                    <span className="text-xs font-semibold text-[color:var(--primary-light)] px-2 py-1 rounded">
                      {activeTab === "spiritual"
                        ? "Consultas Espirituais"
                        : "Banhos de Luz/Bastão"}
                    </span>
                  ) : (
                    <span className="text-xs font-semibold text-[color:var(--primary-light)] px-2 py-1 rounded">
                      {patients.length} paciente
                      {patients.length !== 1 ? "s" : ""}
                    </span>
                  )}
                  <span
                    className={`ml-2 transition-transform ${
                      openAgendaIdx === idx ? "rotate-90" : ""
                    }`}
                  >
                    ▶
                  </span>
                </button>
                {openAgendaIdx === idx && (
                  <div id={`agenda-patients-${idx}`} className="p-2 pt-0">
                    <b>{patients.length} Pacientes:</b>
                    <ol className="ml-0 list-none flex flex-col gap-2 mt-2">
                      {patients.map(({ name, id }, i) => (
                        <li
                          key={id}
                          className="bg-[color:var(--surface-light)] border border-[color:var(--border)] rounded p-2 shadow-sm transition-all select-none flex items-center gap-2"
                        >
                          <span className="w-6 text-xs text-gray-500 font-bold text-center">
                            {i + 1}
                          </span>
                          <span className="font-medium text-[color:var(--primary-dark)] flex-1">
                            {name}
                          </span>
                          <button
                            type="button"
                            className="button button-outline text-red-500 hover:text-red-700"
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
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500">
              {activeTab === "spiritual"
                ? "Nenhuma consulta espiritual encontrada."
                : "Nenhum banho de luz/bastão encontrado."}
            </div>
          )}
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

"use client";

import React, { useState } from "react";
import { mockAgenda, mockPatients } from "@/services/mockData";
import { formatDateBR } from "@/utils/dateHelpers";
import { MoreVertical } from "react-feather";
import ConfirmModal from "@/components/ConfirmModal";
import NewAttendanceModal from "@/components/NewAttendanceModal";

const TABS = [
  { key: "spiritual", label: "Consultas Espirituais" },
  { key: "lightBath", label: "Banhos de Luz/Bastão" },
];

const AgendaCalendar: React.FC = () => {
  const [selectedDate, setSelectedDate] = useState("");
  const [agenda] = useState(mockAgenda);
  const [activeTab, setActiveTab] = useState("spiritual");
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);
  const [draggedOverIdx, setDraggedOverIdx] = useState<number | null>(null);
  const [agendaState, setAgendaState] = useState(agenda);
  const [allPatients] = useState(mockPatients.map((p) => p.name));
  const [confirmRemove, setConfirmRemove] = useState<{
    idx: number;
    i: number;
    name: string;
  } | null>(null);
  const [showNewAttendance, setShowNewAttendance] = useState(false);
  const [openAgendaIdx, setOpenAgendaIdx] = useState<number | null>(null);

  const filteredAgenda = agendaState.filter(
    (a) => a.type === activeTab && (!selectedDate || a.date === selectedDate)
  );

  // Drag and drop handlers for patient cards
  function handleDragStart(aIdx: number, pIdx: number) {
    setDraggedIdx(pIdx);
  }
  function handleDragOver(aIdx: number, pIdx: number, e: React.DragEvent) {
    e.preventDefault();
    setDraggedOverIdx(pIdx);
  }
  function handleDrop(aIdx: number, pIdx: number) {
    if (draggedIdx === null || draggedIdx === pIdx) return;
    setAgendaState((prev) => {
      const newAgenda = [...prev];
      const agendaItem = newAgenda[aIdx];
      const newPatients = [...agendaItem.patients];
      const [removed] = newPatients.splice(draggedIdx, 1);
      newPatients.splice(pIdx, 0, removed);
      newAgenda[aIdx] = { ...agendaItem, patients: newPatients };
      return newAgenda;
    });
    setDraggedIdx(null);
    setDraggedOverIdx(null);
  }
  function handleDragEnd() {
    setDraggedIdx(null);
    setDraggedOverIdx(null);
  }

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
      <input
        type="date"
        className="input mb-4"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        lang="pt-BR"
        placeholder="Selecione uma data"
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
      <div>
        {filteredAgenda.length > 0 ? (
          filteredAgenda.map((a, idx) => (
            <div
              key={a.date + "-" + activeTab + "-" + idx}
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
                  <b>Data:</b> {formatDateBR(a.date)}
                </span>
                {openAgendaIdx === idx ? (
                  <span className="text-xs font-semibold text-[color:var(--primary-light)] px-2 py-1 rounded">
                    {a.type === "spiritual"
                      ? "Consultas Espirituais"
                      : "Banhos de Luz/Bastão"}
                  </span>
                ) : (
                  <span className="text-xs font-semibold text-[color:var(--primary-light)] px-2 py-1 rounded">
                    {a.patients.length} paciente
                    {a.patients.length !== 1 ? "s" : ""}
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
                  <b>Pacientes:</b>
                  <ol className="ml-0 list-none flex flex-col gap-2 mt-2">
                    {a.patients.map((name, i) => (
                      <li
                        key={name + i}
                        draggable
                        onDragStart={() => handleDragStart(idx, i)}
                        onDragOver={(e) => handleDragOver(idx, i, e)}
                        onDrop={() => handleDrop(idx, i)}
                        onDragEnd={handleDragEnd}
                        className={`bg-[color:var(--surface-light)] border border-[color:var(--border)] rounded p-2 shadow-sm transition-all select-none cursor-move flex items-center gap-2
                          ${draggedIdx === i ? "opacity-60" : ""}
                          ${
                            draggedOverIdx === i && draggedIdx !== null
                              ? "ring-2 ring-[color:var(--primary)]"
                              : ""
                          }
                        `}
                      >
                        <span
                          className="text-gray-400 select-none flex items-center gap-0"
                          style={{ minWidth: 18 }}
                        >
                          <MoreVertical size={18} />
                          <MoreVertical size={18} className="-translate-x-3" />
                        </span>
                        <span className="w-6 text-xs text-gray-500 font-bold text-center">
                          {i + 1}
                        </span>
                        <span className="font-medium text-[color:var(--primary-dark)] flex-1">
                          {name}
                        </span>
                        <button
                          type="button"
                          className="button button-outline text-red-500 hover:text-red-700"
                          onClick={() => setConfirmRemove({ idx, i, name })}
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
      {/* Remove confirmation modal */}
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
        onConfirm={() => {
          if (!confirmRemove) return;
          setAgendaState((prev) => {
            const newAgenda = [...prev];
            const agendaItem = newAgenda[confirmRemove.idx];
            const newPatients = agendaItem.patients.filter(
              (_, j) => j !== confirmRemove.i
            );
            newAgenda[confirmRemove.idx] = {
              ...agendaItem,
              patients: newPatients,
            };
            return newAgenda;
          });
          setConfirmRemove(null);
        }}
      />
      {/* New Attendance Modal */}
      <NewAttendanceModal
        open={showNewAttendance}
        onClose={() => {
          setShowNewAttendance(false);
        }}
        onSubmit={(date, patient) => {
          // TODO: Add logic to actually add the attendance
          alert(`Agendado para ${patient} em ${date}`);
          setShowNewAttendance(false);
        }}
      />
    </div>
  );
};

export default AgendaCalendar;

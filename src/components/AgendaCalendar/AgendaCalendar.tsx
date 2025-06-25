"use client";

import React, { useState } from "react";
import { mockAgenda, mockPatients } from "@/services/mockData";
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
          className="button button-primary px-4 py-2 text-sm"
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
      />
      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            className={`button px-4 py-2 rounded-t font-semibold transition-colors duration-150 ${
              activeTab === tab.key
                ? "button-primary bg-[color:var(--primary-light)] border-b-2 border-[color:var(--primary)]"
                : "button-secondary bg-[color:var(--surface-light)] border-b-2 border-transparent"
            }`}
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
              className="mb-2 p-2 border rounded border-[color:var(--border)] bg-[color:var(--surface)]"
            >
              <div className="flex justify-between items-center mb-1">
                <div>
                  <b>Data:</b> {a.date}
                </div>
                <span className="text-xs font-semibold text-[color:var(--primary)] px-2 py-1 rounded">
                  {a.type === "spiritual"
                    ? "Consultas Espirituais"
                    : "Banhos de Luz/Bastão"}
                </span>
              </div>
              <div>
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
                        className="ml-2 text-red-500 hover:text-red-700 text-xs font-bold px-2 py-1 rounded"
                        onClick={() => setConfirmRemove({ idx, i, name })}
                        aria-label="Cancelar agendamento"
                      >
                        Cancelar
                      </button>
                    </li>
                  ))}
                </ol>
              </div>
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

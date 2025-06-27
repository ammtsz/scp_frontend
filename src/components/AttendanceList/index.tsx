"use client";

import React, { useState } from "react";
import { Edit } from "react-feather";
import CompleteAttendanceModal from "./CompleteAttendanceModal";
import ConfirmModal from "../ConfirmModal";
import { useAttendanceList } from "./useAttendanceList";
import DragAndDropSection from "./DragAndDropSection";

const AttendanceList: React.FC<{
  externalCheckIn?: { name: string; types: string[]; isNew: boolean } | null;
}> = ({ externalCheckIn }) => {
  const {
    typeLabels,
    setAttendance,
    selectedDate,
    setSelectedDate,
    checkedInPatients,
    setCheckedInPatients,
    completedPatients,
    setCompletedPatients,
    modal,
    setModal,
    completedData,
    setCompletedData,
    timestamps,
    setTimestamps,
    attendancesByType,
    dragged,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    showCheckinBothModal,
    setShowCheckinBothModal,
    handleCompleteAttendanceModalSubmit,
    handleCheckinBothCancel,
    handleCheckinBothConfirm,
  } = useAttendanceList(externalCheckIn);

  const [editMode, setEditMode] = useState<{ [key: string]: boolean }>({});
  const [editOrder, setEditOrder] = useState<{ [key: string]: string[] }>({});
  const [editDraggedIdx, setEditDraggedIdx] = useState<number | null>(null);

  const startEdit = (type: string) => {
    setEditMode((prev) => ({ ...prev, [type]: true }));
    setEditOrder((prev) => ({ ...prev, [type]: [...checkedInPatients[type]] }));
  };
  const cancelEdit = (type: string) => {
    setEditMode((prev) => ({ ...prev, [type]: false }));
    setEditOrder((prev) => ({ ...prev, [type]: [] }));
    setEditDraggedIdx(null);
  };
  const saveEdit = (type: string) => {
    setCheckedInPatients((prev) => ({ ...prev, [type]: editOrder[type] }));
    setEditMode((prev) => ({ ...prev, [type]: false }));
    setEditOrder((prev) => ({ ...prev, [type]: [] }));
    setEditDraggedIdx(null);
  };
  const handleEditDragStart = (idx: number) => setEditDraggedIdx(idx);
  const handleEditDragOver = (idx: number, type: string) => {
    if (editDraggedIdx === null || editDraggedIdx === idx) return;
    // Prevent moving to the last position if draggedIdx is the last and idx is the last
    if (
      editDraggedIdx === editOrder[type].length - 1 &&
      idx === editOrder[type].length - 1
    )
      return;
    // Prevent moving to the same position
    if (editDraggedIdx === idx) return;
    const newOrder = [...editOrder[type]];
    const [removed] = newOrder.splice(editDraggedIdx, 1);
    newOrder.splice(idx, 0, removed);
    setEditOrder((prev) => ({ ...prev, [type]: newOrder }));
    setEditDraggedIdx(idx);
  };
  const handleEditDrop = () => setEditDraggedIdx(null);

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-[color:var(--surface)] rounded shadow border border-[color:var(--border)]">
      <h2 className="text-xl font-bold mb-4 text-[color:var(--primary-dark)] flex items-center gap-2">
        Atendimentos de{" "}
        {selectedDate
          ? new Date(selectedDate + "T00:00:00").toLocaleDateString("pt-BR", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })
          : ""}
      </h2>
      <input
        type="date"
        className="input mb-4"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        lang="pt-BR"
      />
      <div className="flex flex-col gap-8 w-full">
        {(["spiritual", "lightBath"] as const).map((type) => (
          <div key={type} className="w-full">
            <h3 className="font-semibold text-lg mb-3 text-[color:var(--primary)] text-center">
              {typeLabels[type]}
            </h3>
            <div className="flex flex-row gap-4 w-full">
              {/* Scheduled section */}
              <div className="flex-1 min-w-[180px]">
                <DragAndDropSection
                  title="Agendados"
                  color="yellow"
                  border="yellow"
                  patients={attendancesByType[type]}
                  emptyText="Nenhum paciente agendado."
                  onDrop={() =>
                    handleDrop(type, attendancesByType[type].length, false)
                  }
                  renderPatient={(name: string, idx: number) => (
                    <div
                      key={name}
                      className={`h-24 w-full flex items-center justify-center rounded border bg-[color:var(--surface-light)] text-center font-medium transition-all cursor-move select-none ${
                        dragged &&
                        dragged.type === type &&
                        dragged.idx === idx &&
                        !dragged.fromCompleted
                          ? "opacity-60"
                          : "border-[color:var(--border)]"
                      }`}
                      draggable
                      onDragStart={() => handleDragStart(type, idx, false)}
                      onDragOver={(e) => handleDragOver(type, idx, e)}
                      onDrop={() => handleDrop(type, idx, false)}
                      onDragEnd={handleDragEnd}
                    >
                      {name}
                    </div>
                  )}
                />
              </div>
              {/* Checked-in section */}
              <div className="flex-1 min-w-[180px]">
                <DragAndDropSection
                  title="Sala de Espera"
                  color="blue"
                  border="blue"
                  patients={
                    editMode[type] ? editOrder[type] : checkedInPatients[type]
                  }
                  emptyText="Arraste aqui os pacientes para check-in"
                  onDrop={() =>
                    handleDrop(
                      type,
                      checkedInPatients[type].length,
                      true,
                      false
                    )
                  }
                  reorderButton={
                    editMode[type] ? null : (
                      <button
                        type="button"
                        className="drag-handle-btn bg-blue-100 hover:bg-blue-200 border border-blue-400 rounded p-1 cursor-pointer"
                        title="Reordenar lista"
                        onClick={() => startEdit(type)}
                      >
                        <Edit size={18} className="text-blue-700" />
                      </button>
                    )
                  }
                  renderPatient={(name: string, idx: number) => {
                    if (editMode[type]) {
                      return (
                        <div
                          key={name}
                          className={`h-24 w-full flex items-center justify-center p-2 rounded border-2 border-blue-400 bg-[color:var(--surface-light)] text-center font-medium transition-all cursor-move select-none relative ${
                            editDraggedIdx === idx
                              ? "opacity-60 border-blue-700"
                              : ""
                          }`}
                          draggable
                          onDragStart={() => handleEditDragStart(idx)}
                          onDragOver={(e) => {
                            e.preventDefault();
                            handleEditDragOver(idx, type);
                          }}
                          onDrop={handleEditDrop}
                          onDragEnd={handleEditDrop}
                        >
                          <span className="font-bold w-6 text-center">
                            {idx + 1}
                          </span>
                          <span className="flex-1">{name}</span>
                        </div>
                      );
                    }
                    const isExternal =
                      externalCheckIn &&
                      externalCheckIn.name === name &&
                      externalCheckIn.types.includes(type);
                    return (
                      <div
                        key={name}
                        className={`h-24 w-full flex items-center justify-center p-2 rounded border-2 ${
                          isExternal ? "border-blue-300" : "border-blue-500"
                        } bg-[color:var(--surface-light)] text-center font-medium transition-all cursor-move select-none relative ${
                          dragged &&
                          dragged.type === type &&
                          dragged.idx === idx &&
                          dragged.fromCheckedIn
                            ? "opacity-60"
                            : ""
                        }`}
                        draggable
                        onDragStart={() =>
                          handleDragStart(type, idx, true, false)
                        }
                        onDragEnd={handleDragEnd}
                      >
                        {timestamps[type][name]?.checkIn && (
                          <span className="absolute top-1 left-2 text-xs text-blue-700">
                            Check-in: {timestamps[type][name].checkIn}
                          </span>
                        )}
                        {idx + 1}. {name}
                      </div>
                    );
                  }}
                />
                {editMode[type] && (
                  <div className="flex justify-end gap-2 mt-2 w-full">
                    <button
                      className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
                      onClick={() => cancelEdit(type)}
                    >
                      Cancelar
                    </button>
                    <button
                      className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
                      onClick={() => saveEdit(type)}
                    >
                      Salvar
                    </button>
                  </div>
                )}
              </div>
              {/* Completed section */}
              <div className="flex-1 min-w-[180px]">
                <DragAndDropSection
                  title="Atendidos"
                  color="green"
                  border="green"
                  patients={completedPatients[type]}
                  emptyText="Arraste aqui os pacientes atendidos"
                  onDrop={() =>
                    handleDrop(
                      type,
                      completedPatients[type].length,
                      false,
                      true
                    )
                  }
                  renderPatient={(name: string, idx: number) => {
                    const isExternal =
                      externalCheckIn &&
                      externalCheckIn.name === name &&
                      externalCheckIn.types.includes(type);
                    return (
                      <div
                        key={name}
                        className={`h-24 w-full flex items-center justify-center p-2 rounded border-2 ${
                          isExternal ? "border-green-300" : "border-green-500"
                        } bg-[color:var(--surface-light)] text-center font-medium transition-all cursor-move select-none relative ${
                          dragged &&
                          dragged.type === type &&
                          dragged.idx === idx &&
                          dragged.fromCompleted
                            ? "opacity-60"
                            : ""
                        }`}
                        draggable
                        onDragStart={() =>
                          handleDragStart(type, idx, false, true)
                        }
                        onDragEnd={handleDragEnd}
                      >
                        {timestamps[type][name]?.checkIn && (
                          <span className="absolute top-1 left-2 text-xs text-green-700">
                            Check-in: {timestamps[type][name].checkIn}
                          </span>
                        )}
                        {name}
                        {timestamps[type][name]?.completed && (
                          <span className="absolute bottom-1 right-2 text-xs text-green-700">
                            Atendimento: {timestamps[type][name].completed}
                          </span>
                        )}
                      </div>
                    );
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <CompleteAttendanceModal
        open={!!modal?.open}
        patientName={modal?.patient || ""}
        onClose={() => setModal(null)}
        onSubmit={handleCompleteAttendanceModalSubmit}
      />
      {/* ConfirmModal for check-in both columns */}
      {showCheckinBothModal && (
        <ConfirmModal
          open={showCheckinBothModal.open}
          title="Check-in em ambas as colunas?"
          message={`O paciente "${showCheckinBothModal.patient}" está agendado nas duas colunas. Deseja fazer check-in em ambas?`}
          onCancel={handleCheckinBothCancel}
          onConfirm={handleCheckinBothConfirm}
        />
      )}
    </div>
  );
};

export default AttendanceList;

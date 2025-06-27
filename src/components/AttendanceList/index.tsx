"use client";

import React from "react";
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
      <div className="flex flex-col gap-8 md:flex-row md:gap-8">
        {(["spiritual", "lightBath"] as const).map((type) => (
          <div key={type} className="flex-1">
            <h3 className="font-semibold text-lg mb-3 text-[color:var(--primary)] text-center">
              {typeLabels[type]}
            </h3>
            {/* Scheduled section */}
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
                  className={`p-3 rounded border bg-[color:var(--surface-light)] text-center font-medium transition-all cursor-move select-none ${
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
            {/* Checked-in section */}
            <DragAndDropSection
              title="Check-in realizado"
              color="blue"
              border="blue"
              patients={checkedInPatients[type]}
              emptyText="Arraste aqui os pacientes para check-in"
              onDrop={() =>
                handleDrop(type, checkedInPatients[type].length, true, false)
              }
              renderPatient={(name: string, idx: number) => {
                const isExternal =
                  externalCheckIn &&
                  externalCheckIn.name === name &&
                  externalCheckIn.types.includes(type);
                return (
                  <div
                    key={name}
                    className={`p-3 rounded border-2 ${
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
                    onDragStart={() => handleDragStart(type, idx, true, false)}
                    onDragEnd={handleDragEnd}
                  >
                    {timestamps[type][name]?.checkIn && (
                      <span className="absolute bottom-1 left-2 text-xs text-blue-700">
                        {timestamps[type][name].checkIn}
                      </span>
                    )}
                    {name}
                  </div>
                );
              }}
            />
            {/* Completed section */}
            <DragAndDropSection
              title="Atendidos"
              color="green"
              border="green"
              patients={completedPatients[type]}
              emptyText="Arraste aqui os pacientes atendidos"
              onDrop={() =>
                handleDrop(type, completedPatients[type].length, false, true)
              }
              renderPatient={(name: string, idx: number) => {
                const isExternal =
                  externalCheckIn &&
                  externalCheckIn.name === name &&
                  externalCheckIn.types.includes(type);
                return (
                  <div
                    key={name}
                    className={`p-3 rounded border-2 ${
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
                    onDragStart={() => handleDragStart(type, idx, false, true)}
                    onDragEnd={handleDragEnd}
                  >
                    {timestamps[type][name]?.checkIn && (
                      <span className="absolute bottom-1 left-2 text-xs text-blue-700">
                        {timestamps[type][name].checkIn}
                      </span>
                    )}
                    {name}
                    {timestamps[type][name]?.completed && (
                      <span className="absolute bottom-1 right-2 text-xs text-green-700">
                        {timestamps[type][name].completed}
                      </span>
                    )}
                  </div>
                );
              }}
            />
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

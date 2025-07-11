"use client";

import React from "react";
import CompleteAttendanceModal from "./CompleteAttendanceModal";
import ConfirmModal from "../ConfirmModal";
import { useAttendanceList } from "./useAttendanceList";
import { IAttendanceProgression } from "@/types/db";

const AttendanceList: React.FC<{
  externalCheckIn?: { name: string; types: string[]; isNew: boolean } | null;
}> = ({ externalCheckIn }) => {
  const {
    typeLabels,
    attendance,
    selectedDate,
    setSelectedDate,
    modal,
    setModal,
    timestamps,
    dragged,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    showCheckinBothModal,
    handleCompleteAttendanceModalSubmit,
    handleCheckinBothCancel,
    handleCheckinBothConfirm,
  } = useAttendanceList(externalCheckIn);

  // Find attendance for selected date
  const attendanceByDate = attendance.find(
    (a) => a.date.toISOString().slice(0, 10) === selectedDate
  );

  // Helper to get patients for a status and type
  const getPatients = (
    type: "spiritual" | "lightBath",
    status: IAttendanceProgression
  ) => (attendanceByDate ? attendanceByDate[type][status] : []);

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
                <div className="mb-2 font-semibold text-yellow-700 text-center">
                  Agendados
                </div>
                <ul>
                  {getPatients(type, "scheduled").map((patient, idx) => (
                    <li
                      key={patient.name}
                      draggable
                      onDragStart={() =>
                        handleDragStart(type, idx, "scheduled")
                      }
                      onDragOver={(e) => handleDragOver(type, idx, e)}
                      onDrop={() =>
                        handleDrop(type, idx, "scheduled", "checkedIn")
                      }
                      onDragEnd={handleDragEnd}
                      className={`h-20 w-full flex items-center justify-center p-2 rounded border-2 border-yellow-400 bg-[color:var(--surface-light)] text-center font-medium transition-all cursor-move select-none ${
                        dragged &&
                        dragged.type === type &&
                        dragged.idx === idx &&
                        dragged.fromStatus === "scheduled"
                          ? "opacity-60"
                          : ""
                      }`}
                    >
                      {patient.name} ({patient.priority})
                    </li>
                  ))}
                </ul>
              </div>
              {/* Checked-in section */}
              <div className="flex-1 min-w-[180px]">
                <div className="mb-2 font-semibold text-blue-700 text-center">
                  Sala de Espera
                </div>
                <ul>
                  {getPatients(type, "checkedIn").map((patient, idx) => (
                    <li
                      key={patient.name}
                      draggable
                      onDragStart={() =>
                        handleDragStart(type, idx, "checkedIn")
                      }
                      onDragOver={(e) => handleDragOver(type, idx, e)}
                      onDrop={() =>
                        handleDrop(type, idx, "checkedIn", "onGoing")
                      }
                      onDragEnd={handleDragEnd}
                      className={`h-20 w-full flex items-center justify-center p-2 rounded border-2 border-blue-400 bg-[color:var(--surface-light)] text-center font-medium transition-all cursor-move select-none ${
                        dragged &&
                        dragged.type === type &&
                        dragged.idx === idx &&
                        dragged.fromStatus === "checkedIn"
                          ? "opacity-60"
                          : ""
                      }`}
                    >
                      {patient.name} ({patient.priority})
                      {timestamps[type][patient.name]?.checkIn && (
                        <span className="absolute top-1 left-2 text-xs text-blue-700">
                          Check-in: {timestamps[type][patient.name].checkIn}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
              {/* OnGoing section */}
              <div className="flex-1 min-w-[180px]">
                <div className="mb-2 font-semibold text-purple-700 text-center">
                  Em Atendimento
                </div>
                <ul>
                  {getPatients(type, "onGoing").map((patient, idx) => (
                    <li
                      key={patient.name}
                      draggable
                      onDragStart={() => handleDragStart(type, idx, "onGoing")}
                      onDragOver={(e) => handleDragOver(type, idx, e)}
                      onDrop={() =>
                        handleDrop(type, idx, "onGoing", "completed")
                      }
                      onDragEnd={handleDragEnd}
                      className={`h-20 w-full flex items-center justify-center p-2 rounded border-2 border-purple-400 bg-[color:var(--surface-light)] text-center font-medium transition-all cursor-move select-none ${
                        dragged &&
                        dragged.type === type &&
                        dragged.idx === idx &&
                        dragged.fromStatus === "onGoing"
                          ? "opacity-60"
                          : ""
                      }`}
                    >
                      {patient.name} ({patient.priority})
                    </li>
                  ))}
                </ul>
              </div>
              {/* Completed section */}
              <div className="flex-1 min-w-[180px]">
                <div className="mb-2 font-semibold text-green-700 text-center">
                  Atendidos
                </div>
                <ul>
                  {getPatients(type, "completed").map((patient, idx) => (
                    <li
                      key={patient.name}
                      draggable
                      onDragStart={() =>
                        handleDragStart(type, idx, "completed")
                      }
                      onDragOver={(e) => handleDragOver(type, idx, e)}
                      onDrop={() =>
                        handleDrop(type, idx, "completed", "scheduled")
                      }
                      onDragEnd={handleDragEnd}
                      className={`h-20 w-full flex items-center justify-center p-2 rounded border-2 border-green-400 bg-[color:var(--surface-light)] text-center font-medium transition-all cursor-move select-none ${
                        dragged &&
                        dragged.type === type &&
                        dragged.idx === idx &&
                        dragged.fromStatus === "completed"
                          ? "opacity-60"
                          : ""
                      }`}
                    >
                      {patient.name} ({patient.priority})
                      {timestamps[type][patient.name]?.completed && (
                        <span className="absolute bottom-1 right-2 text-xs text-green-700">
                          Atendimento:{" "}
                          {timestamps[type][patient.name].completed}
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
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

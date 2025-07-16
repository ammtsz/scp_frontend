"use client";

import React from "react";
import { useAttendanceList } from "./useAttendanceList";
import {
  IAttendanceProgression,
  IAttendanceType,
  IPriority,
} from "@/types/globas";
import ConfirmModal from "@/components/ConfirmModal/index";
import AttendanceColumn from "./AttendanceColumn";

const AttendanceList: React.FC<{
  externalCheckIn?: {
    name: string;
    types: string[];
    isNew: boolean;
    priority?: IPriority;
  } | null;
  onCheckInProcessed?: () => void;
}> = ({ externalCheckIn, onCheckInProcessed }) => {
  const {
    selectedDate,
    setSelectedDate,
    dragged,
    handleDragStart,
    handleDragEnd,
    getPatients,
    confirmOpen,
    handleDropWithConfirm,
    handleConfirm,
    handleCancel,
    multiSectionModalOpen,
    handleMultiSectionConfirm,
    handleMultiSectionCancel,
    checkInProcessed,
    setCheckInProcessed,
  } = useAttendanceList(externalCheckIn);

  React.useEffect(() => {
    if (checkInProcessed && onCheckInProcessed) {
      onCheckInProcessed();
      setCheckInProcessed(false);
    }
  }, [checkInProcessed, onCheckInProcessed, setCheckInProcessed]);

  const [collapsed, setCollapsed] = React.useState<{
    [key in IAttendanceType]: boolean;
  }>({ spiritual: false, lightBath: false });

  return (
    <div className="w-full max-w-5xl mx-auto p-4 bg-[color:var(--surface)] rounded shadow border border-[color:var(--border)]">
      <h2 className="text-xl font-bold mb-4 text-[color:var(--primary-dark)] flex items-center gap-2">
        Atendimentos de {selectedDate}
      </h2>
      <input
        type="date"
        className="input mb-4"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        lang="pt-BR"
      />
      <div className="flex flex-col gap-8 w-full">
        {(["spiritual", "lightBath"] as IAttendanceType[]).map((type) => (
          <div key={type} className="w-full">
            <button
              className="w-full text-left mb-2 px-2 py-1 rounded bg-[color:var(--surface-light)] border border-[color:var(--border)] font-semibold text-[color:var(--primary-dark)]"
              onClick={() =>
                setCollapsed((prev) => ({ ...prev, [type]: !prev[type] }))
              }
            >
              {type === "spiritual"
                ? (collapsed[type] ? "▶ " : "▼ ") + "Consultas Espirituais"
                : (collapsed[type] ? "▶ " : "▼ ") + "Banho de Luz/Bastão"}
            </button>
            {!collapsed[type] && (
              <div className="flex flex-row gap-4 w-full">
                {(
                  [
                    "scheduled",
                    "checkedIn",
                    "onGoing",
                    "completed",
                  ] as IAttendanceProgression[]
                ).map((status) => (
                  <AttendanceColumn
                    key={status}
                    status={status}
                    type={type}
                    patients={getPatients(type, status)}
                    dragged={dragged}
                    handleDragStart={handleDragStart}
                    handleDragEnd={handleDragEnd}
                    handleDrop={() => handleDropWithConfirm(type, status)}
                  />
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
      <ConfirmModal
        open={confirmOpen}
        message="Tem certeza que deseja mover este atendimento para uma etapa anterior?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
      <ConfirmModal
        open={multiSectionModalOpen}
        message="Este paciente está agendado nas duas consultas. Deseja mover para 'Sala de Espera' em ambas?"
        confirmLabel="Mover em ambas"
        cancelLabel="Apenas nesta seção"
        onConfirm={handleMultiSectionConfirm}
        onCancel={handleMultiSectionCancel}
      />
    </div>
  );
};

export default AttendanceList;

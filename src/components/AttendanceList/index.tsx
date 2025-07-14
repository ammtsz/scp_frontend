"use client";

import React from "react";
import { useAttendanceList } from "./useAttendanceList";
import { IAttendanceProgression, IAttendanceType } from "@/types/db";
import ConfirmModal from "@/components/ConfirmModal/index";
import AttendanceColumn from "./AttendanceColumn";

const AttendanceList: React.FC<{
  externalCheckIn?: { name: string; types: string[]; isNew: boolean } | null;
}> = ({ externalCheckIn }) => {
  const {
    selectedDate,
    setSelectedDate,
    dragged,
    handleDragStart,
    handleDragEnd,
    handleDrop,
    getPatients,
  } = useAttendanceList(externalCheckIn);

  const [confirmOpen, setConfirmOpen] = React.useState(false);
  const [pendingDrop, setPendingDrop] = React.useState<{
    toType: IAttendanceType;
    toStatus: IAttendanceProgression;
  } | null>(null);

  // Helper to determine if drop is backward
  const isBackwardDrop = (
    from: IAttendanceProgression,
    to: IAttendanceProgression
  ) => {
    const order = ["scheduled", "checkedIn", "onGoing", "completed"];
    return order.indexOf(to) < order.indexOf(from);
  };

  // Modified drop handler
  const handleDropWithConfirm = (
    toType: IAttendanceType,
    toStatus: IAttendanceProgression
  ) => {
    if (!dragged) return;
    if (isBackwardDrop(dragged.status, toStatus)) {
      setPendingDrop({ toType, toStatus });
      setConfirmOpen(true);
    } else {
      handleDrop(toType, toStatus);
    }
  };

  const handleConfirm = () => {
    if (pendingDrop && dragged) {
      handleDrop(pendingDrop.toType, pendingDrop.toStatus);
    }
    setConfirmOpen(false);
    setPendingDrop(null);
  };

  const handleCancel = () => {
    setConfirmOpen(false);
    setPendingDrop(null);
  };

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
            <h3 className="text-lg font-semibold mb-2 text-[color:var(--primary-dark)] text-center">
              {type === "spiritual"
                ? "Consultas Espirituais"
                : "Banho de Luz/Bastão"}
            </h3>
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
                  handleDrop={handleDropWithConfirm}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <ConfirmModal
        open={confirmOpen}
        message="Tem certeza que deseja mover este atendimento para uma etapa anterior?"
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
};

export default AttendanceList;

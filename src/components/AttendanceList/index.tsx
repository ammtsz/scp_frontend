"use client";

import { useEffect, useState } from "react";
import { useAttendances } from "@/contexts/AttendancesContext";
import {
  IAttendanceProgression,
  IAttendanceType,
  IPriority,
  IAttendanceStatusDetail,
} from "@/types/globals";
import { IDraggedItem } from "./types";
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
    attendancesByDate,
    loading,
    error,
    refreshCurrentDate,
  } = useAttendances();

  // Local state for drag and drop functionality
  const [dragged, setDragged] = useState<IDraggedItem | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDrop, setPendingDrop] = useState<{
    toType: IAttendanceType;
    toStatus: IAttendanceProgression;
  } | null>(null);
  const [multiSectionModalOpen, setMultiSectionModalOpen] = useState(false);
  const [multiSectionPending, setMultiSectionPending] = useState<{
    name: string;
    fromStatus: IAttendanceProgression;
    toStatus: IAttendanceProgression;
  } | null>(null);
  const [checkInProcessed, setCheckInProcessed] = useState(false);

  // Inject externalCheckIn into checkedIn columns if present
  useEffect(() => {
    if (
      externalCheckIn &&
      attendancesByDate &&
      Array.isArray(externalCheckIn.types) &&
      externalCheckIn.types.length > 0 &&
      !checkInProcessed // Prevent re-processing
    ) {
      externalCheckIn.types.forEach((type) => {
        if (
          attendancesByDate[type as IAttendanceType] &&
          !attendancesByDate[type as IAttendanceType].checkedIn.some(
            (p) => p.name === externalCheckIn.name
          )
        ) {
          attendancesByDate[type as IAttendanceType].checkedIn.push({
            name: externalCheckIn.name,
            priority: externalCheckIn.priority || "3",
            checkedInTime: new Date(),
          });
        }
      });
      setCheckInProcessed(true);
    }
  }, [externalCheckIn, attendancesByDate, checkInProcessed]);

  // Get patients for a specific type and status
  const getPatients = (
    type: IAttendanceType,
    status: IAttendanceProgression
  ): IAttendanceStatusDetail[] => {
    if (!attendancesByDate) return [];
    return attendancesByDate[type][status] || [];
  };

  // Drag and drop handlers
  const handleDragStart = (
    type: IAttendanceType,
    idx: number,
    status: IAttendanceProgression
  ) => {
    setDragged({ type, status, idx });
  };

  const handleDragEnd = () => {
    setDragged(null);
  };

  const handleDropWithConfirm = (
    toType: IAttendanceType,
    toStatus: IAttendanceProgression
  ) => {
    if (!dragged || !attendancesByDate) return;

    const fromPatients = getPatients(dragged.type, dragged.status);
    if (dragged.idx >= fromPatients.length) return;

    const patient = fromPatients[dragged.idx];

    // Check if moving between different sections of the same type
    if (dragged.type === toType && dragged.status !== toStatus) {
      setMultiSectionPending({
        name: patient.name,
        fromStatus: dragged.status,
        toStatus: toStatus,
      });
      setMultiSectionModalOpen(true);
      return;
    }

    // For moves between different types, show confirmation
    setPendingDrop({ toType, toStatus });
    setConfirmOpen(true);
  };

  const handleConfirm = () => {
    if (!dragged || !pendingDrop || !attendancesByDate) return;

    const fromPatients = getPatients(dragged.type, dragged.status);
    const patient = fromPatients[dragged.idx];

    // Remove from source
    fromPatients.splice(dragged.idx, 1);

    // Add to destination with updated times
    const updatedPatient = { ...patient };
    if (pendingDrop.toStatus === "checkedIn") {
      updatedPatient.checkedInTime = new Date();
    } else if (pendingDrop.toStatus === "onGoing") {
      updatedPatient.onGoingTime = new Date();
    } else if (pendingDrop.toStatus === "completed") {
      updatedPatient.completedTime = new Date();
    }

    attendancesByDate[pendingDrop.toType][pendingDrop.toStatus].push(
      updatedPatient
    );

    // Reset state
    setConfirmOpen(false);
    setPendingDrop(null);
    setDragged(null);

    // Refresh to sync with backend
    refreshCurrentDate();
  };

  const handleCancel = () => {
    setConfirmOpen(false);
    setPendingDrop(null);
    setDragged(null);
  };

  const handleMultiSectionConfirm = () => {
    if (!dragged || !multiSectionPending || !attendancesByDate) return;

    const fromPatients = getPatients(dragged.type, dragged.status);
    const patient = fromPatients[dragged.idx];

    // Remove from source
    fromPatients.splice(dragged.idx, 1);

    // Add to destination with updated times
    const updatedPatient = { ...patient };
    if (multiSectionPending.toStatus === "checkedIn") {
      updatedPatient.checkedInTime = new Date();
    } else if (multiSectionPending.toStatus === "onGoing") {
      updatedPatient.onGoingTime = new Date();
    } else if (multiSectionPending.toStatus === "completed") {
      updatedPatient.completedTime = new Date();
    }

    attendancesByDate[dragged.type][multiSectionPending.toStatus].push(
      updatedPatient
    );

    // Reset state
    setMultiSectionModalOpen(false);
    setMultiSectionPending(null);
    setDragged(null);

    // Refresh to sync with backend
    refreshCurrentDate();
  };

  const handleMultiSectionCancel = () => {
    setMultiSectionModalOpen(false);
    setMultiSectionPending(null);
    setDragged(null);
  };

  useEffect(() => {
    if (checkInProcessed && onCheckInProcessed) {
      onCheckInProcessed();
      setCheckInProcessed(false);
    }
  }, [checkInProcessed, onCheckInProcessed]); // Remove setCheckInProcessed from dependencies

  const [collapsed, setCollapsed] = useState<{
    [key in IAttendanceType]: boolean;
  }>({ spiritual: false, lightBath: false });

  // Show loading state
  if (loading) {
    return (
      <div className="w-full max-w-5xl mx-auto p-4 bg-[color:var(--surface)] rounded shadow border border-[color:var(--border)]">
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-[color:var(--text-muted)]">
            Carregando atendimentos...
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="w-full max-w-5xl mx-auto p-4 bg-[color:var(--surface)] rounded shadow border border-[color:var(--border)]">
        <div className="flex flex-col items-center justify-center h-64 gap-4">
          <div className="text-lg text-red-600">
            Erro ao carregar atendimentos
          </div>
          <div className="text-sm text-[color:var(--text-muted)]">{error}</div>
          <button
            className="px-4 py-2 bg-[color:var(--primary)] text-white rounded hover:bg-[color:var(--primary-dark)]"
            onClick={refreshCurrentDate}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

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

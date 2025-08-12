"use client";

import {
  IAttendanceProgression,
  IAttendanceType,
  IPriority,
} from "@/types/globals";
import ConfirmModal from "@/components/ConfirmModal/index";
import AttendanceColumn from "./AttendanceColumn";
import { useAttendanceList } from "./useAttendanceList";
import { useUnscheduledPatients } from "@/components/UnscheduledPatients/useUnscheduledPatients";

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
    // Data
    selectedDate,
    setSelectedDate,
    loading,
    error,

    // State
    dragged,
    confirmOpen,
    multiSectionModalOpen,
    collapsed,

    // Functions
    getPatients,
    handleDragStart,
    handleDragEnd,
    handleDropWithConfirm,
    handleConfirm,
    handleCancel,
    handleMultiSectionConfirm,
    handleMultiSectionCancel,
    toggleCollapsed,
    refreshCurrentDate,
  } = useAttendanceList({ externalCheckIn, onCheckInProcessed });

  // Add delete functionality
  const { handleDeleteAttendance } = useUnscheduledPatients();

  const handleDelete = async (attendanceId: number, patientName: string) => {
    const success = await handleDeleteAttendance(attendanceId, patientName);
    if (success) {
      // Refresh the attendance list to reflect the deletion
      refreshCurrentDate();
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg text-[color:var(--text-muted)]">
          Carregando atendimentos...
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
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
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto p-4">
      <h2 className="text-lg mb-4 text-[color:var(--primary-dark)] flex items-center gap-2">
        Data selecionada:
      </h2>
      <input
        type="date"
        className="input mb-4 h-11"
        value={selectedDate}
        onChange={(e) => setSelectedDate(e.target.value)}
        lang="pt-BR"
      />
      <div className="flex flex-col w-full">
        {/* Spiritual Section - unchanged */}
        <div key="spiritual" className="w-full">
          <button
            className="w-full text-left mb-2 px-2 py-1 rounded bg-[color:var(--surface-light)] border border-[color:var(--border)] font-semibold text-[color:var(--primary-dark)]"
            onClick={() => toggleCollapsed("spiritual")}
          >
            {collapsed.spiritual ? "▶ " : "▼ "}Consultas Espirituais
          </button>
          {!collapsed.spiritual && (
            <div className="flex flex-row gap-4 w-full mb-8">
              {(
                [
                  "scheduled",
                  "checkedIn",
                  "onGoing",
                  "completed",
                ] as IAttendanceProgression[]
              ).map((status) => {
                // For spiritual section, just spiritual patients
                const spiritualPatients = getPatients("spiritual", status).map(
                  (patient) => ({
                    ...patient,
                    originalType: "spiritual" as IAttendanceType,
                  })
                );

                return (
                  <AttendanceColumn
                    key={status}
                    status={status}
                    patients={spiritualPatients}
                    dragged={dragged}
                    handleDragStart={handleDragStart}
                    handleDragEnd={handleDragEnd}
                    handleDrop={() =>
                      handleDropWithConfirm("spiritual", status)
                    }
                    onDelete={handleDelete}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* LightBath + Rod  Section */}
        <div key="mixed" className="w-full">
          <button
            className="w-full text-left mb-2 px-2 py-1 rounded bg-[color:var(--surface-light)] border border-[color:var(--border)] font-semibold text-[color:var(--primary-dark)]"
            onClick={() => {
              // Toggle both lightBath and rod together for mixed section
              toggleCollapsed("lightBath");
              toggleCollapsed("rod");
            }}
          >
            {collapsed.lightBath && collapsed.rod ? "▶ " : "▼ "}Banhos de Luz +
            Bastão
          </button>
          {!(collapsed.lightBath && collapsed.rod) && (
            <div className="flex flex-row gap-4 w-full mb-8">
              {(
                [
                  "scheduled",
                  "checkedIn",
                  "onGoing",
                  "completed",
                ] as IAttendanceProgression[]
              ).map((status) => {
                // Combine lightBath and rod patients with type information
                const lightBathPatients = getPatients("lightBath", status).map(
                  (patient) => ({
                    ...patient,
                    originalType: "lightBath" as IAttendanceType,
                  })
                );
                const rodPatients = getPatients("rod", status).map(
                  (patient) => ({
                    ...patient,
                    originalType: "rod" as IAttendanceType,
                  })
                );
                const mixedPatients = [...lightBathPatients, ...rodPatients];

                return (
                  <AttendanceColumn
                    key={status}
                    status={status}
                    patients={mixedPatients}
                    dragged={dragged}
                    handleDragStart={handleDragStart}
                    handleDragEnd={handleDragEnd}
                    handleDrop={() => {
                      // For mixed section, we need to determine the drop target based on drag source
                      if (dragged?.type === "lightBath") {
                        handleDropWithConfirm("lightBath", status);
                      } else if (dragged?.type === "rod") {
                        handleDropWithConfirm("rod", status);
                      }
                    }}
                    onDelete={handleDelete}
                  />
                );
              })}
            </div>
          )}
        </div>
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

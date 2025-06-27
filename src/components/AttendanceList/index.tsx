"use client";

import React, { useState } from "react";
import { mockAttendance } from "@/services/mockData";
import CompleteAttendanceModal from "./CompleteAttendanceModal";
import ConfirmModal from "../ConfirmModal";

function getClosestAttendanceDate(attendance: { date: string }[]) {
  const today = new Date().toISOString().slice(0, 10);
  const futureOrToday = attendance
    .map((a) => a.date)
    .filter((date) => date >= today)
    .sort();
  if (futureOrToday.length > 0) return futureOrToday[0];
  // fallback: pick the latest past date if no future
  const past = attendance
    .map((a) => a.date)
    .filter((date) => date < today)
    .sort();
  return past.length > 0 ? past[past.length - 1] : "";
}

const typeLabels = {
  spiritual: "Consulta Espiritual",
  lightBath: "Banho de Luz/Bastão",
};

type AttendanceType = "spiritual" | "lightBath";

// Helper to ensure type is AttendanceType
const isAttendanceType = (type: string): type is AttendanceType =>
  type === "spiritual" || type === "lightBath";

const AttendanceList: React.FC<{
  externalCheckIn?: { name: string; types: string[]; isNew: boolean } | null;
}> = ({ externalCheckIn }) => {
  const [attendance, setAttendance] = useState(mockAttendance);
  const [selectedDate, setSelectedDate] = useState(() =>
    getClosestAttendanceDate(mockAttendance)
  );
  // For demo: checked-in patients are hardcoded. Replace with real state as needed.
  const [checkedInPatients, setCheckedInPatients] = useState<
    Record<AttendanceType, string[]>
  >({ spiritual: [], lightBath: [] });
  const [completedPatients, setCompletedPatients] = useState<
    Record<AttendanceType, string[]>
  >({ spiritual: [], lightBath: [] });
  const [modal, setModal] = useState<{
    open: boolean;
    patient: string;
    type: AttendanceType;
  } | null>(null);
  const [completedData, setCompletedData] = useState<any[]>([]);

  // Add timestamp state for checked-in and completed
  const [timestamps, setTimestamps] = useState<
    Record<
      AttendanceType,
      Record<string, { checkIn?: string; completed?: string }>
    >
  >({ spiritual: {}, lightBath: {} });

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Find attendances for the selected date
  const attendancesByType = attendance
    .filter((a) => !selectedDate || a.date === selectedDate)
    .reduce(
      (acc, a) => {
        acc[a.type] = a.patients.filter(
          (name) =>
            !checkedInPatients[a.type].includes(name) &&
            !completedPatients[a.type].includes(name)
        );
        return acc;
      },
      { spiritual: [], lightBath: [] } as Record<AttendanceType, string[]>
    );

  // Drag and drop logic
  const [dragged, setDragged] = useState<{
    type: AttendanceType;
    idx: number;
    fromCheckedIn?: boolean;
    fromCompleted?: boolean;
  } | null>(null);

  const handleDragStart = (
    type: AttendanceType,
    idx: number,
    fromCheckedIn = false,
    fromCompleted = false
  ) => {
    setDragged({ type, idx, fromCheckedIn, fromCompleted });
  };

  const handleDragOver = (
    type: AttendanceType,
    idx: number,
    e: React.DragEvent
  ) => {
    e.preventDefault();
  };

  const handleDrop = (
    type: AttendanceType,
    idx: number,
    toCheckedIn = false,
    toCompleted = false
  ) => {
    if (!dragged || dragged.type !== type) return;
    let patient = "";
    if (dragged.fromCheckedIn) {
      patient = checkedInPatients[type][dragged.idx];
    } else if (dragged.fromCompleted) {
      patient = completedPatients[type][dragged.idx];
    } else {
      patient = attendancesByType[type][dragged.idx];
    }

    if (toCheckedIn) {
      // Check if patient is also in the other column's scheduled list
      const otherType: AttendanceType =
        type === "spiritual" ? "lightBath" : "spiritual";
      const isInOtherScheduled = attendancesByType[otherType].includes(patient);
      if (isInOtherScheduled) {
        setShowCheckinBothModal({ open: true, patient, type, otherType });
        setDragged(null);
        return;
      }
      // Move to checked-in (always to bottom)
      setCheckedInPatients((prev) => {
        const newChecked = { ...prev };
        // Remove from all sections
        newChecked[type] = newChecked[type].filter((n) => n !== patient);
        if (!newChecked[type].includes(patient)) {
          newChecked[type] = [...newChecked[type], patient];
        }
        return newChecked;
      });
      setCompletedPatients((prev) => {
        const newCompleted = { ...prev };
        newCompleted[type] = newCompleted[type].filter((n) => n !== patient);
        return newCompleted;
      });
      setAttendance((prev) => {
        return prev.map((a) => {
          if (a.date === selectedDate && a.type === type) {
            return {
              ...a,
              patients: a.patients.filter((n) => n !== patient),
            };
          }
          return a;
        });
      });
      setTimestamps((prev) => {
        const newTimestamps = { ...prev };
        if (!newTimestamps[type][patient]) newTimestamps[type][patient] = {};
        newTimestamps[type][patient].checkIn = getCurrentTime();
        delete newTimestamps[type][patient].completed;
        return newTimestamps;
      });
    } else if (toCompleted) {
      setModal({ open: true, patient, type });
      // Timestamp for completed will be set after modal submit
    } else {
      // Move back to scheduled (always to bottom)
      setCheckedInPatients((prev) => {
        const newChecked = { ...prev };
        newChecked[type] = newChecked[type].filter((n) => n !== patient);
        return newChecked;
      });
      setCompletedPatients((prev) => {
        const newCompleted = { ...prev };
        newCompleted[type] = newCompleted[type].filter((n) => n !== patient);
        return newCompleted;
      });
      setAttendance((prev) => {
        return prev.map((a) => {
          if (a.date === selectedDate && a.type === type) {
            if (!a.patients.includes(patient)) {
              return {
                ...a,
                patients: [...a.patients, patient],
              };
            }
          }
          return a;
        });
      });
      setTimestamps((prev) => {
        const newTimestamps = { ...prev };
        if (newTimestamps[type][patient]) {
          delete newTimestamps[type][patient].checkIn;
          delete newTimestamps[type][patient].completed;
        }
        return newTimestamps;
      });
    }
    setDragged(null);
  };

  const handleDragEnd = () => setDragged(null);

  const [showCheckinBothModal, setShowCheckinBothModal] = useState<{
    open: boolean;
    patient: string;
    type: AttendanceType;
    otherType: AttendanceType;
  } | null>(null);

  // Add effect to handle external check-in from CheckIn form
  React.useEffect(() => {
    if (
      externalCheckIn &&
      externalCheckIn.name &&
      externalCheckIn.types.length > 0
    ) {
      externalCheckIn.types.forEach((type) => {
        if (!isAttendanceType(type)) return;
        setCheckedInPatients((prev) => {
          const newChecked = { ...prev };
          if (!newChecked[type].includes(externalCheckIn.name)) {
            newChecked[type] = [...newChecked[type], externalCheckIn.name];
          }
          return newChecked;
        });
        setTimestamps((prev) => {
          const newTimestamps = { ...prev };
          if (!newTimestamps[type][externalCheckIn.name])
            newTimestamps[type][externalCheckIn.name] = {};
          newTimestamps[type][externalCheckIn.name].checkIn = getCurrentTime();
          delete newTimestamps[type][externalCheckIn.name].completed;
          return newTimestamps;
        });
      });
    }
  }, [externalCheckIn]);

  return (
    <div className="w-full max-w-2xl mx-auto p-4 bg-[color:var(--surface)] rounded shadow border border-[color:var(--border)]">
      <h2 className="text-xl font-bold mb-4 text-[color:var(--primary-dark)]">
        Lista de Atendimentos
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
            <div className="mb-6">
              <h4 className="font-semibold text-base mb-2 text-yellow-700 text-center">
                Agendados
              </h4>
              <div
                className="flex flex-col gap-2 min-h-[40px] bg-[color:var(--surface)] rounded border border-dashed border-yellow-400 p-2"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() =>
                  handleDrop(type, attendancesByType[type].length, false)
                }
              >
                {attendancesByType[type].length ? (
                  attendancesByType[type].map((name, idx) => (
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
                  ))
                ) : (
                  <div className="text-sm text-gray-500 text-center min-h-[40px] flex items-center justify-center">
                    Nenhum paciente agendado.
                  </div>
                )}
              </div>
            </div>
            {/* Checked-in section */}
            <div className="mt-6">
              <h4 className="font-semibold text-base mb-2 text-blue-700 text-center">
                Check-in realizado
              </h4>
              <div
                className="flex flex-col gap-2 min-h-[40px] bg-[color:var(--surface)] rounded border border-dashed border-blue-400 p-2"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() =>
                  handleDrop(type, checkedInPatients[type].length, true, false)
                }
              >
                {checkedInPatients[type].length ? (
                  checkedInPatients[type].map((name, idx) => {
                    // Use lighter border if patient was added via externalCheckIn
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
                        onDragStart={() =>
                          handleDragStart(type, idx, true, false)
                        }
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
                  })
                ) : (
                  <div className="text-sm text-gray-400 text-center">
                    Arraste aqui os pacientes para check-in
                  </div>
                )}
              </div>
            </div>
            {/* Completed section */}
            <div className="mt-6">
              <h4 className="font-semibold text-base mb-2 text-green-700 text-center">
                Atendidos
              </h4>
              <div
                className="flex flex-col gap-2 min-h-[40px] bg-[color:var(--surface)] rounded border border-dashed border-green-400 p-2"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() =>
                  handleDrop(type, completedPatients[type].length, false, true)
                }
              >
                {completedPatients[type].length ? (
                  completedPatients[type].map((name, idx) => {
                    // Use lighter border if patient was added via externalCheckIn
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
                        onDragStart={() =>
                          handleDragStart(type, idx, false, true)
                        }
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
                  })
                ) : (
                  <div className="text-sm text-gray-400 text-center">
                    Arraste aqui os pacientes atendidos
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      <CompleteAttendanceModal
        open={!!modal?.open}
        patientName={modal?.patient || ""}
        onClose={() => setModal(null)}
        onSubmit={({ notes, recommendations }) => {
          if (!modal) return;
          setCompletedPatients((prev) => {
            const newCompleted = { ...prev };
            if (!newCompleted[modal.type].includes(modal.patient)) {
              newCompleted[modal.type] = [
                ...newCompleted[modal.type],
                modal.patient,
              ];
            }
            return newCompleted;
          });
          setCheckedInPatients((prev) => {
            const newChecked = { ...prev };
            newChecked[modal.type] = newChecked[modal.type].filter(
              (n) => n !== modal.patient
            );
            return newChecked;
          });
          setCompletedData((prev) => [
            ...prev,
            {
              patient: modal.patient,
              type: modal.type,
              notes,
              recommendations,
              date: selectedDate,
            },
          ]);
          setTimestamps((prev) => {
            const newTimestamps = { ...prev };
            if (!newTimestamps[modal.type][modal.patient])
              newTimestamps[modal.type][modal.patient] = {};
            newTimestamps[modal.type][modal.patient].completed =
              getCurrentTime();
            return newTimestamps;
          });
          setModal(null);
          setAttendance((prev) => {
            return prev.map((a) => {
              if (a.date === selectedDate && a.type === modal.type) {
                return {
                  ...a,
                  patients: a.patients.filter((n) => n !== modal.patient),
                };
              }
              return a;
            });
          });
        }}
      />
      {/* ConfirmModal for check-in both columns */}
      {showCheckinBothModal && (
        <ConfirmModal
          open={showCheckinBothModal.open}
          title="Check-in em ambas as colunas?"
          message={`O paciente "${showCheckinBothModal.patient}" está agendado nas duas colunas. Deseja fazer check-in em ambas?`}
          onCancel={() => {
            // Move only the dragged card to check-in for the current type
            const { patient, type } = showCheckinBothModal;
            setCheckedInPatients((prev) => {
              const newChecked = { ...prev };
              newChecked[type] = newChecked[type].filter((n) => n !== patient);
              if (!newChecked[type].includes(patient)) {
                newChecked[type] = [...newChecked[type], patient];
              }
              return newChecked;
            });
            setCompletedPatients((prev) => {
              const newCompleted = { ...prev };
              newCompleted[type] = newCompleted[type].filter(
                (n) => n !== patient
              );
              return newCompleted;
            });
            setAttendance((prev) => {
              return prev.map((a) => {
                if (a.date === selectedDate && a.type === type) {
                  return {
                    ...a,
                    patients: a.patients.filter((n) => n !== patient),
                  };
                }
                return a;
              });
            });
            setTimestamps((prev) => {
              const newTimestamps = { ...prev };
              if (!newTimestamps[type][patient])
                newTimestamps[type][patient] = {};
              newTimestamps[type][patient].checkIn = getCurrentTime();
              delete newTimestamps[type][patient].completed;
              return newTimestamps;
            });
            setShowCheckinBothModal(null);
          }}
          onConfirm={() => {
            // Check-in in both columns
            const { patient, type, otherType } = showCheckinBothModal;
            [type, otherType].forEach((t) => {
              setCheckedInPatients((prev) => {
                const newChecked = { ...prev };
                newChecked[t] = newChecked[t].filter((n) => n !== patient);
                if (!newChecked[t].includes(patient)) {
                  newChecked[t] = [...newChecked[t], patient];
                }
                return newChecked;
              });
              setCompletedPatients((prev) => {
                const newCompleted = { ...prev };
                newCompleted[t] = newCompleted[t].filter((n) => n !== patient);
                return newCompleted;
              });
              setAttendance((prev) => {
                return prev.map((a) => {
                  if (a.date === selectedDate && a.type === t) {
                    return {
                      ...a,
                      patients: a.patients.filter((n) => n !== patient),
                    };
                  }
                  return a;
                });
              });
              setTimestamps((prev) => {
                const newTimestamps = { ...prev };
                if (!newTimestamps[t][patient]) newTimestamps[t][patient] = {};
                newTimestamps[t][patient].checkIn = getCurrentTime();
                delete newTimestamps[t][patient].completed;
                return newTimestamps;
              });
            });
            setShowCheckinBothModal(null);
          }}
        />
      )}
    </div>
  );
};

export default AttendanceList;

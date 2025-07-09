import { useState, useEffect } from "react";
import { useAttendances } from "@/contexts/AttendancesContext";

type AttendanceType = "spiritual" | "lightBath";

const typeLabels = {
  spiritual: "Consulta Espiritual",
  lightBath: "Banho de Luz/Bastão",
};

const isAttendanceType = (type: string): type is AttendanceType =>
  type === "spiritual" || type === "lightBath";

function getClosestAttendanceDate(attendance: { date: string }[]) {
  const today = new Date().toISOString().slice(0, 10);
  const futureOrToday = attendance
    .map((a) => a.date)
    .filter((date) => date >= today)
    .sort();
  if (futureOrToday.length > 0) return futureOrToday[0];
  const past = attendance
    .map((a) => a.date)
    .filter((date) => date < today)
    .sort();
  return past.length > 0 ? past[past.length - 1] : "";
}

export function useAttendanceList(externalCheckIn?: { name: string; types: string[]; isNew: boolean } | null) {
  const { attendances } = useAttendances();
  const [attendance, setAttendance] = useState(attendances);
  const [selectedDate, setSelectedDate] = useState(() => getClosestAttendanceDate(attendances));
  const [checkedInPatients, setCheckedInPatients] = useState<Record<AttendanceType, string[]>>({ spiritual: [], lightBath: [] });
  const [completedPatients, setCompletedPatients] = useState<Record<AttendanceType, string[]>>({ spiritual: [], lightBath: [] });
  const [modal, setModal] = useState<{ open: boolean; patient: string; type: AttendanceType } | null>(null);
  const [completedData, setCompletedData] = useState<any[]>([]);
  const [timestamps, setTimestamps] = useState<Record<AttendanceType, Record<string, { checkIn?: string; completed?: string }>>>({ spiritual: {}, lightBath: {} });
  const [dragged, setDragged] = useState<{ type: AttendanceType; idx: number; fromCheckedIn?: boolean; fromCompleted?: boolean } | null>(null);
  const [showCheckinBothModal, setShowCheckinBothModal] = useState<{ open: boolean; patient: string; type: AttendanceType; otherType: AttendanceType } | null>(null);

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

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
    let fromSection = "scheduled";
    if (dragged.fromCheckedIn) {
      patient = checkedInPatients[type][dragged.idx];
      fromSection = "checkedIn";
    } else if (dragged.fromCompleted) {
      patient = completedPatients[type][dragged.idx];
      fromSection = "completed";
    } else {
      patient = attendancesByType[type][dragged.idx];
    }

    // Prevent re-dropping in the same section at any position
    if (
      (toCheckedIn && fromSection === "checkedIn") ||
      (toCompleted && fromSection === "completed") ||
      (!toCheckedIn && !toCompleted && fromSection === "scheduled")
    ) {
      return;
    }

    if (toCheckedIn) {
      const otherType: AttendanceType = type === "spiritual" ? "lightBath" : "spiritual";
      const isInOtherScheduled = attendancesByType[otherType].includes(patient);
      if (isInOtherScheduled) {
        setShowCheckinBothModal({ open: true, patient, type, otherType });
        setDragged(null);
        return;
      }
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
    } else {
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

  useEffect(() => {
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

  // Add modal action handlers
  function handleCompleteAttendanceModalSubmit({ notes, recommendations }: { notes: string; recommendations: any }) {
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
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
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
  }

  function handleCheckinBothCancel() {
    if (!showCheckinBothModal) return;
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
      if (!newTimestamps[type][patient])
        newTimestamps[type][patient] = {};
      newTimestamps[type][patient].checkIn =
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });
      delete newTimestamps[type][patient].completed;
      return newTimestamps;
    });
    setShowCheckinBothModal(null);
  }

  function handleCheckinBothConfirm() {
    if (!showCheckinBothModal) return;
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
        newTimestamps[t][patient].checkIn =
          new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
        delete newTimestamps[t][patient].completed;
        return newTimestamps;
      });
    });
    setShowCheckinBothModal(null);
  }

  return {
    typeLabels,
    isAttendanceType,
    attendance,
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
    setDragged,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    showCheckinBothModal,
    setShowCheckinBothModal,
    handleCompleteAttendanceModalSubmit,
    handleCheckinBothCancel,
    handleCheckinBothConfirm,
  };
}

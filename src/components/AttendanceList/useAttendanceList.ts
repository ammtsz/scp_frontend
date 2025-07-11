import { useState, useEffect } from "react";
import { useAttendances } from "@/contexts/AttendancesContext";
import { IAttendance, IAttendanceType, IRecommendations } from "@/types/db";
import { useAttendanceListV2 } from "./useAttendanceListV2";

const typeLabels: Record<IAttendanceType, string> = {
  spiritual: "Consulta Espiritual",
  lightBath: "Banho de Luz/Bastão",
};

const isAttendanceType = (type: string): type is IAttendanceType =>
  type === "spiritual" || type === "lightBath";
interface CompletedAttendance {
  patient: string;
  type: IAttendanceType;
  notes: string;
  recommendations: IRecommendations;
  date: string;
}

export function useAttendanceList(externalCheckIn?: { name: string; types: string[]; isNew: boolean } | null) {
  const { attendances } = useAttendances();
  const [attendance, setAttendance] = useState<IAttendance[]>(attendances);
  const [checkedInPatients, setCheckedInPatients] = useState<Record<IAttendanceType, string[]>>({ spiritual: [], lightBath: [] });
  const [completedPatients, setCompletedPatients] = useState<Record<IAttendanceType, string[]>>({ spiritual: [], lightBath: [] });
  
  const { getClosestAttendanceDate, movePatient } = useAttendanceListV2(attendance, checkedInPatients, completedPatients, "");
  
  const [selectedDate, setSelectedDate] = useState(() => getClosestAttendanceDate());
  const [modal, setModal] = useState<{ open: boolean; patient: string; type: IAttendanceType } | null>(null);
  const [completedData, setCompletedData] = useState<CompletedAttendance[]>([]);
  const [timestamps, setTimestamps] = useState<Record<IAttendanceType, Record<string, { checkIn?: string; completed?: string }>>>({ spiritual: {}, lightBath: {} });
  const [dragged, setDragged] = useState<{ type: IAttendanceType; idx: number; fromStatus: keyof IAttendance[IAttendanceType] } | null>(null);
  const [showCheckinBothModal, setShowCheckinBothModal] = useState<{ open: boolean; patient: string; type: IAttendanceType; otherType: IAttendanceType } | null>(null);

  const attendancesByType = {
    spiritual: attendance[0]?.spiritual || [],
    lightBath: attendance[0]?.lightBath || [],
  };

  const getCurrentTime = () => {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Drag and drop logic using new structure
  const handleDragStart = (
    type: IAttendanceType,
    idx: number,
    fromStatus: keyof IAttendance[IAttendanceType]
  ) => {
    setDragged({ type, idx, fromStatus });
  };

  // Prevent default to allow drop
  // This is necessary to allow dropping on the target element
  // without triggering the browser's default behavior
  // such as opening the dragged element in a new tab
  // or navigating to a different page.
  const handleDragOver = (
    type: IAttendanceType,
    idx: number,
    e: React.DragEvent
  ) => {
    e.preventDefault();
  };

  const handleDrop = (
    type: IAttendanceType,
    idx: number,
    fromStatus: keyof IAttendance[IAttendanceType],
    toStatus: keyof IAttendance[IAttendanceType]
  ) => {
    if (!dragged || dragged.type !== type) return;

    // Get patient name from the correct array
    let patientName = "";
    const attendanceByDate = attendance.find(
      (a) => a.date.toISOString().slice(0, 10) === selectedDate
    );
    
    if (!attendanceByDate) return;
    patientName = attendanceByDate[type][fromStatus][dragged.idx]?.name;
    
    if (!patientName) return;
    
    // Move patient using new logic
    setAttendance(() => movePatient(type, patientName, fromStatus, toStatus));
    setDragged(null);
  };

  const handleDragEnd = () => setDragged(null);

  // Handle external check-in (pacientes não agendados -?-)
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
    // Use movePatient to remove patient from onGoing and add to completed
    setAttendance((prev) => movePatient(modal.type, modal.patient, "onGoing", "completed"));
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
    // Use movePatient to remove patient from checkedIn and add to scheduled
    setAttendance((prev) => movePatient(type, patient, "checkedIn", "scheduled"));
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
      // Use movePatient to remove patient from checkedIn and add to onGoing for both types
      setAttendance((prev) => movePatient(t, patient, "checkedIn", "onGoing"));
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

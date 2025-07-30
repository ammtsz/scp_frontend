import { useState, useEffect, useMemo } from "react";
import { IAgenda, IAttendanceType, IPriority } from "@/types/globals";
import { usePatients } from "@/contexts/PatientsContext";
import { mockAgenda } from "@/api/mockData";

export const TABS: { key: IAttendanceType; label: string }[] = [
  { key: "spiritual", label: "Consultas Espirituais" },
  { key: "lightBath", label: "Banhos de Luz/Bastão" },
];

export function useAgendaCalendar() {
  const contextAgenda = mockAgenda as IAgenda; // Replace with useAgenda() when backend is ready
  const { patients } = usePatients();
  const [selectedDate, setSelectedDate] = useState("");
  const [activeTab, setActiveTab] = useState<IAttendanceType>("spiritual");
  const [agendaState, setAgendaState] = useState<IAgenda>(contextAgenda);
  const [confirmRemove, setConfirmRemove] = useState<{
    id: string;
    date: Date;
    name: string;
    type: IAttendanceType;
  } | null>(null);
  const [showNewAttendance, setShowNewAttendance] = useState(false);
  const [openAgendaIdx, setOpenAgendaIdx] = useState<number | null>(null);
  const [isTabTransitioning, setIsTabTransitioning] = useState(false);

  // Helper to convert a Date to 'YYYY-MM-DD' string for input[type=date] comparison
  function toInputDateString(date: Date) {
    return date.toISOString().slice(0, 10);
  }

  const filteredAgenda = useMemo(
    () => ({
      spiritual: agendaState.spiritual.filter(
        (a) => !selectedDate || toInputDateString(a.date) === selectedDate
      ),
      lightBath: agendaState.lightBath.filter(
        (a) => !selectedDate || toInputDateString(a.date) === selectedDate
      ),
    }),
    [agendaState.spiritual, agendaState.lightBath, selectedDate]
  );

  useEffect(() => {

    if (filteredAgenda[activeTab].length > 0) {
      setOpenAgendaIdx(0);
    } else {
      setOpenAgendaIdx(null);
    }
  }, [activeTab, agendaState.spiritual, agendaState.lightBath, selectedDate, filteredAgenda]);

  useEffect(() => {
    if (isTabTransitioning) {
      const timeout = setTimeout(() => setIsTabTransitioning(false), 100);
      return () => clearTimeout(timeout);
    }
  }, [isTabTransitioning]);

  function handleTabChange(tabKey: IAttendanceType) {
    if (tabKey !== activeTab) {
      setIsTabTransitioning(true);
      setTimeout(() => setActiveTab(tabKey), 100);
    }
  }

  function handleRemovePatient() {
    if (!confirmRemove) return;
    setAgendaState((prev) => {
      const newAgenda = { ...prev };
      const type = confirmRemove.type;
      newAgenda[type] = newAgenda[type].map((a) => {
        if (toInputDateString(a.date) === toInputDateString(confirmRemove.date)) {
          return {
            ...a,
            patients: a.patients.filter((p) => p.id !== confirmRemove.id),
          };
        }
        return a;
      });
      return newAgenda;
    });
    setConfirmRemove(null);
  }

  function handleNewAttendance(
    patientName: string,
    types: string[],
    isNew: boolean,
    priority: IPriority,
    date?: string
  ) {
    let patient = patients.find((p) => p.name === patientName);
    if (!patient) {
      // If new, generate a new id (simple random for demo)
      patient = {
        id: Math.random().toString(36).slice(2, 10),
        name: patientName,
        phone: "",
        priority,
        status: "T",
      };
    }
    // For each selected type, add to agenda
    types.forEach((type) => {
      setAgendaState((prev) => {
        const agendaArr = prev[type as IAttendanceType] || [];
        // Find agenda item for the date
        const agendaDate = date ? new Date(date) : new Date();
        const dateStr = agendaDate.toISOString().slice(0, 10);
        let found = false;
        const newArr = agendaArr.map((item) => {
          if (item.date.toISOString().slice(0, 10) === dateStr) {
            found = true;
            // Avoid duplicate patient
            if (!item.patients.some((p) => p.id === patient!.id)) {
              return {
                ...item,
                patients: [...item.patients, { id: patient!.id, name: patient!.name, priority: patient!.priority }],
              };
            }
          }
          return item;
        });
        if (!found) {
          // Add new agenda item for this date
          newArr.push({
            date: agendaDate,
            patients: [{ id: patient.id, name: patient.name, priority: patient.priority }],
          });
        }
        return { ...prev, [type]: newArr };
      });
    });
    setShowNewAttendance(false);
  }

  return {
    TABS,
    selectedDate,
    setSelectedDate,
    activeTab,
    setActiveTab: handleTabChange,
    agendaState,
    setAgendaState,
    confirmRemove,
    setConfirmRemove,
    showNewAttendance,
    setShowNewAttendance,
    openAgendaIdx,
    setOpenAgendaIdx,
    isTabTransitioning,
    filteredAgenda,
    handleRemovePatient,
    handleNewAttendance,
  };
}

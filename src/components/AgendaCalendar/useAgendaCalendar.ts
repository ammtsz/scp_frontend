import { useState, useEffect } from "react";
import { useAgenda } from "@/contexts/AgendaContext";
import { formatDateBR } from "@/utils/dateHelpers";

export const TABS = [
  { key: "spiritual", label: "Consultas Espirituais" },
  { key: "lightBath", label: "Banhos de Luz/Bastão" },
];

export function useAgendaCalendar() {
  const { agenda: contextAgenda, setAgenda: setContextAgenda } = useAgenda();
  const [selectedDate, setSelectedDate] = useState("");
  const [activeTab, setActiveTab] = useState("spiritual");
  const [agendaState, setAgendaState] = useState(contextAgenda);
  const [confirmRemove, setConfirmRemove] = useState<{
    idx: number;
    i: number;
    name: string;
  } | null>(null);
  const [showNewAttendance, setShowNewAttendance] = useState(false);
  const [openAgendaIdx, setOpenAgendaIdx] = useState<number | null>(null);
  const [isTabTransitioning, setIsTabTransitioning] = useState(false);

  const filteredAgenda = agendaState.filter(
    (a) => a.type === activeTab && (!selectedDate || a.date === selectedDate)
  );

  useEffect(() => {
    if (filteredAgenda.length > 0) {
      setOpenAgendaIdx(0);
    } else {
      setOpenAgendaIdx(null);
    }
  }, [filteredAgenda.length]);

  useEffect(() => {
    if (isTabTransitioning) {
      const timeout = setTimeout(() => setIsTabTransitioning(false), 100);
      return () => clearTimeout(timeout);
    }
  }, [isTabTransitioning]);

  function handleTabChange(tabKey: string) {
    if (tabKey !== activeTab) {
      setIsTabTransitioning(true);
      setTimeout(() => setActiveTab(tabKey), 100);
    }
  }

  function handleRemovePatient() {
    if (!confirmRemove) return;
    setAgendaState((prev) => {
      const newAgenda = [...prev];
      const agendaItem = newAgenda[confirmRemove.idx];
      const newPatients = agendaItem.patients.filter(
        (_, j) => j !== confirmRemove.i
      );
      newAgenda[confirmRemove.idx] = {
        ...agendaItem,
        patients: newPatients,
      };
    // TODO: Add logic to actually remove the attendance
      return newAgenda;
    });
    setConfirmRemove(null);
  }

  function handleNewAttendance(date: string, patient: string) {
    // TODO: Add logic to actually add the attendance
    alert(`Agendado para ${patient} em ${date}`);
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
    formatDateBR,
  };
}

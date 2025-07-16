import { useState, useEffect, useMemo } from "react";
import { useAgenda } from "@/contexts/AgendaContext";
import { formatDateBR } from "@/utils/dateHelpers";
import { IAgenda, IAttendanceType } from "@/types/globas";

export const TABS: { key: IAttendanceType; label: string }[] = [
  { key: "spiritual", label: "Consultas Espirituais" },
  { key: "lightBath", label: "Banhos de Luz/Bastão" },
];

export function useAgendaCalendar() {
  const { agenda: contextAgenda } = useAgenda();
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

  
  const filteredAgenda = useMemo(() => ({
    spiritual: agendaState.spiritual.filter(
      (a) => !selectedDate || a.date.toLocaleDateString("pt-BR") === selectedDate
    ),
    lightBath: agendaState.lightBath.filter(
      (a) => !selectedDate || a.date.toLocaleDateString("pt-BR") === selectedDate
    ),
  }), [agendaState.spiritual, agendaState.lightBath, selectedDate]);

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
        if (a.date.toLocaleDateString("pt-BR") === confirmRemove.date.toLocaleDateString("pt-BR")) {
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

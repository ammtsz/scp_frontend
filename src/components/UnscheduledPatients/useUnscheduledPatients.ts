import { useState } from "react";
import { usePatients } from "@/contexts/PatientsContext";
import { IPriority } from "@/types/globals";

export const attendanceTypes = [
  { value: "spiritual", label: "Consulta Espiritual" },
  { value: "lightBath", label: "Banho de Luz/Bastão" },
];

export function useUnscheduledPatients(onRegisterNewAttendance?: (patientName: string, types: string[], isNew: boolean, priority: "1" | "2" | "3") => void) {
  const { patients } = usePatients();
  const [search, setSearch] = useState("");
  const [hasNewAttendance, setHasNewAttendance] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [priority, setPriority] = useState<IPriority>("3");
  const [collapsed, setCollapsed] = useState(true);

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleRegisterNewAttendance(e: React.FormEvent) {
    e.preventDefault();
    const name = isNewPatient ? search : selectedPatient;
    if ((isNewPatient && search) || (!isNewPatient && selectedPatient)) {
      setHasNewAttendance(true);
      if (onRegisterNewAttendance && name) {
        onRegisterNewAttendance(name, selectedTypes, isNewPatient, priority);
      }
      setSearch("");
      setShowDropdown(false);
      setSelectedPatient("");
      setSelectedTypes([]);
      setIsNewPatient(false);
      setCollapsed(true);
      return true;
    }
    return false;
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    setSelectedPatient("");
    setShowDropdown(true);
    setHasNewAttendance(false);
  }

  function handleSelect(name: string) {
    const selected = filteredPatients.find((p) => p.name === name);
    setSelectedPatient(name);
    setSearch(name);
    setShowDropdown(false);
    setHasNewAttendance(false);
    if (selected) {
      setPriority(selected.priority);
    }
  }

  function handleTypeCheckbox(e: React.ChangeEvent<HTMLInputElement>) {
    const { value, checked } = e.target;
    setSelectedTypes((prev) =>
      checked ? [...prev, value] : prev.filter((t) => t !== value)
    );
  }

  return {
    search,
    setSearch,
    hasNewAttendance,
    setHasNewAttendance,
    selectedPatient,
    setSelectedPatient,
    showDropdown,
    setShowDropdown,
    isNewPatient,
    setIsNewPatient,
    selectedTypes,
    setSelectedTypes,
    priority,
    setPriority,
    collapsed,
    setCollapsed,
    filteredPatients,
    handleRegisterNewAttendance,
    handleInputChange,
    handleSelect,
    handleTypeCheckbox,
  };
}

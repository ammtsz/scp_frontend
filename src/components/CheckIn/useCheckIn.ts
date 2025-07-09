import { useState } from "react";
import { usePatients } from "@/contexts/PatientsContext";

export const attendanceTypes = [
  { value: "spiritual", label: "Consulta Espiritual" },
  { value: "lightBath", label: "Banho de Luz/Bastão" },
];

export function useCheckIn(onCheckIn?: (patientName: string, types: string[], isNew: boolean) => void) {
  const { patients } = usePatients();
  const [search, setSearch] = useState("");
  const [checkedIn, setCheckedIn] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [collapsed, setCollapsed] = useState(false);

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleCheckIn(e: React.FormEvent) {
    e.preventDefault();
    const name = isNewPatient ? search : selectedPatient;
    if ((isNewPatient && search) || (!isNewPatient && selectedPatient)) {
      setCheckedIn(true);
      if (onCheckIn && name) {
        onCheckIn(name, selectedTypes, isNewPatient);
      }
      setSearch("");
      setShowDropdown(false);
      setSelectedPatient("");
      setSelectedTypes([]);
      setIsNewPatient(false);
    }
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSearch(e.target.value);
    setSelectedPatient("");
    setShowDropdown(true);
    setCheckedIn(false);
  }

  function handleSelect(name: string) {
    setSelectedPatient(name);
    setSearch(name);
    setShowDropdown(false);
    setCheckedIn(false);
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
    checkedIn,
    setCheckedIn,
    selectedPatient,
    setSelectedPatient,
    showDropdown,
    setShowDropdown,
    isNewPatient,
    setIsNewPatient,
    selectedTypes,
    setSelectedTypes,
    collapsed,
    setCollapsed,
    filteredPatients,
    handleCheckIn,
    handleInputChange,
    handleSelect,
    handleTypeCheckbox,
  };
}

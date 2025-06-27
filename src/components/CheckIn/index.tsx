import React, { useState } from "react";
import { mockPatients } from "@/services/mockData";
import { Search } from "react-feather";

const attendanceTypes = [
  { value: "spiritual", label: "Consulta Espiritual" },
  { value: "lightBath", label: "Banho de Luz/Bastão" },
];

// Add prop to receive callback for check-in from CheckIn form
interface CheckInProps {
  onCheckIn?: (patientName: string, types: string[], isNew: boolean) => void;
}

const CheckIn: React.FC<CheckInProps> = ({ onCheckIn }) => {
  const [search, setSearch] = useState("");
  const [checkedIn, setCheckedIn] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const filteredPatients = mockPatients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleCheckIn = (e: React.FormEvent) => {
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
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setSelectedPatient("");
    setShowDropdown(true);
  };

  const handleSelect = (name: string) => {
    setSelectedPatient(name);
    setSearch(name);
    setShowDropdown(false);
  };

  // Replace multiselect with checkboxes for attendance types
  const handleTypeCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setSelectedTypes((prev) =>
      checked ? [...prev, value] : prev.filter((t) => t !== value)
    );
  };

  return (
    <form
      className="w-full max-w-2xl mx-auto p-4 bg-[color:var(--surface)] rounded shadow border border-[color:var(--border)]"
      onSubmit={handleCheckIn}
      autoComplete="off"
    >
      <h2 className="text-xl font-bold mb-4 text-[color:var(--primary-dark)] text-center">
        Check-in para paciente não agendado
      </h2>

      <div className="relative mb-2">
        {isNewPatient ? (
          <input
            className="input w-full pr-10"
            placeholder="Nome do novo paciente..."
            value={search}
            onChange={handleInputChange}
            required
          />
        ) : (
          <>
            <input
              className="input w-full pr-10"
              placeholder="Buscar paciente pelo nome..."
              value={search}
              onChange={handleInputChange}
              onFocus={() => setShowDropdown(true)}
              required
            />
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            {showDropdown && search && filteredPatients.length > 0 && (
              <ul className="absolute z-10 bg-white border border-gray-200 w-full max-h-40 overflow-y-auto rounded shadow">
                {filteredPatients.map((p) => (
                  <li
                    key={p.id}
                    className="px-4 py-2 cursor-pointer hover:bg-gray-100"
                    onClick={() => handleSelect(p.name)}
                  >
                    {p.name}
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </div>
      <div className="flex items-center gap-2 mb-8">
        <input
          id="new-patient-checkbox"
          type="checkbox"
          checked={isNewPatient}
          onChange={() => setIsNewPatient((v) => !v)}
        />
        <label htmlFor="new-patient-checkbox" className="text-sm select-none">
          Novo paciente
        </label>
      </div>
      <div className="mb-2">
        <label className="block font-bold mb-1">Tipo de atendimento</label>
        <div className="flex gap-4">
          {attendanceTypes.map((type) => (
            <label key={type.value} className="flex items-center gap-1">
              <input
                type="checkbox"
                value={type.value}
                checked={selectedTypes.includes(type.value)}
                onChange={handleTypeCheckbox}
              />
              <span>{type.label}</span>
            </label>
          ))}
        </div>
      </div>
      <button
        type="submit"
        className="button button-primary mt-2"
        disabled={
          isNewPatient
            ? !search || selectedTypes.length === 0
            : !selectedPatient || selectedTypes.length === 0
        }
      >
        Fazer Check-in
      </button>
      {checkedIn && (
        <div className="mt-2 text-green-600">
          Check-in realizado para {isNewPatient ? search : selectedPatient}!
        </div>
      )}
    </form>
  );
};

export default CheckIn;

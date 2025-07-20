import React from "react";
import { Search } from "react-feather";
import {
  attendanceTypes,
  useUnscheduledPatients,
} from "../UnscheduledPatients/useUnscheduledPatients";
import { IPriority } from "@/types/globas";
import ConfirmModal from "@/components/ConfirmModal";

interface NewAttendanceFormProps {
  onRegisterNewAttendance?: (
    patientName: string,
    types: string[],
    isNew: boolean,
    priority: IPriority,
    date?: string
  ) => void;
  submitLabel?: string;
  showSuccessModal?: boolean;
  showDateField?: boolean;
}

const NewAttendanceForm: React.FC<NewAttendanceFormProps> = ({
  onRegisterNewAttendance,
  submitLabel = "Salvar",
  showSuccessModal = false,
  showDateField = false,
}) => {
  const {
    search,
    setHasNewAttendance,
    selectedPatient,
    showDropdown,
    setShowDropdown,
    isNewPatient,
    setIsNewPatient,
    selectedTypes,
    priority,
    setPriority,
    filteredPatients,
    handleRegisterNewAttendance,
    handleInputChange,
    handleSelect,
    handleTypeCheckbox,
  } = useUnscheduledPatients();

  const [modalOpen, setModalOpen] = React.useState(false);
  const [date, setDate] = React.useState("");
  const [patientExists, setPatientExists] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNewPatient) {
      // Check if patient already exists
      const exists = filteredPatients.some(
        (p) => p.name.trim().toLowerCase() === search.trim().toLowerCase()
      );
      if (exists) {
        setPatientExists(true);
        return;
      } else {
        setPatientExists(false);
      }
    }
    const success = handleRegisterNewAttendance(e);
    if (success && onRegisterNewAttendance) {
      onRegisterNewAttendance(
        isNewPatient ? search : selectedPatient,
        selectedTypes,
        isNewPatient,
        priority,
        showDateField ? date : undefined
      );
    }
    if (success && showSuccessModal) {
      setModalOpen(true);
      setHasNewAttendance(false);
    }
  };

  return (
    <>
      <form className="" onSubmit={handleSubmit} autoComplete="off">
        {showDateField && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Data</label>
            <input
              type="date"
              className="input w-full"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              lang="pt-BR"
            />
          </div>
        )}
        <div className="relative mb-2">
          {isNewPatient ? (
            <>
              <input
                className="input w-full pr-10"
                placeholder="Nome do novo paciente..."
                value={search}
                onChange={handleInputChange}
                required
              />
              {patientExists && (
                <span className="mt-1 text-xs text-red-600">
                  Paciente já cadastrado.
                </span>
              )}
            </>
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
        <div className="flex items-center gap-2 mb-4">
          <input
            id="new-patient-checkbox"
            type="checkbox"
            checked={isNewPatient}
            onChange={(e) => setIsNewPatient(e.target.checked)}
          />
          <label htmlFor="new-patient-checkbox" className="text-sm select-none">
            Novo paciente
          </label>
        </div>
        <div className="mb-4">
          {isNewPatient ? (
            <>
              <label className="block font-bold mb-1">Prioridade</label>
              <select
                className="input w-full"
                value={priority}
                onChange={(e) => setPriority(e.target.value as IPriority)}
              >
                <option value="1">1 - Alta</option>
                <option value="2">2 - Média</option>
                <option value="3">3 - Baixa</option>
              </select>
            </>
          ) : null}
        </div>
        <div className="mb-4">
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
        <div className="flex justify-end">
          <button
            type="submit"
            className="button button-primary mt-6"
            disabled={
              isNewPatient
                ? !search ||
                  selectedTypes.length === 0 ||
                  !priority ||
                  (showDateField && !date)
                : !selectedPatient ||
                  selectedTypes.length === 0 ||
                  !priority ||
                  (showDateField && !date)
            }
          >
            {submitLabel}
          </button>
        </div>
      </form>
      {showSuccessModal && (
        <ConfirmModal
          open={modalOpen}
          message="Salvo com sucesso!"
          confirmLabel="Fechar"
          onConfirm={() => setModalOpen(false)}
        />
      )}
    </>
  );
};

export default NewAttendanceForm;

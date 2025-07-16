import React from "react";
import { Search, ChevronDown, ChevronUp } from "react-feather";
import { attendanceTypes, useCheckIn } from "./useCheckIn";
import { IPriority } from "@/types/db";
import ConfirmModal from "@/components/ConfirmModal/index";

// Add prop to receive callback for check-in from CheckIn form
interface CheckInProps {
  onCheckIn?: (
    patientName: string,
    types: string[],
    isNew: boolean,
    priority: IPriority
  ) => void;
}

const CheckIn: React.FC<CheckInProps> = ({ onCheckIn }) => {
  const {
    search,
    setCheckedIn,
    selectedPatient,
    showDropdown,
    setShowDropdown,
    isNewPatient,
    setIsNewPatient,
    selectedTypes,
    collapsed,
    setCollapsed,
    filteredPatients,
    handleCheckIn,
    handleInputChange,
    handleSelect,
    handleTypeCheckbox,
    priority,
    setPriority,
  } = useCheckIn(onCheckIn);

  const [modalOpen, setModalOpen] = React.useState(false);

  const handleCheckInWithModal = (e: React.FormEvent) => {
    const success = handleCheckIn(e);
    if (success) {
      setModalOpen(true);
      setCheckedIn(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-4 bg-[color:var(--surface)] rounded shadow border border-[color:var(--border)]">
      <button
        type="button"
        className="flex items-center justify-between w-full text-xl font-bold text-[color:var(--primary-dark)] focus:outline-none"
        onClick={() => setCollapsed((c) => !c)}
        aria-expanded={!collapsed}
        aria-controls="not-scheduled-form"
      >
        <span>Pacientes não agendados</span>
        {collapsed ? (
          <ChevronDown className="w-6 h-6" />
        ) : (
          <ChevronUp className="w-6 h-6" />
        )}
      </button>
      {!collapsed && (
        <form
          id="not-scheduled-form"
          className=""
          onSubmit={handleCheckInWithModal}
          autoComplete="off"
        >
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
            <label
              htmlFor="new-patient-checkbox"
              className="text-sm select-none"
            >
              Novo paciente
            </label>
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
          <div className="mb-2">
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
          </div>
          <button
            type="submit"
            className="button button-primary mt-2"
            disabled={
              isNewPatient
                ? !search || selectedTypes.length === 0 || !priority
                : !selectedPatient || selectedTypes.length === 0 || !priority
            }
          >
            Fazer Check-in
          </button>
        </form>
      )}
      <ConfirmModal
        open={modalOpen}
        message="Check-in realizado com sucesso!"
        confirmLabel="Fechar"
        cancelLabel=""
        onConfirm={() => setModalOpen(false)}
      />
    </div>
  );
};

export default CheckIn;

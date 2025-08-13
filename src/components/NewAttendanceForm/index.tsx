import React from "react";
import { Search } from "react-feather";
import {
  attendanceTypes,
  useUnscheduledPatients,
} from "../UnscheduledPatients/useUnscheduledPatients";
import { IPriority } from "@/types/globals";
import ConfirmModal from "@/components/ConfirmModal";
import Switch from "@/components/Switch";

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
  autoCheckIn?: boolean;
  customNotes?: string;
  showNotesField?: boolean;
}

const NewAttendanceForm: React.FC<NewAttendanceFormProps> = ({
  onRegisterNewAttendance,
  submitLabel = "Salvar",
  showSuccessModal = false,
  showDateField = false,
  autoCheckIn = true,
  customNotes = "",
  showNotesField = false,
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
    isSubmitting,
    error,
    success,
    notes,
    setNotes,
  } = useUnscheduledPatients(onRegisterNewAttendance, autoCheckIn, customNotes);

  const [modalOpen, setModalOpen] = React.useState(false);
  const [date, setDate] = React.useState("");
  // Remove local notes state since we're using the one from the hook

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const success = await handleRegisterNewAttendance(
      e,
      showDateField ? date : undefined
    );

    if (success && showSuccessModal) {
      setModalOpen(true);
      setHasNewAttendance(false);
    }
  };

  return (
    <>
      <form className="p-4" onSubmit={handleSubmit} autoComplete="off">
        {showDateField && (
          <div className="mb-8">
            <label htmlFor="attendance-date" className="block font-bold mb-1">
              Data
            </label>
            <input
              id="attendance-date"
              type="date"
              className="input w-full"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              lang="pt-BR"
            />
          </div>
        )}
        <label className="block font-bold mb-1">Nome do Paciente</label>
        <Switch
          id="new-patient-switch"
          checked={isNewPatient}
          onChange={setIsNewPatient}
          disabled={isSubmitting}
          label="Novo paciente"
          labelPosition="right"
          size="sm"
          className="mb-2"
        />
        <div className="relative mb-8">
          {isNewPatient ? (
            <>
              <input
                className="input w-full pr-10"
                placeholder="Nome do novo paciente..."
                value={search}
                onChange={handleInputChange}
                required
                disabled={isSubmitting}
              />
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
                disabled={isSubmitting}
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
        <div className="mb-4">
          {isNewPatient ? (
            <>
              <label className="block font-bold mb-1">Prioridade</label>
              <select
                className="input w-full h-10"
                value={priority}
                onChange={(e) => setPriority(e.target.value as IPriority)}
                disabled={isSubmitting}
              >
                <option value="1">1 - Alta</option>
                <option value="2">2 - Média</option>
                <option value="3">3 - Baixa</option>
              </select>
            </>
          ) : null}
        </div>
        <div className="mb-4">
          <label className="block font-bold mb-2 mt-8">
            Tipo de atendimento
          </label>
          <div className="flex flex-col gap-3">
            {attendanceTypes.map((type) => (
              <Switch
                key={type.value}
                id={`attendance-type-${type.value}`}
                checked={selectedTypes.includes(type.value)}
                onChange={(checked) => {
                  const event = {
                    target: {
                      value: type.value,
                      checked: checked,
                    },
                  } as React.ChangeEvent<HTMLInputElement>;
                  handleTypeCheckbox(event);
                }}
                disabled={isSubmitting}
                label={type.label}
                labelPosition="right"
                size="sm"
              />
            ))}
          </div>
        </div>

        {showNotesField && (
          <div className="mb-4">
            <label htmlFor="attendance-notes" className="block font-bold mb-1">
              Observações
            </label>
            <textarea
              id="attendance-notes"
              className="input w-full min-h-[80px] resize-y"
              placeholder="Observações sobre o atendimento (opcional)..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
            {success}
          </div>
        )}

        <div className="w-full">
          <button
            type="submit"
            className="button button-primary mt-6 w-full"
            disabled={
              isSubmitting ||
              (isNewPatient
                ? !search ||
                  selectedTypes.length === 0 ||
                  !priority ||
                  (showDateField && !date)
                : !selectedPatient ||
                  selectedTypes.length === 0 ||
                  !priority ||
                  (showDateField && !date))
            }
          >
            {isSubmitting ? "Processando..." : submitLabel}
          </button>
        </div>
      </form>
      {showSuccessModal && (
        <ConfirmModal
          open={modalOpen}
          message="Check-in realizado com sucesso!"
          confirmLabel="Ok"
          onConfirm={() => setModalOpen(false)}
          cancelLabel=""
        />
      )}
    </>
  );
};

export default NewAttendanceForm;

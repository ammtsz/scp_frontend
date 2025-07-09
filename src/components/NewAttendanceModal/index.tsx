import React, { useState } from "react";
import { usePatients } from "@/contexts/PatientsContext";
import { Search } from "react-feather";

interface NewAttendanceModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (date: string, patient: string) => void;
}

const NewAttendanceModal: React.FC<NewAttendanceModalProps> = ({
  open,
  onClose,
  onSubmit,
}) => {
  const [newAttendanceDate, setNewAttendanceDate] = useState("");
  const [newAttendancePatient, setNewAttendancePatient] = useState("");
  const [patientSearch, setPatientSearch] = useState("");
  const [isFirstAttendance, setIsFirstAttendance] = useState(false);
  const [showPatientList, setShowPatientList] = useState(false);
  const { patients } = usePatients();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-lg shadow-lg p-6 min-w-[320px] border border-[color:var(--border)]">
        <div className="mb-4 text-lg font-bold text-[color:var(--primary-dark)]">
          Novo Agendamento
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(newAttendanceDate, newAttendancePatient);
            setNewAttendanceDate("");
            setNewAttendancePatient("");
            setPatientSearch("");
            setIsFirstAttendance(false);
          }}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium mb-1">Data</label>
            <input
              type="date"
              className="input w-full"
              value={newAttendanceDate}
              onChange={(e) => setNewAttendanceDate(e.target.value)}
              required
              lang="pt-BR"
            />
          </div>
          <div className="flex items-center mb-2 mt-8">
            <input
              id="firstAttendance"
              type="checkbox"
              checked={isFirstAttendance}
              onChange={(e) => {
                setIsFirstAttendance(e.target.checked);
                setPatientSearch("");
                setNewAttendancePatient("");
              }}
              className="mr-2"
            />
            <label
              htmlFor="firstAttendance"
              className="text-sm select-none cursor-pointer"
            >
              Primeiro atendimento
            </label>
          </div>
          <div className="relative">
            <label className="block text-sm font-medium mb-1">Paciente</label>
            {isFirstAttendance ? (
              <input
                type="text"
                className="input w-full"
                placeholder="Nome do paciente"
                value={newAttendancePatient}
                onChange={(e) => setNewAttendancePatient(e.target.value)}
                required
              />
            ) : (
              <>
                <div className="relative">
                  <input
                    type="text"
                    className="input w-full pr-10"
                    placeholder="Buscar paciente..."
                    value={patientSearch}
                    onChange={(e) => {
                      setPatientSearch(e.target.value);
                      setNewAttendancePatient("");
                      setShowPatientList(true);
                    }}
                    autoComplete="off"
                    onFocus={() => setShowPatientList(true)}
                    onBlur={() => {
                      // Delay to allow click event on list
                      setTimeout(() => setShowPatientList(false), 100);
                    }}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                    <Search size={18} />
                  </span>
                </div>
                {showPatientList && patientSearch && (
                  <ul className="absolute bg-white border border-[color:var(--border)] rounded shadow mt-1 w-full z-10 max-h-40 overflow-y-auto">
                    {patients
                      .filter((p) =>
                        p.name
                          .toLowerCase()
                          .includes(patientSearch.toLowerCase())
                      )
                      .map((p) => (
                        <li
                          key={p.id}
                          className={`px-3 py-2 cursor-pointer hover:bg-[color:var(--primary-light)] ${
                            newAttendancePatient === p.name
                              ? "bg-[color:var(--primary-light)]"
                              : ""
                          }`}
                          onMouseDown={() => {
                            setNewAttendancePatient(p.name);
                            setPatientSearch(p.name);
                            setShowPatientList(false);
                          }}
                        >
                          {p.name}
                        </li>
                      ))}
                    {patients.filter((p) =>
                      p.name.toLowerCase().includes(patientSearch.toLowerCase())
                    ).length === 0 && (
                      <li className="px-3 py-2 text-gray-400">
                        Nenhum paciente encontrado
                      </li>
                    )}
                  </ul>
                )}
              </>
            )}
          </div>
          <div className="flex gap-4 justify-end pt-2">
            <button
              type="button"
              className="button button-secondary"
              onClick={() => {
                onClose();
                setPatientSearch("");
                setIsFirstAttendance(false);
              }}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="button button-primary"
              disabled={!newAttendancePatient}
            >
              Agendar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewAttendanceModal;

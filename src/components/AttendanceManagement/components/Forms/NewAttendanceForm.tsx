"use client";

import React, { useState } from "react";
import { Search } from "react-feather";
import { Priority } from "@/types/types";
import { useAttendanceForm as useAttendanceManagement } from "../../hooks/useAttendanceForm";
import { formatDateForInput } from "@/utils/formHelpers";
import Switch from "@/components/common/Switch";
import ErrorDisplay from "@/components/common/ErrorDisplay";

interface NewAttendanceFormProps {
  onRegisterNewAttendance?: (
    name: string,
    selectedTypes: string[],
    isNewPatient: boolean,
    priority: Priority,
    nextAvailableDate?: string
  ) => void;
  showDateField?: boolean;
  validationDate?: string;
  onFormSuccess?: () => void;
}

const attendanceTypes = [
  { value: "spiritual", label: "Consulta Espiritual" },
  { value: "lightBath", label: "Banho de Luz" },
  { value: "rod", label: "Bastão" },
];

const NewAttendanceForm: React.FC<NewAttendanceFormProps> = ({
  onRegisterNewAttendance,
  showDateField = true,
  validationDate,
  onFormSuccess,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    validationDate || formatDateForInput(new Date())
  );
  const [showSuggestions, setShowSuggestions] = useState<boolean>(false);

  const {
    // Form state
    search,
    setSearch,
    setSelectedPatient,
    isNewPatient,
    setIsNewPatient,
    selectedTypes,
    setSelectedTypes,
    priority,
    setPriority,
    notes,
    setNotes,

    // Data
    filteredPatients,

    // Actions
    handleRegisterNewAttendance,
    resetForm,

    // Status
    isSubmitting,
    error,
    success,
  } = useAttendanceManagement({
    onRegisterNewAttendance,
    onFormSuccess,
    autoCheckIn: false, // autoCheckIn = false for scheduling
    defaultNotes: "",
    validationDate,
  });

  const handleTypeCheckbox = (typeValue: string, checked: boolean) => {
    const newTypes = checked
      ? [...selectedTypes, typeValue]
      : selectedTypes.filter((t: string) => t !== typeValue);
    setSelectedTypes(newTypes);
  };

  const handlePatientSelect = (patientName: string) => {
    setSelectedPatient(patientName);
    setSearch(patientName); // Update the search field to show the selected patient
    setShowSuggestions(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setSelectedPatient(""); // Clear selected patient when user types
    setShowSuggestions(true);
  };

  const handleNewPatientToggle = (checked: boolean) => {
    setIsNewPatient(checked);
    setShowSuggestions(false);

    // When new patient toggle is turned on, set spiritual consultation as default
    if (checked && !selectedTypes.includes("spiritual")) {
      setSelectedTypes([...selectedTypes, "spiritual"]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await handleRegisterNewAttendance(e, selectedDate);
    if (success) {
      // Form is automatically reset by the hook
      // Reset local state
      setSelectedDate(validationDate || formatDateForInput(new Date()));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ErrorDisplay error={error} />

      {success && (
        <div className="p-3 bg-green-50 border border-green-200 rounded-md">
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}

      {/* Patient Selection */}
      <div className="space-y-2">
        <label className="block font-bold text-gray-700">
          Nome do Paciente
        </label>
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={handleInputChange}
            className="input w-full pl-10"
            placeholder="Digite o nome do paciente..."
            disabled={isSubmitting}
          />
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        </div>

        {/* Patient suggestions dropdown */}
        {search &&
          !isNewPatient &&
          showSuggestions &&
          filteredPatients.length > 0 && (
            <div className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-40 overflow-y-auto">
              {filteredPatients.slice(0, 5).map((patient) => (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => handlePatientSelect(patient.name)}
                  className="w-full text-left px-3 py-2 hover:bg-gray-100 focus:bg-gray-100"
                  disabled={isSubmitting}
                >
                  <div className="font-medium">{patient.name}</div>
                  <div className="text-xs text-gray-500">
                    Prioridade: {patient.priority}
                  </div>
                </button>
              ))}
            </div>
          )}

        {/* New patient toggle */}
        <div className="flex items-center gap-2">
          <Switch
            id="new-patient"
            checked={isNewPatient}
            onChange={handleNewPatientToggle}
            disabled={isSubmitting}
            label="Novo paciente"
            labelPosition="right"
            size="sm"
          />
        </div>

        {/* Priority Selection - only for new patients */}
        {isNewPatient && (
          <div className="space-y-2">
            <label className="block font-bold text-gray-700">Prioridade</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Priority)}
              className="input w-full"
              disabled={isSubmitting}
            >
              <option value="1">Emergência</option>
              <option value="2">Intermediária</option>
              <option value="3">Normal</option>
            </select>
          </div>
        )}
      </div>

      {/* Date Selection (if enabled) */}
      {showDateField && (
        <div className="space-y-2">
          <label className="block font-bold text-gray-700">
            Data do Agendamento
          </label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="input w-full"
            disabled={isSubmitting}
            min={formatDateForInput(new Date())}
          />
        </div>
      )}

      {/* Attendance Types */}
      <div className="space-y-2">
        <label className="block font-bold text-gray-700">
          Tipos de Atendimento
        </label>
        <div className="flex flex-col gap-2">
          {attendanceTypes.map((type) => (
            <Switch
              key={type.value}
              id={`attendance-type-${type.value}`}
              checked={selectedTypes.includes(type.value)}
              onChange={(checked) => handleTypeCheckbox(type.value, checked)}
              disabled={isSubmitting}
              label={type.label}
              labelPosition="right"
              size="sm"
            />
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <label className="block font-bold text-gray-700">
          Observações (opcional)
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="input w-full"
          rows={3}
          placeholder="Observações sobre o agendamento..."
          disabled={isSubmitting}
        />
      </div>

      {/* Submit Button */}
      <div className="flex gap-3">
        <button
          type="submit"
          className="button button-primary flex-1"
          disabled={
            isSubmitting || !search.trim() || selectedTypes.length === 0
          }
        >
          {isSubmitting ? "Agendando..." : "Agendar Atendimento"}
        </button>

        <button
          type="button"
          onClick={resetForm}
          className="button button-secondary"
          disabled={isSubmitting}
        >
          Limpar
        </button>
      </div>
    </form>
  );
};

export default NewAttendanceForm;

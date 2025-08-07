import { useState } from "react";
import { usePatients } from "@/contexts/PatientsContext";
import { useAttendances } from "@/contexts/AttendancesContext";
import { IPriority } from "@/types/globals";
import { createPatient } from "@/api/patients";
import { createAttendance } from "@/api/attendances";
import { AttendanceType, PatientPriority } from "@/api/types";

export const attendanceTypes = [
  { value: "spiritual", label: "Consulta Espiritual" },
  { value: "lightBath", label: "Banho de Luz/Bastão" },
];

// Map frontend priority to backend enum
const mapPriorityToBackend = (priority: IPriority): PatientPriority => {
  switch (priority) {
    case "1":
      return PatientPriority.EMERGENCY;
    case "2":
      return PatientPriority.INTERMEDIATE;
    case "3":
    default:
      return PatientPriority.NORMAL;
  }
};

// Map frontend attendance type to backend enum
const mapAttendanceTypeToBackend = (type: string): AttendanceType => {
  switch (type) {
    case "spiritual":
      return AttendanceType.SPIRITUAL;
    case "lightBath":
      return AttendanceType.LIGHT_BATH;
    default:
      return AttendanceType.SPIRITUAL;
  }
};

export function useUnscheduledPatients(
  onRegisterNewAttendance?: (
    patientName: string,
    types: string[],
    isNew: boolean,
    priority: IPriority,
    date?: string
  ) => void
) {
  const { patients, refreshPatients } = usePatients();
  const { selectedDate, refreshCurrentDate } = useAttendances();
  
  // Form state
  const [search, setSearch] = useState("");
  const [hasNewAttendance, setHasNewAttendance] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [priority, setPriority] = useState<IPriority>("3");
  const [collapsed, setCollapsed] = useState(true);
  
  // Loading and error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setSearch("");
    setShowDropdown(false);
    setSelectedPatient("");
    setSelectedTypes([]);
    setIsNewPatient(false);
    setHasNewAttendance(false);
    setError(null);
    setSuccess(null);
  };

  const handleRegisterNewAttendance = async (e: React.FormEvent): Promise<boolean> => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const name = isNewPatient ? search.trim() : selectedPatient;
      
      if (!name || selectedTypes.length === 0) {
        setError("Por favor, preencha o nome do paciente e selecione pelo menos um tipo de atendimento.");
        return false;
      }

      let patientId: string;

      if (isNewPatient) {
        // Check if patient already exists
        const existingPatient = patients.find(
          (p) => p.name.toLowerCase() === name.toLowerCase()
        );
        
        if (existingPatient) {
          setError("Paciente já cadastrado. Desmarque 'Novo paciente' para selecioná-lo.");
          return false;
        }

        // Create new patient
        const createPatientResult = await createPatient({
          name: name,
          priority: mapPriorityToBackend(priority),
          main_complaint: "Check-in sem agendamento prévio",
        });

        if (!createPatientResult.success || !createPatientResult.value) {
          setError(createPatientResult.error || "Erro ao criar paciente");
          return false;
        }

        patientId = String(createPatientResult.value.id);
        
        // Refresh patients list to include the new patient
        await refreshPatients();
      } else {
        // Find existing patient
        const selectedPatientData = patients.find((p) => p.name === name);
        if (!selectedPatientData) {
          setError("Paciente selecionado não encontrado.");
          return false;
        }
        patientId = String(selectedPatientData.id);
      }

      // Create attendances for each selected type
      const attendancePromises = selectedTypes.map(async (type) => {
        // Calculate time slots - stagger by 30 minutes for multiple types
        const baseTime = new Date();
        baseTime.setHours(baseTime.getHours() + 1); // Schedule 1 hour from now
        baseTime.setMinutes(0, 0, 0); // Round to the hour
        
        const typeIndex = selectedTypes.indexOf(type);
        const scheduledTime = new Date(baseTime);
        scheduledTime.setMinutes(baseTime.getMinutes() + (typeIndex * 30));

        return createAttendance({
          patient_id: Number(patientId),
          type: mapAttendanceTypeToBackend(type),
          scheduled_date: selectedDate || new Date().toISOString().split('T')[0],
          scheduled_time: scheduledTime.toTimeString().slice(0, 5), // HH:mm format
          notes: `Check-in sem agendamento - ${isNewPatient ? 'Novo paciente' : 'Paciente existente'}`,
        });
      });

      const results = await Promise.all(attendancePromises);
      
      // Check if all attendances were created successfully
      const failedCreations = results.filter(result => !result.success);
      if (failedCreations.length > 0) {
        setError(`Erro ao criar ${failedCreations.length} atendimento(s). Algumas podem ter sido criadas com sucesso.`);
      } else {
        setSuccess(`Check-in realizado com sucesso! ${selectedTypes.length} atendimento(s) criado(s).`);
      }

      // Refresh attendances to show the new records
      await refreshCurrentDate();

      // Call parent callback if provided
      if (onRegisterNewAttendance) {
        onRegisterNewAttendance(name, selectedTypes, isNewPatient, priority);
      }

      // Reset form
      resetForm();
      setCollapsed(true);
      
      return true;
    } catch (error) {
      console.error("Error in handleRegisterNewAttendance:", error);
      setError("Erro inesperado ao processar check-in. Tente novamente.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setSelectedPatient("");
    setShowDropdown(true);
    setHasNewAttendance(false);
    setError(null);
    setSuccess(null);
  };

  const handleSelect = (name: string) => {
    const selected = filteredPatients.find((p) => p.name === name);
    setSelectedPatient(name);
    setSearch(name);
    setShowDropdown(false);
    setHasNewAttendance(false);
    setError(null);
    setSuccess(null);
    
    if (selected) {
      setPriority(selected.priority);
    }
  };

  const handleTypeCheckbox = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setSelectedTypes((prev) =>
      checked ? [...prev, value] : prev.filter((t) => t !== value)
    );
    setError(null);
    setSuccess(null);
  };

  return {
    // Form state
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
    
    // Data
    filteredPatients,
    
    // Actions
    handleRegisterNewAttendance,
    handleInputChange,
    handleSelect,
    handleTypeCheckbox,
    resetForm,
    
    // Status
    isSubmitting,
    error,
    success,
  };
}

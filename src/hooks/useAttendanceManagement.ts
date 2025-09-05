import { useState } from "react";
import { IPriority, IAttendanceType } from "@/types/globals";
import { usePatients } from "@/contexts/PatientsContext";
import { useAttendances } from "@/contexts/AttendancesContext";
import { 
  createAttendance, 
  checkInAttendance,
  deleteAttendance
} from "@/api/attendances";
import { createPatient } from "@/api/patients";
import { 
  transformPriorityToApi,
  transformAttendanceTypeToApi 
} from "@/utils/apiTransformers";
import { getNextAvailableDate } from "@/utils/dateHelpers";
import { SCHEDULED_TIME } from "@/utils/constants";
import { isPatientAlreadyScheduled } from "@/utils/businessRules";

// Map frontend priority to backend enum
const mapPriorityToBackend = transformPriorityToApi;

// Map frontend attendance type to backend enum
const mapAttendanceTypeToBackend = transformAttendanceTypeToApi;

export function useAttendanceManagement(
  onRegisterNewAttendance?: (
    patientName: string,
    types: string[],
    isNew: boolean,
    priority: IPriority,
    date?: string
  ) => void,
  autoCheckIn: boolean = true,
  defaultNotes: string = "",
  validationDate?: string // Optional date for validation (defaults to today)
) {
  const { patients, refreshPatients } = usePatients();
  const { refreshCurrentDate, attendancesByDate } = useAttendances();
  
  // Form state
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [priority, setPriority] = useState<IPriority>("3");
  const [notes, setNotes] = useState<string>(defaultNotes);
  
  // Loading and error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // Check if a patient is already scheduled for the specific attendance types being selected
  const resetForm = () => {
    setSearch("");
    setSelectedPatient("");
    setSelectedTypes([]);
    setIsNewPatient(false);
    setNotes(defaultNotes);
    setError(null);
    setSuccess(null);
  };

  const handleRegisterNewAttendance = async (e: React.FormEvent, selectedDate?: string): Promise<boolean> => {
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

      // Check if patient is already scheduled for the specific selected types
      if (isPatientAlreadyScheduled(name, selectedTypes, attendancesByDate)) {
        const dateText = validationDate && validationDate !== new Date().toISOString().split('T')[0] 
          ? `para ${new Date(validationDate + 'T00:00:00').toLocaleDateString('pt-BR')}`
          : 'para hoje';
        setError(`O paciente "${name}" já possui atendimento agendado ${dateText} nos tipos selecionados. Verifique a lista de atendimentos.`);
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

      // Get the next available date once for all attendances, or use the selected date
      const nextAvailableDate = selectedDate || await getNextAvailableDate();

      // Create attendances for each selected type
      const attendancePromises = selectedTypes.map(async (type) => {
        // Determine the notes to use
        const attendanceNotes = notes.trim() || 
          (autoCheckIn ? `Check-in sem agendamento - ${isNewPatient ? 'Novo paciente' : 'Paciente existente'}` : '');
        
        // First create the attendance
        const createResult = await createAttendance({
          patient_id: Number(patientId),
          type: mapAttendanceTypeToBackend(type as IAttendanceType),
          scheduled_date: nextAvailableDate,
          scheduled_time: SCHEDULED_TIME,
          notes: attendanceNotes,
        });

        if (!createResult.success || !createResult.value) {
          return createResult;
        }

        // For unscheduled patients (walk-ins), immediately check them in
        // This will move them from "scheduled" to "checked-in" column
        if (autoCheckIn) {
          try {
            const checkInResult = await checkInAttendance(createResult.value.id.toString());
            
            if (!checkInResult.success) {
              console.warn(`Failed to check in attendance ${createResult.value.id}:`, checkInResult.error);
              // Return the original creation result even if check-in fails
              // The attendance will remain in "scheduled" status
            }
          } catch (error) {
            console.warn(`Error during check-in for attendance ${createResult.value.id}:`, error);
            // Continue with the original creation result
          }
        }

        return createResult;
      });

      const results = await Promise.all(attendancePromises);
      
      // Check if all attendances were created successfully
      const failedCreations = results.filter(result => !result.success);
      if (failedCreations.length > 0) {
        // Check for specific error types
        const hasConflictError = failedCreations.some(result => 
          result.error?.includes('409') || result.error?.includes('Conflict') || result.error?.includes('slot')
        );
        
        if (hasConflictError) {
          setError(`Conflito de horário detectado. Tente agendar para outro horário ou data.`);
        } else {
          setError(`Erro ao criar ${failedCreations.length} atendimento(s). Algumas podem ter sido criadas com sucesso.`);
        }
        
        // Refresh attendances to show any successful records
        await refreshCurrentDate();
        
        return false; // Return false when there are failures
      } else {
        const isToday = nextAvailableDate === new Date().toISOString().split('T')[0];
        const dateMessage = isToday ? 'hoje' : `para ${nextAvailableDate}`;
        const statusMessage = autoCheckIn ? 'Check-in realizado' : 'Agendamento criado';
        
        setSuccess(`${statusMessage} com sucesso! ${selectedTypes.length} atendimento(s) agendado(s) ${dateMessage} às ${SCHEDULED_TIME}.`);
        
        // Refresh attendances to show the new records
        await refreshCurrentDate();

        // Call parent callback if provided
        if (onRegisterNewAttendance) {
          onRegisterNewAttendance(name, selectedTypes, isNewPatient, priority, selectedDate);
        }

        // Reset form only on complete success
        resetForm();
        
        return true;
      }
    } catch (error) {
      console.error("Error in handleRegisterNewAttendance:", error);
      setError("Erro inesperado ao processar check-in. Tente novamente.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAttendance = async (attendanceId: number, patientName: string): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await deleteAttendance(String(attendanceId));
      
      if (result.success) {
        setSuccess(`Atendimento de "${patientName}" removido com sucesso.`);
        
        // Refresh attendances to update the current view
        await refreshCurrentDate();
        
        return true;
      } else {
        setError(result.error || "Erro ao remover atendimento.");
        return false;
      }
    } catch (error) {
      console.error("Error in handleDeleteAttendance:", error);
      setError("Erro inesperado ao remover atendimento. Tente novamente.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setSelectedPatient("");
    setError(null);
    setSuccess(null);
  };

  const handleSelect = (name: string) => {
    const selected = filteredPatients.find((p) => p.name === name);
    setSelectedPatient(name);
    setSearch(name);
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
    selectedPatient,
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
    handleDeleteAttendance,
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

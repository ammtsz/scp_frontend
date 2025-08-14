import { useState } from "react";
import { IPriority } from "@/types/globals";
import { usePatients } from "@/contexts/PatientsContext";
import { useAttendances } from "@/contexts/AttendancesContext";
import { IAttendanceStatus, IAttendanceStatusDetail } from "@/types/globals";
import { 
  createAttendance, 
  getNextAttendanceDate,
  checkInAttendance,
  deleteAttendance
} from "@/api/attendances";
import { createPatient } from "@/api/patients";
import { PatientPriority, AttendanceType } from "@/api/types";

const SCHEDULED_TIME = "21:00";

// Get the next available date based on schedule settings
const getNextAvailableDate = async (): Promise<string> => {
  try {
    const result = await getNextAttendanceDate();
    if (result.success && result.value?.next_date) {
      return result.value.next_date;
    }
  } catch (error) {
    console.warn('Error fetching next available date, falling back to next Tuesday:', error);
  }
  
  // Fallback to next Tuesday if API call fails
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const daysUntilTuesday = (2 - dayOfWeek + 7) % 7; // 2 = Tuesday
  const nextTuesday = new Date(today);
  
  // If today is Tuesday, schedule for today, otherwise next Tuesday
  if (dayOfWeek === 2) {
    nextTuesday.setDate(today.getDate());
  } else {
    nextTuesday.setDate(today.getDate() + (daysUntilTuesday || 7));
  }
  
  return nextTuesday.toISOString().split('T')[0];
};

export const attendanceTypes = [
  { value: "spiritual", label: "Consulta Espiritual" },
  { value: "lightBath", label: "Banho de Luz" },
  { value: "rod", label: "Bastão" },
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
    case "rod":
      return AttendanceType.ROD;
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
  ) => void,
  autoCheckIn: boolean = true,
  defaultNotes: string = "",
  validationDate?: string // Optional date for validation (defaults to today)
) {
  const { patients, refreshPatients } = usePatients();
  const { refreshCurrentDate, attendancesByDate } = useAttendances();
  
  // Form state
  const [search, setSearch] = useState("");
  const [hasNewAttendance, setHasNewAttendance] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [priority, setPriority] = useState<IPriority>("3");
  const [collapsed, setCollapsed] = useState(true);
  const [notes, setNotes] = useState<string>(defaultNotes);
  
  // Loading and error states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // Check if a patient is already scheduled for the specific attendance types being selected
  const isPatientAlreadyScheduled = (patientName: string, selectedAttendanceTypes: string[]): boolean => {
    // Check against the current attendancesByDate
    // This works for both today's validation and when the context has loaded data for the target date
    if (!attendancesByDate) return false;

    // Check only the selected attendance types
    const allStatuses = ['scheduled', 'checkedIn', 'onGoing', 'completed'] as const;

    for (const type of selectedAttendanceTypes) {
      const typeAttendances = attendancesByDate[type as keyof typeof attendancesByDate];
      if (typeAttendances && typeof typeAttendances === 'object' && 'scheduled' in typeAttendances) {
        for (const status of allStatuses) {
          const statusAttendances = (typeAttendances as IAttendanceStatus)[status];
          if (statusAttendances && statusAttendances.some((attendance: IAttendanceStatusDetail) => 
            attendance.name.toLowerCase() === patientName.toLowerCase()
          )) {
            return true;
          }
        }
      }
    }

    return false;
  };

  // Get attendance details for a specific patient and type
  const getPatientAttendanceDetails = (patientName: string, attendanceType?: string) => {
    if (!attendancesByDate) return [];

    const allStatuses = ['scheduled', 'checkedIn', 'onGoing', 'completed'] as const;
    const attendanceTypes = attendanceType ? [attendanceType] : ['spiritual', 'lightBath'] as const;
    const attendanceDetails: Array<{
      attendanceId: number;
      patientId: number;
      type: string;
      status: string;
      name: string;
    }> = [];

    for (const type of attendanceTypes) {
      const typeAttendances = attendancesByDate[type as keyof typeof attendancesByDate];
      if (typeAttendances && typeof typeAttendances === 'object' && 'scheduled' in typeAttendances) {
        for (const status of allStatuses) {
          const statusAttendances = (typeAttendances as IAttendanceStatus)[status];
          if (statusAttendances && Array.isArray(statusAttendances)) {
            const matchingAttendances = statusAttendances.filter((attendance) => 
              attendance.name.toLowerCase() === patientName.toLowerCase() && 
              attendance.attendanceId && 
              attendance.patientId
            );
            
            matchingAttendances.forEach((attendance) => {
              attendanceDetails.push({
                attendanceId: attendance.attendanceId!,
                patientId: attendance.patientId!,
                type: type,
                status: status,
                name: attendance.name,
              });
            });
          }
        }
      }
    }

    return attendanceDetails;
  };

  const resetForm = () => {
    setSearch("");
    setShowDropdown(false);
    setSelectedPatient("");
    setSelectedTypes([]);
    setIsNewPatient(false);
    setHasNewAttendance(false);
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
      if (isPatientAlreadyScheduled(name, selectedTypes)) {
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
          type: mapAttendanceTypeToBackend(type),
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
        setCollapsed(true);
        
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
    notes,
    setNotes,
    
    // Data
    filteredPatients,
    
    // Actions
    handleRegisterNewAttendance,
    handleDeleteAttendance,
    getPatientAttendanceDetails,
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

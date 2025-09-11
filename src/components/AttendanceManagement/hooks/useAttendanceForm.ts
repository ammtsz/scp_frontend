/**
 * useAttendanceForm - Form management hook for attendance creation
 * 
 * This hook handles form state and validation for creating new attendances.
 * Uses the service layer for business logic and API calls.
 */

import { useState, useCallback } from "react";
import { IPriority, IAttendanceType, IPatients } from "@/types/globals";
import { useAttendances } from "@/contexts/AttendancesContext";
import { usePatients } from "@/contexts/PatientsContext";
import { AttendanceService, PatientService } from "../services";
import { isPatientAlreadyScheduled } from "@/utils/businessRules";
import { getNextAvailableDate } from "@/utils/dateHelpers";
import { SCHEDULED_TIME } from "@/utils/constants";

export interface UseAttendanceFormProps {
  onRegisterNewAttendance?: (
    patientName: string,
    types: string[],
    isNew: boolean,
    priority: IPriority,
    date?: string
  ) => void;
  autoCheckIn?: boolean;
  defaultNotes?: string;
  validationDate?: string;
  onFormSuccess?: () => void; // New prop for handling success internally
}

export interface UseAttendanceFormReturn {
  // Form state
  search: string;
  setSearch: (value: string) => void;
  selectedPatient: string;
  setSelectedPatient: (value: string) => void;
  isNewPatient: boolean;
  setIsNewPatient: (value: boolean) => void;
  selectedTypes: string[];
  setSelectedTypes: (value: string[]) => void;
  priority: IPriority;
  setPriority: (value: IPriority) => void;
  notes: string;
  setNotes: (value: string) => void;
  
  // State management
  isSubmitting: boolean;
  error: string | null;
  success: string | null;
  
  // Data
  filteredPatients: IPatients[];
  
  // Actions
  resetForm: () => void;
  handleRegisterNewAttendance: (
    e: React.FormEvent, 
    selectedDate?: string
  ) => Promise<boolean>;
}

export const useAttendanceForm = ({
  onRegisterNewAttendance,
  autoCheckIn = true,
  defaultNotes = "",
  validationDate,
  onFormSuccess
}: UseAttendanceFormProps = {}): UseAttendanceFormReturn => {
  
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

  // Filtered patients for search
  const filteredPatients = patients.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  /**
   * Reset all form fields to default state
   */
  const resetForm = useCallback(() => {
    setSearch("");
    setSelectedPatient("");
    setSelectedTypes([]);
    setIsNewPatient(false);
    setNotes(defaultNotes);
    setError(null);
    setSuccess(null);
  }, [defaultNotes]);

  /**
   * Handle form submission for new attendance registration
   */
  const handleRegisterNewAttendance = useCallback(async (
    e: React.FormEvent, 
    selectedDate?: string
  ): Promise<boolean> => {
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
      // Only validate for the current date to avoid false positives when scheduling for future dates
      const targetDate = selectedDate || new Date().toISOString().split('T')[0];
      const currentContextDate = new Date().toISOString().split('T')[0]; // Today's date that context has loaded
      
      // Only perform validation if we're scheduling for today (the date currently loaded in context)
      if (targetDate === currentContextDate && isPatientAlreadyScheduled(name, selectedTypes, attendancesByDate)) {
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

        // Create new patient using service
        const patientResult = await PatientService.createPatient({
          name,
          priority,
          birthDate: new Date(), // This should come from a form field in real implementation
          mainComplaint: notes
        });

        if (!patientResult.success) {
          setError(`Erro ao cadastrar paciente: ${patientResult.error}`);
          return false;
        }

        patientId = patientResult.data!.id.toString();
        
        // Refresh patients list to include the new patient
        await refreshPatients();
      } else {
        const patient = patients.find((p) => p.name === selectedPatient);
        if (!patient) {
          setError("Paciente selecionado não encontrado.");
          return false;
        }
        patientId = patient.id;
      }

      // Get the next available date
      const nextAvailableDate = selectedDate || await getNextAvailableDate();

      // Create attendances for each selected type
      const attendancePromises = selectedTypes.map(async (type) => {
        const createResult = await AttendanceService.createAttendance({
          patientId: parseInt(patientId),
          attendanceType: type as IAttendanceType,
          scheduledDate: nextAvailableDate
        });

        // If creation succeeded and autoCheckIn is enabled, check in the patient
        if (createResult.success && autoCheckIn) {
          try {
            await AttendanceService.checkInAttendance({
              attendanceId: createResult.data!.id,
              patientName: name
            });
          } catch (error) {
            console.warn(`Error during check-in for attendance ${createResult.data!.id}:`, error);
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
        
        return false;
      } else {
        const isToday = nextAvailableDate === new Date().toISOString().split('T')[0];
        const dateMessage = isToday ? 'hoje' : `para ${nextAvailableDate}`;
        const statusMessage = autoCheckIn ? 'Check-in realizado' : 'Agendamento criado';
        
        setSuccess(`${statusMessage} com sucesso! ${selectedTypes.length} atendimento(s) agendado(s) ${dateMessage} às ${SCHEDULED_TIME}.`);
        
        // Refresh attendances to show the new records
        await refreshCurrentDate();

        // Call external callback if provided
        if (onRegisterNewAttendance) {
          onRegisterNewAttendance(name, selectedTypes, isNewPatient, priority, nextAvailableDate);
        }

        // Reset form after successful submission
        resetForm();
        
        // Call success callback (e.g., to close modal)
        if (onFormSuccess) {
          onFormSuccess();
        }
        
        return true;
      }
    } catch (error) {
      console.error("Error in handleRegisterNewAttendance:", error);
      setError("Erro inesperado ao processar a solicitação. Tente novamente.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isNewPatient,
    search,
    selectedPatient,
    selectedTypes,
    priority,
    notes,
    patients,
    attendancesByDate,
    validationDate,
    autoCheckIn,
    refreshPatients,
    refreshCurrentDate,
    onRegisterNewAttendance,
    onFormSuccess,
    resetForm
  ]);

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
    
    // State management
    isSubmitting,
    error,
    success,
    
    // Data
    filteredPatients,
    
    // Actions
    resetForm,
    handleRegisterNewAttendance
  };
};

export default useAttendanceForm;

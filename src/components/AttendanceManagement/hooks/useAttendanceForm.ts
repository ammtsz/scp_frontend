/**
 * useAttendanceForm - Form management hook for attendance creation
 * 
 * This hook handles form state and validation for creating new attendances.
 * Uses the service layer for business logic and API calls.
 */

import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Priority, PatientBasic } from "@/types/types";
import { AttendanceType } from "@/api/types";
import { useAttendanceManagement } from "@/hooks/useAttendanceManagement";
import { usePatients, useCreatePatient } from "@/hooks/usePatientQueries";
import { 
  useCreateAttendance, 
  useCheckInAttendance 
} from "@/hooks/useAttendanceQueries";
import { isPatientAlreadyScheduled } from "@/utils/businessRules";
import { getNextAvailableDate } from "@/utils/dateHelpers";
import { transformPriorityToApi } from "@/utils/apiTransformers";
import { SCHEDULED_TIME } from "@/utils/constants";

export interface UseAttendanceFormProps {
  onRegisterNewAttendance?: (
    patientName: string,
    types: string[],
    isNew: boolean,
    priority: Priority,
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
  priority: Priority;
  setPriority: (value: Priority) => void;
  notes: string;
  setNotes: (value: string) => void;
  
  // State management
  isSubmitting: boolean;
  error: string | null;
  success: string | null;
  
  // Data
  filteredPatients: PatientBasic[];
  
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
  
  const queryClient = useQueryClient();
  const { data: patients = [] } = usePatients();
  const { refreshCurrentDate, attendancesByDate } = useAttendanceManagement();
  
  // React Query mutations for better cache management
  const createAttendanceMutation = useCreateAttendance();
  const checkInAttendanceMutation = useCheckInAttendance();
  const createPatientMutation = useCreatePatient();
  
  // Form state
  const [search, setSearch] = useState("");
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  const [isNewPatient, setIsNewPatient] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [priority, setPriority] = useState<Priority>("3");
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

        // Create new patient using React Query mutation
        const newPatient = await createPatientMutation.mutateAsync({
          name,
          priority: transformPriorityToApi(priority),
          birth_date: new Date().toISOString().split('T')[0], // YYYY-MM-DD format
          main_complaint: notes
        });

        if (!newPatient) {
          throw new Error('Erro ao criar paciente: dados não retornados');
        }
        patientId = newPatient.id.toString();
        
        // React Query automatically invalidates patient lists, no manual refresh needed
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
        try {
          const createResult = await createAttendanceMutation.mutateAsync({
            patientId: parseInt(patientId),
            attendanceType: type as AttendanceType,
            scheduledDate: nextAvailableDate
          });

          // If creation succeeded and autoCheckIn is enabled, check in the patient
          if (createResult && autoCheckIn) {
            try {
              await checkInAttendanceMutation.mutateAsync({
                attendanceId: createResult.id,
                patientName: name
              });
            } catch (error) {
              console.warn(`Error during check-in for attendance ${createResult.id}:`, error);
              // Continue with the original creation result
            }
          }

          return { success: true, data: createResult };
        } catch (error) {
          console.error("Error creating attendance:", error);
          return { success: false, error: error instanceof Error ? error.message : String(error) };
        }
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
        
        // Also invalidate agenda queries in case some attendances were created
        queryClient.invalidateQueries({ 
          queryKey: ['agenda'] 
        });
        
        return false;
      } else {
        const isToday = nextAvailableDate === new Date().toISOString().split('T')[0];
        const dateMessage = isToday ? 'hoje' : `para ${nextAvailableDate}`;
        const statusMessage = autoCheckIn ? 'Check-in realizado' : 'Agendamento criado';
        
        setSuccess(`${statusMessage} com sucesso! ${selectedTypes.length} atendimento(s) agendado(s) ${dateMessage} às ${SCHEDULED_TIME}.`);
        
        // Refresh attendances to show the new records
        await refreshCurrentDate();
        
        // Also invalidate agenda queries so agenda page refreshes automatically
        queryClient.invalidateQueries({ 
          queryKey: ['agenda'] 
        });

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
    refreshCurrentDate,
    queryClient,
    onRegisterNewAttendance,
    onFormSuccess,
    resetForm,
    createAttendanceMutation,
    checkInAttendanceMutation,
    createPatientMutation
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

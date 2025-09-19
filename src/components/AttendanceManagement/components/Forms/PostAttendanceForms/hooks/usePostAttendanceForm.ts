import { useCallback, useMemo, useState, useEffect } from "react";
import { useFormHandler } from "@/hooks/useFormHandler";
import { getPatientById } from "@/api/patients";
import { createTreatmentSession } from "@/api/treatment-sessions";
import type {
  CreateTreatmentSessionRequest,
  PatientResponseDto,
} from "@/api/types";
import type { TreatmentRecommendation } from "../types";
import type { CreatedTreatmentSession } from "../components/TreatmentSessionConfirmation";
import type { TreatmentSessionError } from "../components/TreatmentSessionErrors";

// Treatment status options as per requirements
export type TreatmentStatus = "N" | "T" | "A" | "F";

export interface SpiritualTreatmentData {
  // Main form fields from requirements
  mainComplaint: string;
  treatmentStatus: TreatmentStatus;
  attendanceDate: string;
  startDate: string;
  returnWeeks: number;

  // Recommendations section (reusing existing structure)
  food: string;
  water: string;
  ointments: string;
  recommendations: TreatmentRecommendation;
  notes: string;
}

interface UseSpiritualTreatmentFormProps {
  attendanceId: number;
  patientId: number;
  currentTreatmentStatus: TreatmentStatus;
  onSubmit: (
    data: SpiritualTreatmentData
  ) => Promise<{ treatmentRecordId: number }>;
  isLoading?: boolean;
  initialData?: Partial<SpiritualTreatmentData>;
  onTreatmentSessionsCreated?: (sessionIds: number[]) => void;
}

export function usePostAttendanceForm({
  attendanceId,
  patientId,
  currentTreatmentStatus,
  onSubmit,
  isLoading: externalLoading = false,
  initialData,
  onTreatmentSessionsCreated,
}: UseSpiritualTreatmentFormProps) {
  // State for patient data fetching
  const [patientData, setPatientData] = useState<PatientResponseDto | null>(null);
  const [fetchingPatient, setFetchingPatient] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  // State for treatment session confirmation
  const [createdSessions, setCreatedSessions] = useState<CreatedTreatmentSession[]>([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  
  // State for treatment session error handling
  const [sessionErrors, setSessionErrors] = useState<TreatmentSessionError[]>([]);
  const [showErrors, setShowErrors] = useState(false);

  // Get current date as string for default values (memoized to prevent dependency changes)
  const today = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Helper function to parse session creation errors into the format expected by TreatmentSessionErrors
  const parseSessionCreationErrors = useCallback((
    error: unknown,
    recommendations: TreatmentRecommendation
  ): TreatmentSessionError[] => {
    const errors: TreatmentSessionError[] = [];
    
    try {
      // Check if the error has structured error details from our collection
      const errorDetails = (error as { errorDetails?: { lightBathErrors: string[], rodErrors: string[], allErrors: string[] } })?.errorDetails;
      
      if (errorDetails) {
        // Use the structured errors we collected
        if (errorDetails.lightBathErrors && errorDetails.lightBathErrors.length > 0) {
          errors.push({
            treatment_type: 'light_bath',
            errors: errorDetails.lightBathErrors
          });
        }
        
        if (errorDetails.rodErrors && errorDetails.rodErrors.length > 0) {
          errors.push({
            treatment_type: 'rod',
            errors: errorDetails.rodErrors
          });
        }
      } else {
        // Fallback to parsing the error message
        const errorMessage = error instanceof Error ? error.message : String(error);
        
        // Check if we have light bath treatments that might have failed
        if (recommendations.lightBath?.treatments && recommendations.lightBath.treatments.length > 0) {
          const lightBathErrors: string[] = [];
          
          // Look for light bath related errors in the message
          if (errorMessage.toLowerCase().includes('banho de luz') || 
              errorMessage.toLowerCase().includes('light_bath')) {
            lightBathErrors.push(errorMessage);
          } else if (errorMessage.includes('422') || errorMessage.includes('Validation failed')) {
            lightBathErrors.push('Erro de validação ao criar sessões de banho de luz. Verifique os dados informados.');
          }
          
          if (lightBathErrors.length > 0) {
            errors.push({
              treatment_type: 'light_bath',
              errors: lightBathErrors
            });
          }
        }
        
        // Check if we have rod treatments that might have failed
        if (recommendations.rod?.treatments && recommendations.rod.treatments.length > 0) {
          const rodErrors: string[] = [];
          
          // Look for rod related errors in the message
          if (errorMessage.toLowerCase().includes('bastão') || 
              errorMessage.toLowerCase().includes('rod')) {
            rodErrors.push(errorMessage);
          } else if (errorMessage.includes('422') || errorMessage.includes('Validation failed')) {
            rodErrors.push('Erro de validação ao criar sessões de tratamento com vara. Verifique os dados informados.');
          }
          
          if (rodErrors.length > 0) {
            errors.push({
              treatment_type: 'rod',
              errors: rodErrors
            });
          }
        }
        
        // If no specific treatment errors were found but we have recommendations, 
        // create a generic error for the first treatment type
        if (errors.length === 0) {
          if (recommendations.lightBath?.treatments && recommendations.lightBath.treatments.length > 0) {
            errors.push({
              treatment_type: 'light_bath',
              errors: [errorMessage || 'Erro inesperado ao criar sessões de banho de luz.']
            });
          } else if (recommendations.rod?.treatments && recommendations.rod.treatments.length > 0) {
            errors.push({
              treatment_type: 'rod',
              errors: [errorMessage || 'Erro inesperado ao criar sessões de tratamento com vara.']
            });
          }
        }
      }
    } catch (parseError) {
      console.error('Error parsing session creation errors:', parseError);
      
      // Fallback: create generic errors for any treatment types that were requested
      if (recommendations.lightBath?.treatments && recommendations.lightBath.treatments.length > 0) {
        errors.push({
          treatment_type: 'light_bath',
          errors: ['Erro inesperado ao criar sessões de banho de luz.']
        });
      }
      if (recommendations.rod?.treatments && recommendations.rod.treatments.length > 0) {
        errors.push({
          treatment_type: 'rod',
          errors: ['Erro inesperado ao criar sessões de tratamento com vara.']
        });
      }
    }
    
    return errors;
  }, []);

  // Helper function to create treatment sessions from recommendations
  const createTreatmentSessionsFromRecommendations = useCallback(
    async (
      recommendations: TreatmentRecommendation,
      treatmentRecordId: number
    ): Promise<{ sessionIds: number[], sessions: CreatedTreatmentSession[] }> => {
      const createdSessionIds: number[] = [];
      const createdSessionsData: CreatedTreatmentSession[] = [];
      const lightBathErrors: string[] = [];
      const rodErrors: string[] = [];

      try {
        // Create Light Bath sessions
        if (
          recommendations.lightBath?.treatments &&
          recommendations.lightBath.treatments.length > 0
        ) {
          for (const treatment of recommendations.lightBath.treatments) {
            // Create a session for each location in the treatment
            for (const location of treatment.locations) {
              try {
                const sessionRequest: CreateTreatmentSessionRequest = {
                  treatment_record_id: treatmentRecordId,
                  attendance_id: attendanceId,
                  patient_id: patientId,
                  treatment_type: "light_bath" as const,
                  body_location: location,
                  start_date: treatment.startDate,
                  planned_sessions: treatment.quantity,
                  duration_minutes: treatment.duration, // Duration is already in 7-minute units
                  color: treatment.color,
                  notes: `Banho de luz - ${treatment.color} - ${
                    treatment.duration * 7
                  } minutos`,
                };

                const sessionResponse = await createTreatmentSession(sessionRequest);
                if (sessionResponse.success && sessionResponse.value) {
                  const sessionData = sessionResponse.value;
                  createdSessionIds.push(sessionData.id);
                  // Transform the response to match our interface
                  const sessionForConfirmation: CreatedTreatmentSession = {
                    id: sessionData.id,
                    treatment_record_id: treatmentRecordId,
                    attendance_id: attendanceId,
                    patient_id: patientId,
                    treatment_type: "light_bath",
                    body_location: location,
                    start_date: treatment.startDate,
                    planned_sessions: treatment.quantity,
                    completed_sessions: 0,
                    status: "scheduled",
                    duration_minutes: treatment.duration,
                    color: treatment.color,
                    notes: `Banho de luz - ${treatment.color} - ${treatment.duration * 7} minutos`,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  };
                  createdSessionsData.push(sessionForConfirmation);

                  // NOTE: Attendances are automatically created by the backend
                  // when treatment sessions are created (see TreatmentSessionService.createSessionRecordsForTreatment)
                } else {
                  lightBathErrors.push(
                    `Erro ao criar sessão de banho de luz para ${location}: ${sessionResponse.error}`
                  );
                }
              } catch (error) {
                lightBathErrors.push(
                  `Erro inesperado ao criar sessão de banho de luz para ${location}: ${error instanceof Error ? error.message : String(error)}`
                );
              }
            }
          }
        }

        // Create Rod sessions
        if (
          recommendations.rod?.treatments &&
          recommendations.rod.treatments.length > 0
        ) {
          for (const treatment of recommendations.rod.treatments) {
            // Create a session for each location in the treatment
            for (const location of treatment.locations) {
              try {
                const sessionRequest: CreateTreatmentSessionRequest = {
                  treatment_record_id: treatmentRecordId,
                  attendance_id: attendanceId,
                  patient_id: patientId,
                  treatment_type: "rod" as const,
                  body_location: location,
                  start_date: treatment.startDate,
                  planned_sessions: treatment.quantity,
                  notes: `Tratamento com bastão`,
                };

                const sessionResponse = await createTreatmentSession(sessionRequest);
                if (sessionResponse.success && sessionResponse.value) {
                  const sessionData = sessionResponse.value;
                  createdSessionIds.push(sessionData.id);
                  // Transform the response to match our interface
                  const sessionForConfirmation: CreatedTreatmentSession = {
                    id: sessionData.id,
                    treatment_record_id: treatmentRecordId,
                    attendance_id: attendanceId,
                    patient_id: patientId,
                    treatment_type: "rod",
                    body_location: location,
                    start_date: treatment.startDate,
                    planned_sessions: treatment.quantity,
                    completed_sessions: 0,
                    status: "scheduled",
                    notes: `Tratamento com bastão`,
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                  };
                  createdSessionsData.push(sessionForConfirmation);

                  // NOTE: Attendances are automatically created by the backend
                  // when treatment sessions are created (see TreatmentSessionService.createSessionRecordsForTreatment)
                } else {
                  rodErrors.push(
                    `Erro ao criar sessão com bastão para ${location}: ${sessionResponse.error}`
                  );
                }
              } catch (error) {
                rodErrors.push(
                  `Erro inesperado ao criar sessão com bastão para ${location}: ${error instanceof Error ? error.message : String(error)}`
                );
              }
            }
          }
        }

        // If there are any errors, throw them with the collected error details
        const allErrors = [...lightBathErrors, ...rodErrors];
        if (allErrors.length > 0) {
          // Create a structured error that includes treatment type information
          const errorDetails = {
            lightBathErrors,
            rodErrors,
            allErrors
          };
          const error = new Error(allErrors.join("\n\n"));
          (error as Error & { errorDetails: typeof errorDetails }).errorDetails = errorDetails;
          throw error;
        }

        return { sessionIds: createdSessionIds, sessions: createdSessionsData };
      } catch (error) {
        // Re-throw the error to be handled by the calling function
        throw error;
      }
    },
    [patientId, attendanceId]
  );

  // Fetch patient data when component mounts
  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        setFetchingPatient(true);
        setFetchError(null);

        const response = await getPatientById(patientId.toString());
        if (response.success && response.value) {
          setPatientData(response.value);
        } else {
          setFetchError(response.error || "Erro ao carregar dados do paciente");
        }
      } catch (error) {
        setFetchError("Erro ao carregar dados do paciente");
        console.error("Error fetching patient data:", error);
      } finally {
        setFetchingPatient(false);
      }
    };

    fetchPatientData();
  }, [patientId]);

  // Validation for spiritual treatment form
  const validateTreatment = useCallback(
    (data: SpiritualTreatmentData): string | null => {
      // Main complaint is required
      if (!data.mainComplaint.trim()) {
        return "Principal queixa é obrigatória";
      }

      // Return weeks validation
      if (data.returnWeeks < 1 || data.returnWeeks > 52) {
        return "Semanas para retorno deve estar entre 1 e 52";
      }

      // Start date validation
      if (data.startDate > today) {
        return "Data de início não pode ser futura";
      }

      // Attendance date validation
      if (data.attendanceDate > today) {
        return "Data da consulta não pode ser futura";
      }

      // If light bath is recommended, validate required fields
      if (data.recommendations.lightBath) {
        const { treatments } = data.recommendations.lightBath;
        if (treatments.length === 0) {
          return "Selecione pelo menos um local para o banho de luz";
        }

        // Validate each treatment
        for (const treatment of treatments) {
          if (!treatment.locations || treatment.locations.length === 0) {
            return "Todos os locais do banho de luz devem ser especificados";
          }
          if (!treatment.color) {
            return "Cor do banho de luz é obrigatória para todos os locais";
          }
          if (treatment.duration < 1 || treatment.duration > 5) {
            return "Duração do banho deve estar entre 1 e 5 unidades (7-35 minutos)";
          }
          if (treatment.quantity < 1 || treatment.quantity > 20) {
            return "Quantidade de banho de luz deve estar entre 1 e 20";
          }
        }
      }

      // If rod is recommended, validate required fields
      if (data.recommendations.rod) {
        const { treatments } = data.recommendations.rod;
        if (treatments.length === 0) {
          return "Selecione pelo menos um local para o tratamento com bastão";
        }

        // Validate each treatment
        for (const treatment of treatments) {
          if (!treatment.locations || treatment.locations.length === 0) {
            return "Todos os locais do tratamento com bastão devem ser especificados";
          }
          if (treatment.quantity < 1 || treatment.quantity > 20) {
            return "Quantidade de tratamentos com bastão deve estar entre 1 e 20";
          }
        }
      }

      return null;
    },
    [today]
  );

  // Custom submit handler that creates treatment sessions
  const handleFormSubmit = useCallback(
    async (data: SpiritualTreatmentData) => {
      try {
        // First, submit the spiritual treatment record (existing flow)
        const result = await onSubmit(data);

        // Then, create treatment sessions for lightbath/rod recommendations
        try {
          const { sessionIds, sessions } = await createTreatmentSessionsFromRecommendations(
            data.recommendations,
            result.treatmentRecordId
          );

          // Store created sessions for confirmation display
          setCreatedSessions(sessions);

          // Notify parent component about created sessions (for backward compatibility)
          if (sessionIds.length > 0 && onTreatmentSessionsCreated) {
            onTreatmentSessionsCreated(sessionIds);
          }

          // Show confirmation view if sessions were created
          if (sessions.length > 0) {
            setShowConfirmation(true);
          }
        } catch (sessionError) {
          // Handle treatment session creation errors specifically
          console.error("Treatment session creation failed:", sessionError);
          
          // Parse the error and convert it to TreatmentSessionError format
          const parsedErrors = parseSessionCreationErrors(sessionError, data.recommendations);
          
          if (parsedErrors.length > 0) {
            setSessionErrors(parsedErrors);
            setShowErrors(true);
          } else {
            // If we can't parse the error, show it as a general error
            throw sessionError;
          }
        }
      } catch (error) {
        // If spiritual treatment submission fails, don't create sessions
        // The error will be handled by the form handler
        throw error;
      }
    },
    [onSubmit, createTreatmentSessionsFromRecommendations, onTreatmentSessionsCreated, setCreatedSessions, setShowConfirmation, parseSessionCreationErrors, setSessionErrors, setShowErrors]
  );

  const {
    formData,
    setFormData,
    handleChange,
    handleSubmit,
    isLoading: formLoading,
    error,
    clearError,
  } = useFormHandler<SpiritualTreatmentData>({
    initialState: {
      mainComplaint: initialData?.mainComplaint || "",
      treatmentStatus: initialData?.treatmentStatus || "T", // Default to "T - Em tratamento"
      attendanceDate: typeof initialData?.attendanceDate === 'string' ? initialData.attendanceDate : today,
      startDate: typeof initialData?.startDate === 'string' ? initialData.startDate : today,
      returnWeeks: initialData?.returnWeeks || 1, // Default to 1 week
      food: initialData?.food || "",
      water: initialData?.water || "",
      ointments: initialData?.ointments || "",
      recommendations: {
        returnWeeks: initialData?.recommendations?.returnWeeks || 1,
        spiritualMedicalDischarge:
          initialData?.recommendations?.spiritualMedicalDischarge || false,
        ...initialData?.recommendations,
      },
      notes: initialData?.notes || "",
    },
    onSubmit: handleFormSubmit,
    validate: validateTreatment,
    formatters: {
      returnWeeks: (value: unknown) =>
        Math.max(1, Math.min(52, parseInt(String(value)) || 1)),
    },
  });

  const isLoading = externalLoading || formLoading || fetchingPatient;

  // Update form data when patient data is loaded
  useEffect(() => {
    if (patientData && !fetchingPatient) {
      setFormData((prev) => ({
        ...prev,
        // 1. Queixa Principal - recovery notes from the attendance (using patient's main_complaint for now)
        mainComplaint: patientData.main_complaint || prev.mainComplaint,
        // 4. Data de Início - if patient is new, set for current date, otherwise set for patient start date and disable
        startDate: patientData.start_date
          ? patientData.start_date // Already in YYYY-MM-DD format
          : currentTreatmentStatus === "N"
          ? today
          : prev.startDate,
      }));
    }
  }, [patientData, fetchingPatient, setFormData, currentTreatmentStatus, today]);

  const handleRecommendationsChange = useCallback(
    (recommendations: TreatmentRecommendation) => {
      setFormData((prev) => ({
        ...prev,
        recommendations,
        returnWeeks: recommendations.returnWeeks, // Sync return weeks
      }));
      if (error) clearError();
    },
    [setFormData, error, clearError]
  );

  const handleDateChange = useCallback(
    (field: "attendanceDate" | "startDate") =>
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value || today;
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (error) clearError();
      },
    [setFormData, error, clearError, today]
  );

  // Format date for input field (already in YYYY-MM-DD format)
  const formatDateForInput = (date: string) => {
    return date;
  };

  // Get treatment status label
  const getTreatmentStatusLabel = (status: TreatmentStatus) => {
    const labels: Record<TreatmentStatus, string> = {
      N: "Novo paciente",
      T: "Em tratamento",
      A: "Alta médica espiritual",
      F: "Faltas consecutivas",
    };
    return labels[status];
  };

  // Function to reset confirmation state
  const resetConfirmation = useCallback(() => {
    setShowConfirmation(false);
    setCreatedSessions([]);
  }, []);

  // Function to reset error state
  const resetErrors = useCallback(() => {
    setShowErrors(false);
    setSessionErrors([]);
  }, []);

  // Function to retry treatment session creation
  const retrySessionCreation = useCallback(() => {
    resetErrors();
    // Note: This would typically trigger a new submission attempt
    // The actual retry logic would depend on how the form is structured
  }, [resetErrors]);

  return {
    // Form state and handlers
    formData,
    setFormData,
    handleChange,
    handleSubmit,
    handleRecommendationsChange,
    handleDateChange,
    
    // Patient data
    patientData,
    fetchingPatient,
    fetchError,
    setFetchError,
    
    // Loading states
    isLoading,
    
    // Error handling
    error,
    clearError,
    
    // Confirmation states
    showConfirmation,
    createdSessions,
    resetConfirmation,
    
    // Error states
    showErrors,
    sessionErrors,
    resetErrors,
    retrySessionCreation,
    
    // Utility functions
    formatDateForInput,
    getTreatmentStatusLabel,
    
    // Current treatment status
    currentTreatmentStatus,
  };
}

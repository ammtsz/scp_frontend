import { useCallback, useMemo, useState, useEffect } from "react";
import { useFormHandler } from "@/hooks/useFormHandler";
import { getPatientById } from "@/api/patients";
import { createTreatmentSession } from "@/api/treatment-sessions";
import type {
  CreateTreatmentSessionRequest,
  PatientResponseDto,
} from "@/api/types";
import type { TreatmentRecommendation } from "../types";

// Treatment status options as per requirements
export type TreatmentStatus = "N" | "T" | "A" | "F";

export interface SpiritualTreatmentData {
  // Main form fields from requirements
  mainComplaint: string;
  treatmentStatus: TreatmentStatus;
  attendanceDate: Date;
  startDate: Date;
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

  // Get current date for default values (memoized to prevent dependency changes)
  const today = useMemo(() => new Date(), []);

  // Helper function to create treatment sessions from recommendations
  const createTreatmentSessionsFromRecommendations = useCallback(
    async (
      recommendations: TreatmentRecommendation,
      treatmentRecordId: number
    ): Promise<number[]> => {
      const createdSessionIds: number[] = [];
      const allErrors: string[] = [];

      try {
        // Create Light Bath sessions
        if (
          recommendations.lightBath?.treatments &&
          recommendations.lightBath.treatments.length > 0
        ) {
          for (const treatment of recommendations.lightBath.treatments) {
            // Create a session for each location in the treatment
            for (const location of treatment.locations) {
              const sessionRequest: CreateTreatmentSessionRequest = {
                treatment_record_id: treatmentRecordId,
                attendance_id: attendanceId,
                patient_id: patientId,
                treatment_type: "light_bath" as const,
                body_location: location,
                start_date: treatment.startDate.toISOString().split("T")[0],
                planned_sessions: treatment.quantity,
                duration_minutes: treatment.duration, // Duration is already in 7-minute units
                color: treatment.color,
                notes: `Banho de luz - ${treatment.color} - ${
                  treatment.duration * 7
                } minutos`,
              };

              const sessionResponse = await createTreatmentSession(sessionRequest);
              if (sessionResponse.success && sessionResponse.value) {
                const sessionId = sessionResponse.value.id;
                createdSessionIds.push(sessionId);

                // NOTE: Attendances are now automatically created by the backend
                // when treatment sessions are created (see TreatmentRecordService)
                console.log(`✅ Treatment session created: ${sessionId} - Attendances will be automatically scheduled`);
              } else {
                allErrors.push(
                  `Erro ao criar sessão de banho de luz para ${location}: ${sessionResponse.error}`
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
              const sessionRequest: CreateTreatmentSessionRequest = {
                treatment_record_id: treatmentRecordId,
                attendance_id: attendanceId,
                patient_id: patientId,
                treatment_type: "rod" as const,
                body_location: location,
                start_date: treatment.startDate.toISOString().split("T")[0],
                planned_sessions: treatment.quantity,
                notes: `Tratamento com bastão`,
              };

              const sessionResponse = await createTreatmentSession(sessionRequest);
              if (sessionResponse.success && sessionResponse.value) {
                const sessionId = sessionResponse.value.id;
                createdSessionIds.push(sessionId);

                // NOTE: Attendances are now automatically created by the backend
                // when treatment sessions are created (see TreatmentRecordService)
                console.log(`✅ Treatment session created: ${sessionId} - Attendances will be automatically scheduled`);
              } else {
                allErrors.push(
                  `Erro ao criar sessão com bastão para ${location}: ${sessionResponse.error}`
                );
              }
            }
          }
        }

        // If there are any errors, throw them to be displayed to the user
        if (allErrors.length > 0) {
          throw new Error(allErrors.join("\n\n"));
        }

        return createdSessionIds;
      } catch (error) {
        // If it's our custom error with collected messages, re-throw it
        if (error instanceof Error && allErrors.length > 0) {
          throw error;
        }

        // For unexpected errors, wrap them
        throw new Error(
          `Erro inesperado ao criar sessões de tratamento: ${error}`
        );
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
        const sessionIds = await createTreatmentSessionsFromRecommendations(
          data.recommendations,
          result.treatmentRecordId
        );

        // Notify parent component about created sessions
        if (sessionIds.length > 0 && onTreatmentSessionsCreated) {
          onTreatmentSessionsCreated(sessionIds);
        }
      } catch (error) {
        // If spiritual treatment submission fails, don't create sessions
        // The error will be handled by the form handler
        throw error;
      }
    },
    [onSubmit, createTreatmentSessionsFromRecommendations, onTreatmentSessionsCreated]
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
      attendanceDate: initialData?.attendanceDate || today,
      startDate: initialData?.startDate || today,
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
          ? new Date(patientData.start_date)
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
        const value = e.target.value ? new Date(e.target.value) : new Date();
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (error) clearError();
      },
    [setFormData, error, clearError]
  );

  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split("T")[0];
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
    
    // Utility functions
    formatDateForInput,
    getTreatmentStatusLabel,
    
    // Current treatment status
    currentTreatmentStatus,
  };
}

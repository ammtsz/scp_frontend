import { useState, useEffect } from "react";
import { useUpdatePatient } from "@/hooks/usePatientQueries";
import { transformPriorityToApi, transformStatusToApi } from "@/utils/apiTransformers";
import { formatPhoneNumber } from "@/utils/formHelpers";
import type { UpdatePatientRequest, PatientResponseDto } from "@/api/types";

export interface EditPatientFormData {
  name: string;
  phone: string;
  birthDate: Date | null;
  priority: string;
  status: string;
  mainComplaint: string;
  startDate: Date | null;
  dischargeDate: Date | null;
  nextAttendanceDates: { date: Date; type: string }[];
  currentRecommendations: {
    food: string;
    water: string;
    ointment: string;
    returnWeeks: number;
    lightBath: boolean;
    rod: boolean;
    spiritualTreatment: boolean;
  };
}

interface UseEditPatientFormProps {
  patientId: string;
  initialData: EditPatientFormData;
  onClose: () => void;
  onSuccess?: (updatedPatient: PatientResponseDto) => void;
}

export const useEditPatientForm = ({ 
  patientId, 
  initialData, 
  onClose, 
  onSuccess 
}: UseEditPatientFormProps) => {
  const updatePatientMutation = useUpdatePatient();
  const [patient, setPatient] = useState<EditPatientFormData>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when initial data changes
  useEffect(() => {
    setPatient(initialData);
    setError(null);
  }, [initialData]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    if (name.startsWith("recommendations.")) {
      const recKey = name.replace("recommendations.", "") as keyof EditPatientFormData["currentRecommendations"];
      setPatient(prev => ({
        ...prev,
        currentRecommendations: {
          ...prev.currentRecommendations,
          [recKey]: type === "checkbox" ? checked : (type === "number" ? Number(value) : value),
        },
      }));
      return;
    }

    if (type === "date") {
      const dateValue = value ? new Date(value) : null;
      setPatient(prev => ({ ...prev, [name]: dateValue }));
      return;
    }

    // Format phone number as user types
    if (name === "phone") {
      const formatted = formatPhoneNumber(value);
      setPatient(prev => ({ ...prev, [name]: formatted }));
      return;
    }

    setPatient(prev => ({ ...prev, [name]: value }));
  };

  // Helper function to safely create a Date from string input
  const createSafeDate = (dateString: string): Date => {
    if (!dateString) return new Date();
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? new Date() : date;
  };

  const handleSpiritualConsultationChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    
    if (name === "dischargeDate") {
      setPatient((prev) => ({
        ...prev,
        dischargeDate: value ? createSafeDate(value) : null,
      }));
    } else if (name === "nextDate") {
      setPatient((prev) => ({
        ...prev,
        nextAttendanceDates: value 
          ? [{ date: createSafeDate(value), type: "spiritual" }]
          : [],
      }));
    } else {
      setPatient((prev) => ({
        ...prev,
        [name]: createSafeDate(value),
      }));
    }
  };

  const validateForm = (): boolean => {
    if (!patient.name.trim()) {
      setError("Nome é obrigatório");
      return false;
    }

    if (!patient.birthDate) {
      setError("Data de nascimento é obrigatória");
      return false;
    }

    // Validate phone format if provided
    if (patient.phone && !/^\(\d{2}\) \d{5}-\d{4}$/.test(patient.phone)) {
      setError("Telefone deve estar no formato (XX) XXXXX-XXXX");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Transform data to match API format
      const updateData: UpdatePatientRequest = {
        name: patient.name.trim(),
        priority: transformPriorityToApi(patient.priority as "1" | "2" | "3"),
        treatment_status: transformStatusToApi(patient.status as "T" | "A" | "F"),
        main_complaint: patient.mainComplaint.trim() || undefined,
      };

      // Only include phone if it's provided and properly formatted
      if (patient.phone && patient.phone.length > 0) {
        updateData.phone = patient.phone;
      }

      // Only include birth date if it's valid
      if (patient.birthDate && !isNaN(patient.birthDate.getTime())) {
        updateData.birth_date = patient.birthDate.toISOString().split("T")[0];
      }

      // Use React Query mutation
      const result = await updatePatientMutation.mutateAsync({
        patientId,
        data: updateData
      });

      // Call success callback if provided
      if (onSuccess && result) {
        onSuccess(result);
      }

      onClose();
    } catch (err) {
      console.error("Erro ao atualizar paciente:", err);
      setError("Erro interno do servidor");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    patient,
    handleChange,
    handleSpiritualConsultationChange,
    handleSubmit,
    isLoading,
    error,
    setError,
  };
};

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Patient,
  Recommendations,
  Priority,
  Status,
} from "@/types/types";

import { createAttendance } from "@/api/attendances";
import { formatPhoneNumber } from "@/utils/formHelpers";
import { transformPriorityToApi, transformStatusToApi } from "@/utils/apiTransformers";
import type { CreatePatientRequest, CreateAttendanceRequest, AttendanceType } from "@/api/types";
import { useCreatePatient } from "@/hooks/usePatientQueries";
import { useAttendanceManagement } from "@/hooks/useAttendanceManagement";

const initialRecommendations: Recommendations = {
  food: "",
  water: "",
  ointment: "",
  lightBath: false,
  rod: false,
  spiritualTreatment: false,
  returnWeeks: 0,
};

const initialPatient: Omit<Patient, "id"> = {
  name: "",
  phone: "",
  priority: "3" as Priority,
  status: "N" as Status,
  birthDate: new Date(),
  mainComplaint: "",
  startDate: new Date(),
  dischargeDate: null,
  nextAttendanceDates: [],
  previousAttendances: [],
  currentRecommendations: {
    date: new Date(),
    ...initialRecommendations,
  },
};

export function usePatientForm() {
  const [patient, setPatient] = useState(initialPatient);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const createPatientMutation = useCreatePatient();
  const { refreshCurrentDate } = useAttendanceManagement();

  // Helper function to safely create a Date from string input
  const createSafeDate = (dateString: string): Date => {
    if (!dateString) return new Date();
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? new Date() : date;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;

    if (name.startsWith("recommendations.")) {
      const recKey = name.replace("recommendations.", "") as keyof Recommendations;
      setPatient((prev) => ({
        ...prev,
        currentRecommendations: {
          ...prev.currentRecommendations,
          [recKey]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
        },
      }));
    } else if (name === "birthDate" || name === "startDate") {
      setPatient((prev) => ({ ...prev, [name]: createSafeDate(value) }));
    } else {
      setPatient((prev) => ({ ...prev, [name]: value }));
    }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!patient.name.trim()) {
      alert("Por favor, preencha o nome do paciente.");
      return;
    }

    setIsLoading(true);

    try {
      // Transform patient data to API format
      const patientCreateData: CreatePatientRequest = {
        name: patient.name.trim(),
        priority: transformPriorityToApi(patient.priority),
        treatment_status: transformStatusToApi(patient.status),
      };

      // Add optional phone only if it's provided and not empty
      if (patient.phone && patient.phone.trim()) {
        const formattedPhone = formatPhoneNumber(patient.phone.trim());
        if (formattedPhone) {
          patientCreateData.phone = formattedPhone;
        }
      }

      // Add birth date if it's provided
      if (patient.birthDate) {
        patientCreateData.birth_date = patient.birthDate.toISOString().split('T')[0];
      }

      // Add main complaint only if it's provided and not empty
      if (patient.mainComplaint && patient.mainComplaint.trim()) {
        patientCreateData.main_complaint = patient.mainComplaint.trim();
      }
      
      try {
        // Use React Query mutation to create the patient
        const createdPatient = await createPatientMutation.mutateAsync(patientCreateData);
        alert("Paciente cadastrado com sucesso!");
        
        // Create attendance if next date is provided
        if (patient.nextAttendanceDates.length > 0 && patient.nextAttendanceDates[0]?.date) {
          try {
            const attendanceDate = patient.nextAttendanceDates[0].date;
            
            // Try to find an available time slot for the selected date
            const timeSlots = ["20:00", "20:30", "21:00", "21:30", "22:00", "22:30"];
            let attendanceCreated = false;
            
            for (const time of timeSlots) {
              if (attendanceCreated) break;
              
              try {
                const attendanceData: CreateAttendanceRequest = {
                  patient_id: createdPatient?.id || 0,
                  type: "spiritual" as AttendanceType,
                  scheduled_date: attendanceDate.toISOString().split('T')[0],
                  scheduled_time: time,
                  notes: "Agendamento criado durante cadastro do paciente"
                };
                
                const attendanceResult = await createAttendance(attendanceData);
                if (attendanceResult.success) {
                  attendanceCreated = true;
                  // Refresh attendances to show the new appointment
                  await refreshCurrentDate();
                } else {
                  console.log(`Slot ${time} não disponível, tentando próximo...`);
                }
              } catch (slotError) {
                console.log(`Erro no slot ${time}:`, slotError);
              }
            }
            
            if (!attendanceCreated) {
              console.warn("Não foi possível encontrar um horário disponível para a data selecionada");
              // Don't show error to user since patient was created successfully
            }
          } catch (attendanceError) {
            console.warn("Erro ao criar agendamento:", attendanceError);
            // Don't show error to user since patient was created successfully
          }
        }
        
        // React Query automatically invalidates and refetches patient list
        // No need to manually call refreshPatients()
        
        // TODO: In the future, we could also save the treatment recommendations
        // by creating an initial attendance and treatment record if needed
        
        // Reset form
        setPatient(initialPatient);
        
        // Redirect to patients list
        router.push("/patients");
      } catch (error) {
        console.error("Error creating patient:", error);
        alert(`Erro ao cadastrar paciente: ${(error as Error).message}`);
      }
    } catch (error) {
      console.error("Error creating patient:", error);
      if (error instanceof Error) {
        alert(`Erro inesperado ao cadastrar paciente: ${error.message}`);
      } else {
        alert("Erro inesperado ao cadastrar paciente. Tente novamente.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    patient,
    setPatient,
    handleChange,
    handleSpiritualConsultationChange,
    handleSubmit,
    isLoading,
  };
}

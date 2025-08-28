import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  IPatient,
  IRecommendations,
  IPriority,
  IStatus,
} from "@/types/globals";
import { createPatient } from "@/api/patients";
import { createAttendance } from "@/api/attendances";
import { transformPriorityToApi, transformStatusToApi } from "@/utils/apiTransformers";
import type { CreatePatientRequest, CreateAttendanceRequest, AttendanceType } from "@/api/types";
import { usePatients } from "@/contexts/PatientsContext";
import { useAttendances } from "@/contexts/AttendancesContext";

const initialRecommendations: IRecommendations = {
  food: "",
  water: "",
  ointment: "",
  lightBath: false,
  rod: false,
  spiritualTreatment: false,
  returnWeeks: 0,
};

const initialPatient: Omit<IPatient, "id"> = {
  name: "",
  phone: "",
  priority: "3" as IPriority,
  status: "N" as IStatus,
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
  const { refreshPatients } = usePatients();
  const { refreshCurrentDate } = useAttendances();

  // Helper function to safely create a Date from string input
  const createSafeDate = (dateString: string): Date => {
    if (!dateString) return new Date();
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? new Date() : date;
  };

  // Helper function to format phone number to backend expected format
  const formatPhoneNumber = (phone: string): string => {
    if (!phone) return "";
    
    // Remove all non-digits
    const digits = phone.replace(/\D/g, "");
    
    // Handle different digit lengths
    if (digits.length === 10) {
      // Format: (XX) XXXX-XXXX
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    } else if (digits.length === 11) {
      // Format: (XX) XXXXX-XXXX  
      return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    } else if (digits.length === 12) {
      // Assume it's 55 + area code + number, remove country code
      const withoutCountry = digits.slice(2);
      return `(${withoutCountry.slice(0, 2)}) ${withoutCountry.slice(2, 7)}-${withoutCountry.slice(7)}`;
    }
    
    // For other lengths, try to extract meaningful parts if possible
    if (digits.length >= 10) {
      // Take the last 10 digits and format as (XX) XXXX-XXXX
      const last10 = digits.slice(-10);
      return `(${last10.slice(0, 2)}) ${last10.slice(2, 6)}-${last10.slice(6)}`;
    }
    
    // If less than 10 digits, return empty (will be excluded from API call)
    return "";
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
      const recKey = name.replace("recommendations.", "") as keyof IRecommendations;
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
      
      // Call the API to create the patient
      const result = await createPatient(patientCreateData);

      if (result.success && result.value) {
        const createdPatient = result.value;
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
                  patient_id: createdPatient.id,
                  type: "spiritual" as AttendanceType,
                  scheduled_date: attendanceDate.toISOString().split('T')[0],
                  scheduled_time: time,
                  notes: "Agendamento criado durante cadastro do paciente"
                };
                
                const attendanceResult = await createAttendance(attendanceData);
                if (attendanceResult.success) {
                  console.log(`Próxima consulta agendada com sucesso para ${time}!`);
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
        
        // Refresh the patients list so the new patient appears
        await refreshPatients();
        
        // TODO: In the future, we could also save the treatment recommendations
        // by creating an initial attendance and treatment record if needed
        
        // Reset form
        setPatient(initialPatient);
        
        // Redirect to patients list
        router.push("/patients");
      } else {
        console.error("API error details:", result);
        alert(`Erro ao cadastrar paciente: ${result.error}`);
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

import { useState } from "react";
import {
  Patient,
  SpiritualConsultation,
  Recommendations,
} from "@/types/patient";

const initialRecommendations: Recommendations = {
  food: "",
  water: "",
  ointment: "",
  lightBath: false,
  rod: false,
  spiritualTreatment: false,
  returnWeeks: 0,
};

const initialSpiritualConsultation: SpiritualConsultation = {
  startDate: "",
  nextDate: "",
  dischargeDate: "",
  recommendations: initialRecommendations,
};

const initialPatient: Omit<Patient, "id" | "registrationNumber" | "history"> = {
  name: "",
  birthDate: "",
  phone: "",
  priority: "N",
  mainComplaint: "",
  status: "T",
  spiritualConsultation: initialSpiritualConsultation,
  lightBaths: [],
  rods: [],
  attendances: [],
};

export function usePatientForm() {
  const [patient, setPatient] = useState(initialPatient);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked =
      type === "checkbox" ? (e.target as HTMLInputElement).checked : undefined;
    if (name.startsWith("recommendations.")) {
      const recKey = name.replace("recommendations.", "");
      setPatient((prev) => ({
        ...prev,
        spiritualConsultation: {
          ...prev.spiritualConsultation,
          recommendations: {
            ...prev.spiritualConsultation.recommendations,
            [recKey]: type === "checkbox" ? checked : value,
          },
        },
      }));
    } else {
      setPatient((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSpiritualConsultationChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setPatient((prev) => ({
      ...prev,
      spiritualConsultation: {
        ...prev.spiritualConsultation,
        [name]: value,
        recommendations: { ...prev.spiritualConsultation.recommendations },
      },
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Call API to save patient
    alert("Paciente cadastrado! (mock)");
  };

  return {
    patient,
    setPatient,
    handleChange,
    handleSpiritualConsultationChange,
    handleSubmit,
  };
}

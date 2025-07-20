import { useState } from "react";
import {
  IPatient,
  IRecommendations,
} from "@/types/globals";

const initialRecommendations: IRecommendations = {
  food: "",
  water: "",
  ointment: "",
  lightBath: false,
  rod: false,
  spiritualTreatment: false,
  returnWeeks: 0,
};


const initialPatient: Omit<IPatient, "id" | "history"> = {
  name: "",
  phone: "",
  priority: "3",
  status: "T",
  birthDate: new Date(),
  mainComplaint: "",
  startDate:  new Date(),
  dischargeDate:  new Date(),
  nextAttendanceDates: [],
  previousAttendances: [],
  currentRecommendations: {
    date: new Date(),
    ...initialRecommendations},
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
        currentRecommendations: {
          ...prev.currentRecommendations,
          recommendations: {
            ...prev.currentRecommendations,
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
      currentRecommendations: {
        ...prev.currentRecommendations,
        [name]: value,
        recommendations: { ...prev.currentRecommendations },
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

import { useState } from "react";
import {
  IPatient,
  IRecommendations,
  IPriority,
  IStatus,
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

const initialPatient: Omit<IPatient, "id"> = {
  name: "",
  phone: "",
  priority: "3" as IPriority,
  status: "T" as IStatus,
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
      setPatient((prev) => ({ ...prev, [name]: new Date(value) }));
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
        dischargeDate: value ? new Date(value) : null,
      }));
    } else if (name === "nextDate") {
      setPatient((prev) => ({
        ...prev,
        nextAttendanceDates: value 
          ? [{ date: new Date(value), type: "spiritual" }]
          : [],
      }));
    } else {
      setPatient((prev) => ({
        ...prev,
        [name]: new Date(value),
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Call API to save patient
    console.log("Patient data:", patient);
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

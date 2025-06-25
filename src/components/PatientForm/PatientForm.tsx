import React, { useState } from "react";
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
  staff: false,
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
  staffs: [],
  attendances: [],
};

const labelClass = "block text-sm font-medium text-gray-700 mb-1";
const inputClass =
  "w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition";
const selectClass = inputClass;
const textareaClass = inputClass + " resize-none";
const fieldsetClass = "mb-6 border border-gray-200 rounded-lg p-4";
const legendClass = "font-semibold text-base text-gray-700 px-2";
const buttonClass =
  "w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg shadow-md transition";

const PatientForm: React.FC = () => {
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

  return (
    <form
      className="max-w-xl mx-auto p-6 bg-white rounded-2xl shadow-lg space-y-6"
      onSubmit={handleSubmit}
    >
      <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">
        Cadastro de Paciente
      </h2>
      <div>
        <label className={labelClass}>Nome</label>
        <input
          name="name"
          value={patient.name}
          onChange={handleChange}
          className={inputClass}
          required
        />
      </div>
      <div>
        <label className={labelClass}>Data de Nascimento</label>
        <input
          name="birthDate"
          type="date"
          value={patient.birthDate}
          onChange={handleChange}
          className={inputClass}
          required
        />
      </div>
      <div>
        <label className={labelClass}>Telefone</label>
        <input
          name="phone"
          value={patient.phone}
          onChange={handleChange}
          className={inputClass}
          placeholder="(DDD) 99999-9999"
          required
        />
      </div>
      <div>
        <label className={labelClass}>Prioridade</label>
        <select
          name="priority"
          value={patient.priority}
          onChange={handleChange}
          className={selectClass}
        >
          <option value="N">Normal</option>
          <option value="I">Idoso</option>
          <option value="E">Exceção</option>
        </select>
      </div>
      <div>
        <label className={labelClass}>Principal Queixa</label>
        <textarea
          name="mainComplaint"
          value={patient.mainComplaint}
          onChange={handleChange}
          className={textareaClass}
        />
      </div>
      <div>
        <label className={labelClass}>Status</label>
        <select
          name="status"
          value={patient.status}
          onChange={handleChange}
          className={selectClass}
        >
          <option value="T">Em tratamento</option>
          <option value="A">Alta</option>
          <option value="F">Faltas</option>
        </select>
      </div>
      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>Consulta Espiritual</legend>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
          <div>
            <label className={labelClass}>Data de Início</label>
            <input
              name="startDate"
              type="date"
              value={patient.spiritualConsultation.startDate}
              onChange={handleSpiritualConsultationChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Data da Próxima Consulta</label>
            <input
              name="nextDate"
              type="date"
              value={patient.spiritualConsultation.nextDate}
              onChange={handleSpiritualConsultationChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className={labelClass}>Data da Alta</label>
            <input
              name="dischargeDate"
              type="date"
              value={patient.spiritualConsultation.dischargeDate}
              onChange={handleSpiritualConsultationChange}
              className={inputClass}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            name="recommendations.food"
            value={patient.spiritualConsultation.recommendations.food}
            onChange={handleChange}
            className={inputClass}
            placeholder="Alimentação"
          />
          <input
            name="recommendations.water"
            value={patient.spiritualConsultation.recommendations.water}
            onChange={handleChange}
            className={inputClass}
            placeholder="Água"
          />
          <input
            name="recommendations.ointment"
            value={patient.spiritualConsultation.recommendations.ointment}
            onChange={handleChange}
            className={inputClass}
            placeholder="Pomada"
          />
          <input
            name="recommendations.returnWeeks"
            type="number"
            value={patient.spiritualConsultation.recommendations.returnWeeks}
            onChange={handleChange}
            className={inputClass}
            placeholder="Semanas para retorno"
          />
        </div>
        <div className="flex flex-wrap gap-4 mt-4">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="recommendations.lightBath"
              checked={patient.spiritualConsultation.recommendations.lightBath}
              onChange={handleChange}
              className="rounded border-gray-300 focus:ring-blue-500"
            />{" "}
            Banho de luz
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="recommendations.staff"
              checked={patient.spiritualConsultation.recommendations.staff}
              onChange={handleChange}
              className="rounded border-gray-300 focus:ring-blue-500"
            />{" "}
            Bastão
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="recommendations.spiritualTreatment"
              checked={
                patient.spiritualConsultation.recommendations.spiritualTreatment
              }
              onChange={handleChange}
              className="rounded border-gray-300 focus:ring-blue-500"
            />{" "}
            Tratamento espiritual
          </label>
        </div>
      </fieldset>
      <button type="submit" className={buttonClass}>
        Salvar
      </button>
    </form>
  );
};

export default PatientForm;

import React from "react";
import { usePatientForm } from "./usePatientForm";

const PatientForm: React.FC = () => {
  const {
    patient,
    setPatient,
    handleChange,
    handleSpiritualConsultationChange,
    handleSubmit,
  } = usePatientForm();

  const labelClass =
    "block text-sm font-medium text-[color:var(--primary-dark)] mb-1";
  const fieldsetClass =
    "mb-6 border border-[color:var(--border)] rounded-lg p-4 bg-[color:var(--background)]";
  const legendClass =
    "font-semibold text-base text-[color:var(--primary-dark)] px-2";

  return (
    <form
      className="max-w-xl mx-auto p-6 bg-[color:var(--background)] rounded-2xl shadow-lg space-y-6"
      onSubmit={handleSubmit}
    >
      <h2 className="text-2xl font-bold text-[color:var(--primary-dark)] mb-4 text-center">
        Cadastro de Paciente
      </h2>
      <div>
        <label className={labelClass}>Nome</label>
        <input
          name="name"
          value={patient.name}
          onChange={handleChange}
          className="input"
          required
        />
      </div>
      <div>
        <label className={labelClass}>Data de Nascimento</label>
        <input
          name="birthDate"
          type="date"
          className="input w-full"
          value={patient.birthDate}
          onChange={handleChange}
          required
          lang="pt-BR"
        />
      </div>
      <div>
        <label className={labelClass}>Telefone</label>
        <input
          name="phone"
          value={patient.phone}
          onChange={handleChange}
          className="input"
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
          className="select"
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
          className="textarea"
        />
      </div>
      <div>
        <label className={labelClass}>Status</label>
        <select
          name="status"
          value={patient.status}
          onChange={handleChange}
          className="select"
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
              className="input w-full"
              value={patient.spiritualConsultation.startDate}
              onChange={handleSpiritualConsultationChange}
              lang="pt-BR"
            />
          </div>
          <div>
            <label className={labelClass}>Data da Próxima Consulta</label>
            <input
              name="nextDate"
              type="date"
              className="input w-full"
              value={patient.spiritualConsultation.nextDate}
              onChange={handleSpiritualConsultationChange}
              lang="pt-BR"
            />
          </div>
          <div>
            <label className={labelClass}>Data da Alta</label>
            <input
              name="dischargeDate"
              type="date"
              className="input w-full"
              value={patient.spiritualConsultation.dischargeDate}
              onChange={handleSpiritualConsultationChange}
              lang="pt-BR"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Alimentação</label>
            <input
              name="recommendations.food"
              value={patient.spiritualConsultation.recommendations.food}
              onChange={handleChange}
              className="input"
              placeholder="Alimentação"
            />
          </div>
          <div>
            <label className={labelClass}>Água</label>
            <input
              name="recommendations.water"
              value={patient.spiritualConsultation.recommendations.water}
              onChange={handleChange}
              className="input"
              placeholder="Água"
            />
          </div>
          <div>
            <label className={labelClass}>Pomada</label>
            <input
              name="recommendations.ointment"
              value={patient.spiritualConsultation.recommendations.ointment}
              onChange={handleChange}
              className="input"
              placeholder="Pomada"
            />
          </div>
          <div>
            <label className={labelClass}>Semanas para retorno</label>
            <input
              name="recommendations.returnWeeks"
              type="number"
              value={patient.spiritualConsultation.recommendations.returnWeeks}
              onChange={handleChange}
              className="input"
              placeholder="Semanas para retorno"
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-4 mt-4">
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="recommendations.lightBath"
              checked={patient.spiritualConsultation.recommendations.lightBath}
              onChange={handleChange}
              className="rounded border-[color:var(--border)] focus:ring-[color:var(--primary)]"
            />{" "}
            Banho de luz
          </label>
          <label className="inline-flex items-center gap-2">
            <input
              type="checkbox"
              name="recommendations.rod"
              checked={patient.spiritualConsultation.recommendations.rod}
              onChange={handleChange}
              className="rounded border-[color:var(--border)] focus:ring-[color:var(--primary)]"
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
              className="rounded border-[color:var(--border)] focus:ring-[color:var(--primary)]"
            />{" "}
            Tratamento espiritual
          </label>
        </div>
      </fieldset>
      <button type="submit" className="button button-primary">
        Salvar
      </button>
    </form>
  );
};

export default PatientForm;

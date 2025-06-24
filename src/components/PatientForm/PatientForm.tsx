import React, { useState } from 'react';
import { Patient, SpiritualConsultation, Recommendations } from '@/types/patient';

const initialRecommendations: Recommendations = {
  food: '',
  water: '',
  ointment: '',
  lightBath: false,
  staff: false,
  spiritualTreatment: false,
  returnWeeks: 0,
};

const initialSpiritualConsultation: SpiritualConsultation = {
  startDate: '',
  nextDate: '',
  dischargeDate: '',
  recommendations: initialRecommendations,
};

const initialPatient: Omit<Patient, 'id' | 'registrationNumber' | 'history'> = {
  name: '',
  birthDate: '',
  phone: '',
  priority: 'N',
  mainComplaint: '',
  status: 'T',
  spiritualConsultation: initialSpiritualConsultation,
  lightBaths: [],
  staffs: [],
  attendances: [],
};

const PatientForm: React.FC = () => {
  const [patient, setPatient] = useState(initialPatient);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    // For checkboxes, cast to HTMLInputElement to access 'checked'
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    if (name.startsWith('recommendations.')) {
      const recKey = name.replace('recommendations.', '');
      setPatient((prev) => ({
        ...prev,
        spiritualConsultation: {
          ...prev.spiritualConsultation,
          recommendations: {
            ...prev.spiritualConsultation.recommendations,
            [recKey]: type === 'checkbox' ? checked : value,
          },
        },
      }));
    } else {
      setPatient((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSpiritualConsultationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    alert('Paciente cadastrado! (mock)');
  };

  return (
    <form className="max-w-xl mx-auto p-4 bg-white rounded shadow" onSubmit={handleSubmit}>
      <h2 className="text-xl font-bold mb-4">Cadastro de Paciente</h2>
      <div className="mb-2">
        <label className="block">Nome</label>
        <input name="name" value={patient.name} onChange={handleChange} className="input input-bordered w-full" required />
      </div>
      <div className="mb-2">
        <label className="block">Data de Nascimento</label>
        <input name="birthDate" type="date" value={patient.birthDate} onChange={handleChange} className="input input-bordered w-full" required />
      </div>
      <div className="mb-2">
        <label className="block">Telefone</label>
        <input name="phone" value={patient.phone} onChange={handleChange} className="input input-bordered w-full" placeholder="(DDD) 99999-9999" required />
      </div>
      <div className="mb-2">
        <label className="block">Prioridade</label>
        <select name="priority" value={patient.priority} onChange={handleChange} className="input input-bordered w-full">
          <option value="N">Normal</option>
          <option value="I">Idoso</option>
          <option value="E">Exceção</option>
        </select>
      </div>
      <div className="mb-2">
        <label className="block">Principal Queixa</label>
        <textarea name="mainComplaint" value={patient.mainComplaint} onChange={handleChange} className="input input-bordered w-full" />
      </div>
      <div className="mb-2">
        <label className="block">Status</label>
        <select name="status" value={patient.status} onChange={handleChange} className="input input-bordered w-full">
          <option value="T">Em tratamento</option>
          <option value="A">Alta</option>
          <option value="F">Faltas</option>
        </select>
      </div>
      <fieldset className="mb-4 border p-2 rounded">
        <legend className="font-semibold">Consulta Espiritual</legend>
        <div className="mb-2">
          <label className="block">Data de Início</label>
          <input name="startDate" type="date" value={patient.spiritualConsultation.startDate} onChange={handleSpiritualConsultationChange} className="input input-bordered w-full" />
        </div>
        <div className="mb-2">
          <label className="block">Data da Próxima Consulta</label>
          <input name="nextDate" type="date" value={patient.spiritualConsultation.nextDate} onChange={handleSpiritualConsultationChange} className="input input-bordered w-full" />
        </div>
        <div className="mb-2">
          <label className="block">Data da Alta</label>
          <input name="dischargeDate" type="date" value={patient.spiritualConsultation.dischargeDate} onChange={handleSpiritualConsultationChange} className="input input-bordered w-full" />
        </div>
        <div className="mb-2">
          <label className="block">Recomendações</label>
          <input name="recommendations.food" value={patient.spiritualConsultation.recommendations.food} onChange={handleChange} className="input input-bordered w-full mb-1" placeholder="Alimentação" />
          <input name="recommendations.water" value={patient.spiritualConsultation.recommendations.water} onChange={handleChange} className="input input-bordered w-full mb-1" placeholder="Água" />
          <input name="recommendations.ointment" value={patient.spiritualConsultation.recommendations.ointment} onChange={handleChange} className="input input-bordered w-full mb-1" placeholder="Pomada" />
          <label className="inline-flex items-center mr-2">
            <input type="checkbox" name="recommendations.lightBath" checked={patient.spiritualConsultation.recommendations.lightBath} onChange={handleChange} className="mr-1" /> Banho de luz
          </label>
          <label className="inline-flex items-center mr-2">
            <input type="checkbox" name="recommendations.staff" checked={patient.spiritualConsultation.recommendations.staff} onChange={handleChange} className="mr-1" /> Bastão
          </label>
          <label className="inline-flex items-center mr-2">
            <input type="checkbox" name="recommendations.spiritualTreatment" checked={patient.spiritualConsultation.recommendations.spiritualTreatment} onChange={handleChange} className="mr-1" /> Tratamento espiritual
          </label>
          <input name="recommendations.returnWeeks" type="number" value={patient.spiritualConsultation.recommendations.returnWeeks} onChange={handleChange} className="input input-bordered w-full mb-1" placeholder="Semanas para retorno" />
        </div>
      </fieldset>
      <button type="submit" className="btn btn-primary w-full">Salvar</button>
    </form>
  );
};

export default PatientForm;

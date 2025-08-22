import React from "react";
import { IPatient } from "@/types/globals";

interface PatientFormFieldsProps {
  patient:
    | IPatient
    | Omit<IPatient, "id">
    | {
        name: string;
        phone: string;
        birthDate: Date | null;
        priority: string;
        status: string;
        mainComplaint: string;
        startDate?: Date | null;
        dischargeDate?: Date | null;
        nextAttendanceDates?: { date: Date; type: string }[];
        currentRecommendations?: {
          food: string;
          water: string;
          ointment: string;
          returnWeeks: number;
          lightBath: boolean;
          rod: boolean;
          spiritualTreatment: boolean;
        };
      };
  handleChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  handleSpiritualConsultationChange?: (
    e: React.ChangeEvent<HTMLInputElement>
  ) => void;
  formatDateForInput: (date: Date | null) => string;
  showSpiritualConsultation?: boolean;
}

const PatientFormFields: React.FC<PatientFormFieldsProps> = ({
  patient,
  handleChange,
  handleSpiritualConsultationChange,
  formatDateForInput,
  showSpiritualConsultation = true,
}) => {
  return (
    <div className="space-y-6">
      {/* Personal Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Nome *
          </label>
          <input
            id="name"
            name="name"
            value={patient.name}
            onChange={handleChange}
            className="input w-full"
            required
            placeholder="Nome completo do paciente"
          />
        </div>
        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Telefone
          </label>
          <input
            id="phone"
            name="phone"
            value={patient.phone}
            onChange={handleChange}
            className="input w-full"
            placeholder="(11) 99999-9999"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="birthDate"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Data de Nascimento *
          </label>
          <input
            id="birthDate"
            name="birthDate"
            type="date"
            className="input w-full"
            value={formatDateForInput(patient.birthDate)}
            onChange={handleChange}
            required
            lang="pt-BR"
          />
        </div>
        <div>
          <label
            htmlFor="priority"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Prioridade
          </label>
          <select
            id="priority"
            name="priority"
            value={patient.priority}
            onChange={handleChange}
            className="input w-full"
          >
            <option value="3">3 - Padrão</option>
            <option value="2">2 - Idoso/crianças</option>
            <option value="1">1 - Exceção</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Status
          </label>
          <select
            id="status"
            name="status"
            value={patient.status}
            onChange={handleChange}
            className="input w-full"
          >
            <option value="T">Em Tratamento</option>
            <option value="A">Alta Médica</option>
            <option value="F">Faltas Consecutivas</option>
          </select>
        </div>
      </div>

      <div>
        <label
          htmlFor="mainComplaint"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Principal Queixa
        </label>
        <textarea
          id="mainComplaint"
          name="mainComplaint"
          value={patient.mainComplaint}
          onChange={handleChange}
          className="input w-full min-h-[100px] resize-y"
          placeholder="Descreva a principal queixa do paciente..."
        />
      </div>

      {/* Treatment Information - Only show if enabled */}
      {showSpiritualConsultation && handleSpiritualConsultationChange && (
        <div className="card-shadow">
          <div className="p-4 border-b border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800">
              Consulta Espiritual
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Informações sobre o tratamento
            </p>
          </div>
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="startDate"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Data de Início
                </label>
                <input
                  id="startDate"
                  name="startDate"
                  type="date"
                  className="input w-full"
                  value={formatDateForInput(patient.startDate || null)}
                  onChange={handleSpiritualConsultationChange}
                  lang="pt-BR"
                />
              </div>
              <div>
                <label
                  htmlFor="nextDate"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Data da Próxima Consulta
                </label>
                <input
                  id="nextDate"
                  name="nextDate"
                  type="date"
                  className="input w-full"
                  value={
                    patient.nextAttendanceDates?.[0]?.date
                      ? formatDateForInput(patient.nextAttendanceDates[0].date)
                      : ""
                  }
                  onChange={handleSpiritualConsultationChange}
                  lang="pt-BR"
                />
              </div>
              <div>
                <label
                  htmlFor="dischargeDate"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Data da Alta
                </label>
                <input
                  id="dischargeDate"
                  name="dischargeDate"
                  type="date"
                  className="input w-full"
                  value={
                    patient.dischargeDate
                      ? formatDateForInput(patient.dischargeDate)
                      : ""
                  }
                  onChange={handleSpiritualConsultationChange}
                  lang="pt-BR"
                />
              </div>
            </div>

            {/* Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="food"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Alimentação
                </label>
                <input
                  id="food"
                  name="recommendations.food"
                  value={patient.currentRecommendations?.food || ""}
                  onChange={handleChange}
                  className="input w-full"
                  placeholder="Recomendações sobre alimentação"
                />
              </div>
              <div>
                <label
                  htmlFor="water"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Água
                </label>
                <input
                  id="water"
                  name="recommendations.water"
                  value={patient.currentRecommendations?.water || ""}
                  onChange={handleChange}
                  className="input w-full"
                  placeholder="Recomendações sobre água"
                />
              </div>
              <div>
                <label
                  htmlFor="ointment"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Pomada
                </label>
                <input
                  id="ointment"
                  name="recommendations.ointment"
                  value={patient.currentRecommendations?.ointment || ""}
                  onChange={handleChange}
                  className="input w-full"
                  placeholder="Recomendações sobre pomada"
                />
              </div>
              <div>
                <label
                  htmlFor="returnWeeks"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Semanas para retorno
                </label>
                <input
                  id="returnWeeks"
                  name="recommendations.returnWeeks"
                  type="number"
                  value={patient.currentRecommendations?.returnWeeks || 0}
                  onChange={handleChange}
                  className="input w-full"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            {/* Treatment Options */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tipos de Tratamento
              </label>
              <div className="flex flex-wrap gap-4">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="recommendations.lightBath"
                    checked={patient.currentRecommendations?.lightBath || false}
                    onChange={handleChange}
                    className="rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Banho de luz</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="recommendations.rod"
                    checked={patient.currentRecommendations?.rod || false}
                    onChange={handleChange}
                    className="rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Bastão</span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="recommendations.spiritualTreatment"
                    checked={
                      patient.currentRecommendations?.spiritualTreatment ||
                      false
                    }
                    onChange={handleChange}
                    className="rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">
                    Tratamento espiritual
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientFormFields;

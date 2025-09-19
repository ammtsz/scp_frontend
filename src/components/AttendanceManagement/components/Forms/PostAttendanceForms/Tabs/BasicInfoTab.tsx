import React from "react";
import type {
  SpiritualTreatmentData,
  TreatmentStatus,
} from "../hooks/usePostAttendanceForm";
import type { PatientResponseDto } from "@/api/types";

interface BasicInfoTabProps {
  formData: SpiritualTreatmentData;
  currentTreatmentStatus: TreatmentStatus;
  patientData: PatientResponseDto | null;
  onFormDataChange: (
    field: keyof SpiritualTreatmentData,
    value: string | number | Date
  ) => void;
  onDateChange: (
    field: "attendanceDate" | "startDate"
  ) => (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const BasicInfoTab: React.FC<BasicInfoTabProps> = ({
  formData,
  currentTreatmentStatus,
  patientData,
  onFormDataChange,
  onDateChange,
}) => {
  // Format date for input field (YYYY-MM-DD) - already a string
  const formatDateForInput = (date: string) => {
    return date; // Date is already in YYYY-MM-DD format
  };

  // Get treatment status label
  const getTreatmentStatusLabel = (status: TreatmentStatus) => {
    const labels: Record<TreatmentStatus, string> = {
      N: "Novo paciente",
      T: "Em tratamento",
      A: "Alta médica espiritual",
      F: "Faltas consecutivas",
    };
    return labels[status];
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === "returnWeeks") {
      onFormDataChange(
        name as keyof SpiritualTreatmentData,
        Math.max(1, Math.min(52, parseInt(value) || 1))
      );
    } else {
      onFormDataChange(name as keyof SpiritualTreatmentData, value);
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Informações Básicas do Atendimento
        </h3>
        <p className="text-sm text-gray-600">
          Complete as informações essenciais sobre esta consulta espiritual.
        </p>
      </div>

      {/* Main Complaint */}
      <div>
        <label
          htmlFor="mainComplaint"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Principal Queixa *
        </label>
        <textarea
          id="mainComplaint"
          name="mainComplaint"
          value={formData.mainComplaint}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          placeholder="Descreva a principal queixa do paciente..."
          required
        />
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        {/* Treatment Status */}
        <div className="flex-1">
          <label
            htmlFor="treatmentStatus"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Status do Tratamento *
          </label>
          <select
            id="treatmentStatus"
            name="treatmentStatus"
            value={formData.treatmentStatus}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          >
            <option value="N">N - Novo paciente</option>
            <option value="T">T - Em tratamento</option>
            <option value="A">A - Alta médica espiritual</option>
            <option value="F">F - Faltas consecutivas</option>
          </select>
          <p className="text-xs text-gray-400 mt-1">
            Status atual: {getTreatmentStatusLabel(currentTreatmentStatus)}
          </p>
        </div>

        {/* Return Weeks */}
        <div className="flex-1">
          <label
            htmlFor="returnWeeks"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Semanas para Retorno *
          </label>
          <input
            type="number"
            id="returnWeeks"
            name="returnWeeks"
            value={formData.returnWeeks}
            onChange={handleInputChange}
            min="1"
            max="52"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
          <p className="text-xs text-gray-400 mt-1">
            Uma nova consulta espiritual será agendada automaticamente para{" "}
            {formData.returnWeeks} semana(s) a partir de hoje
          </p>
        </div>
      </div>

      {/* Date Fields */}
      <div className="flex flex-col gap-4 md:flex-row">
        {/* Attendance Date */}
        <div className="flex-1">
          <label
            htmlFor="attendanceDate"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Data da Consulta *
          </label>
          <input
            type="date"
            id="attendanceDate"
            value={formatDateForInput(formData.attendanceDate)}
            onChange={onDateChange("attendanceDate")}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            required
          />
        </div>

        {/* Start Date */}
        <div className="flex-1">
          <label
            htmlFor="startDate"
            className={`block text-sm font-medium mb-1 ${
              !!patientData?.start_date ? "text-gray-500" : "text-gray-700"
            }`}
          >
            Data de Início *
          </label>
          <input
            type="date"
            id="startDate"
            value={formatDateForInput(formData.startDate)}
            onChange={onDateChange("startDate")}
            disabled={!!patientData?.start_date}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:!bg-gray-100 disabled:!cursor-not-allowed disabled:!text-gray-500 disabled:!opacity-75"
            required
          />
          {patientData?.start_date && (
            <p className="text-xs text-gray-400 mt-1">
              Data de início já estabelecida (somente leitura)
            </p>
          )}
          {!patientData?.start_date && currentTreatmentStatus === "N" && (
            <p className="text-xs text-gray-400 mt-1">
              Data de início será definida nesta consulta
            </p>
          )}
        </div>
      </div>

      {/* Additional Notes - Moved from bottom to here */}
      <div>
        <label
          htmlFor="notes"
          className="block text-sm font-medium text-gray-700 mb-1"
        >
          Observações Adicionais
        </label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          rows={3}
          placeholder="Observações sobre o atendimento..."
        />
      </div>
    </div>
  );
};

export default BasicInfoTab;

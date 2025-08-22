import React from "react";
import { usePatientForm } from "./usePatientForm";
import PatientFormFields from "./PatientFormFields";

const PatientForm: React.FC = () => {
  const {
    patient,
    handleChange,
    handleSpiritualConsultationChange,
    handleSubmit,
    isLoading,
  } = usePatientForm();

  // Helper function to safely format date for input value
  const formatDateForInput = (date: Date | null): string => {
    if (!date || isNaN(date.getTime())) {
      return "";
    }
    try {
      return date.toISOString().split("T")[0];
    } catch {
      return "";
    }
  };

  return (
    <div className="card-shadow">
      <div className="p-4 border-b border-gray-100">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Cadastro de Paciente
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Preencha as informações do novo paciente
            </p>
          </div>
        </div>
      </div>

      <form className="p-4 space-y-6" onSubmit={handleSubmit}>
        <PatientFormFields
          patient={patient}
          handleChange={handleChange}
          handleSpiritualConsultationChange={handleSpiritualConsultationChange}
          formatDateForInput={formatDateForInput}
          showSpiritualConsultation={true}
        />

        <div className="flex justify-end">
          <button
            type="submit"
            className="button button-primary"
            disabled={isLoading}
          >
            {isLoading ? "Salvando..." : "Salvar Paciente"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientForm;

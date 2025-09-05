import React from "react";
import { usePatientForm } from "./usePatientForm";
import PatientFormFields from "./PatientFormFields";
import LoadingButton from "@/components/common/LoadingButton";

const PatientForm: React.FC = () => {
  const {
    patient,
    handleChange,
    handleSpiritualConsultationChange,
    handleSubmit,
    isLoading,
  } = usePatientForm();

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
          showSpiritualConsultation={true}
        />

        <div className="flex justify-end">
          <LoadingButton
            type="submit"
            variant="primary"
            isLoading={isLoading}
            loadingText="Salvando..."
          >
            Salvar Paciente
          </LoadingButton>
        </div>
      </form>
    </div>
  );
};

export default PatientForm;

import React, { useState, useEffect, useMemo } from "react";
import { useEditPatientForm } from "./useEditPatientForm";
import PatientFormFields from "./PatientFormFields";
import PatientTreatmentRecords from "./PatientTreatmentRecords";
import { PatientResponseDto } from "@/api/types";
import { usePatientWithAttendances } from "@/hooks/usePatientQueries";
import BaseModal from "@/components/common/BaseModal";
import ErrorDisplay from "@/components/common/ErrorDisplay";
import LoadingButton from "@/components/common/LoadingButton";

interface PatientEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientId: string;
  patientName: string; // Just need the name for fallback
  onSuccess?: (updatedPatient: PatientResponseDto) => void;
}

const PatientEditModal: React.FC<PatientEditModalProps> = ({
  isOpen,
  onClose,
  patientId,
  patientName,
  onSuccess,
}) => {
  const [patientData, setPatientData] = useState<{
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
  } | null>(null);
  // Use React Query hook for patient data fetching
  const {
    data: patientQueryData,
    isLoading: dataLoading,
    error: patientFetchError,
  } = usePatientWithAttendances(patientId);

  // Transform patient data when it's available
  useEffect(() => {
    if (isOpen && patientQueryData && !dataLoading) {
      // Transform the patient data to match our form format
      setPatientData({
        name: patientQueryData.name,
        phone: patientQueryData.phone || "",
        birthDate: patientQueryData.birthDate || null,
        priority: patientQueryData.priority,
        status: patientQueryData.status,
        mainComplaint: patientQueryData.mainComplaint || "",
        startDate: patientQueryData.startDate || null,
        dischargeDate: patientQueryData.dischargeDate || null,
        nextAttendanceDates: [],
        currentRecommendations: {
          food: "",
          water: "",
          ointment: "",
          returnWeeks: 0,
          lightBath: false,
          rod: false,
          spiritualTreatment: false,
        },
      });
    } else if (isOpen && patientFetchError) {
      // Fallback to basic data on error
      setPatientData({
        name: patientName,
        phone: "",
        birthDate: null,
        priority: "3",
        status: "T",
        mainComplaint: "",
        startDate: null,
        dischargeDate: null,
        nextAttendanceDates: [],
        currentRecommendations: {
          food: "",
          water: "",
          ointment: "",
          returnWeeks: 0,
          lightBath: false,
          rod: false,
          spiritualTreatment: false,
        },
      });
    } else if (!isOpen) {
      setPatientData(null);
    }
  }, [isOpen, dataLoading, patientQueryData, patientFetchError, patientName]);

  // Memoize the initial data to prevent infinite re-renders
  const initialData = useMemo(() => {
    if (patientData) {
      return {
        ...patientData,
        startDate: patientData.startDate || null,
        dischargeDate: patientData.dischargeDate || null,
        nextAttendanceDates: patientData.nextAttendanceDates || [],
        currentRecommendations: patientData.currentRecommendations || {
          food: "",
          water: "",
          ointment: "",
          returnWeeks: 0,
          lightBath: false,
          rod: false,
          spiritualTreatment: false,
        },
      };
    } else {
      return {
        name: patientName,
        phone: "",
        birthDate: null,
        priority: "3",
        status: "T",
        mainComplaint: "",
        startDate: null,
        dischargeDate: null,
        nextAttendanceDates: [],
        currentRecommendations: {
          food: "",
          water: "",
          ointment: "",
          returnWeeks: 0,
          lightBath: false,
          rod: false,
          spiritualTreatment: false,
        },
      };
    }
  }, [patientData, patientName]);

  const {
    patient,
    handleChange,
    handleSpiritualConsultationChange,
    handleSubmit,
    isLoading,
    error,
    setError,
  } = useEditPatientForm({
    patientId,
    initialData,
    onClose,
    onSuccess,
  });

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Atualizar Dados do Paciente"
      subtitle="Atualize as informações do paciente após a consulta"
      maxWidth="2xl"
    >
      <form className="p-6" onSubmit={handleSubmit}>
        {dataLoading && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg
                  className="animate-spin h-5 w-5 text-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-blue-800">
                  Carregando dados do paciente...
                </p>
              </div>
            </div>
          </div>
        )}

        <ErrorDisplay
          error={error}
          className="mb-4"
          dismissible={true}
          onDismiss={() => setError(null)}
        />

        {!dataLoading && patientData && (
          <>
            <PatientFormFields
              patient={patient}
              handleChange={handleChange}
              handleSpiritualConsultationChange={
                handleSpiritualConsultationChange
              }
              showSpiritualConsultation={true} // Show spiritual consultation in edit modal
            />

            <div className="mt-8 pt-6 border-t border-gray-200">
              <PatientTreatmentRecords patientId={patientId} />
            </div>
          </>
        )}

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
            disabled={isLoading || dataLoading}
          >
            Cancelar
          </button>
          <LoadingButton
            type="submit"
            variant="primary"
            isLoading={isLoading}
            loadingText="Salvando..."
            disabled={dataLoading}
          >
            Salvar Alterações
          </LoadingButton>
        </div>
      </form>
    </BaseModal>
  );
};

export default PatientEditModal;

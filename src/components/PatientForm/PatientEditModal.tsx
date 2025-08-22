import React, { useState, useEffect, useMemo } from "react";
import { useEditPatientForm } from "./useEditPatientForm";
import PatientFormFields from "./PatientFormFields";
import { PatientResponseDto } from "@/api/types";
import { getPatientById } from "@/api/patients";

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
  const [dataLoading, setDataLoading] = useState(false);

  // Fetch patient data when modal opens
  useEffect(() => {
    const fetchPatientData = async () => {
      if (isOpen && patientId) {
        setDataLoading(true);
        try {
          const result = await getPatientById(patientId);
          if (result.success && result.value) {
            // Transform the API response to match our form format
            const patient = result.value;
            setPatientData({
              name: patient.name,
              phone: patient.phone || "",
              birthDate: patient.birth_date
                ? new Date(patient.birth_date)
                : null,
              priority: patient.priority,
              status: patient.treatment_status,
              mainComplaint: patient.main_complaint || "",
              startDate: patient.start_date
                ? new Date(patient.start_date)
                : null,
              dischargeDate: patient.discharge_date
                ? new Date(patient.discharge_date)
                : null,
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
          }
        } catch (error) {
          console.error("Error fetching patient data:", error);
          // Fallback to basic data
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
        } finally {
          setDataLoading(false);
        }
      } else {
        setPatientData(null);
      }
    };

    fetchPatientData();
  }, [isOpen, patientId, patientName]);

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Atualizar Dados do Paciente
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Atualize as informações do paciente após a consulta
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              disabled={isLoading}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

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

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-800">{error}</p>
                </div>
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      type="button"
                      onClick={() => setError(null)}
                      className="inline-flex bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                    >
                      <span className="sr-only">Dismiss</span>
                      <svg
                        className="h-3 w-3"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {!dataLoading && patientData && (
            <PatientFormFields
              patient={patient}
              handleChange={handleChange}
              handleSpiritualConsultationChange={
                handleSpiritualConsultationChange
              }
              formatDateForInput={formatDateForInput}
              showSpiritualConsultation={true} // Show spiritual consultation in edit modal
            />
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
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || dataLoading}
            >
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientEditModal;

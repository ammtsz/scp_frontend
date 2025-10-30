import React, { useState, useMemo } from "react";
import { Patient, Recommendations, PreviousAttendance } from "@/types/types";
import {
  useCreateTreatmentRecord,
  useUpdateTreatmentRecord,
} from "@/hooks/useTreatmentRecords";
import { useCreateAttendance } from "@/hooks/useAttendanceQueries";
import { AttendanceType } from "@/api/types";
import BaseModal from "@/components/common/BaseModal";
import LoadingButton from "@/components/common/LoadingButton";
import ErrorDisplay from "@/components/common/ErrorDisplay";
import Switch from "@/components/common/Switch";
import TreatmentLocationForm from "./TreatmentForms/TreatmentLocationForm";
import type {
  LightBathLocationTreatment,
  RodLocationTreatment,
} from "@/components/AttendanceManagement/components/Forms/PostAttendanceForms/types";

interface TreatmentRecommendationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onSuccess?: (updatedRecommendations: Recommendations) => void;
}

type SaveMode = "update" | "create";

export const TreatmentRecommendationsModal: React.FC<
  TreatmentRecommendationsModalProps
> = ({ isOpen, onClose, patient, onSuccess }) => {
  // Mutations for treatment records and attendance
  const createTreatmentRecordMutation = useCreateTreatmentRecord();
  const updateTreatmentRecordMutation = useUpdateTreatmentRecord();
  const createAttendanceMutation = useCreateAttendance();

  // Determine recent completed attendances (within last 30 days)
  const recentCompletedAttendances = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return patient.previousAttendances
      .filter((att) => att.date >= thirtyDaysAgo)
      .sort((a, b) => b.date.getTime() - a.date.getTime()); // Most recent first
  }, [patient.previousAttendances]);

  // Smart default: Update if recent consultation within 7 days, otherwise create new
  const defaultSaveMode: SaveMode = useMemo(() => {
    if (recentCompletedAttendances.length === 0) return "create";

    const mostRecent = recentCompletedAttendances[0];
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    return mostRecent.date >= sevenDaysAgo ? "update" : "create";
  }, [recentCompletedAttendances]);

  // State
  const [saveMode, setSaveMode] = useState<SaveMode>(defaultSaveMode);
  const [selectedAttendance, setSelectedAttendance] =
    useState<PreviousAttendance | null>(recentCompletedAttendances[0] || null);

  const [formData, setFormData] = useState<Recommendations>({
    food: patient.currentRecommendations?.food || "",
    water: patient.currentRecommendations?.water || "",
    ointment: patient.currentRecommendations?.ointment || "",
    lightBath: patient.currentRecommendations?.lightBath || false,
    rod: patient.currentRecommendations?.rod || false,
    spiritualTreatment: false, // Always false since we're removing this option
    returnWeeks: patient.currentRecommendations?.returnWeeks || 2,
  });

  // Treatment details state
  const [lightBathTreatments, setLightBathTreatments] = useState<
    LightBathLocationTreatment[]
  >([]);
  const [rodTreatments, setRodTreatments] = useState<RodLocationTreatment[]>(
    []
  );

  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (
    field: keyof Recommendations,
    value: string | number | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear treatment data when switches are turned off
    if (field === "lightBath" && !value) {
      setLightBathTreatments([]);
    }
    if (field === "rod" && !value) {
      setRodTreatments([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      if (saveMode === "update" && selectedAttendance) {
        // Update existing treatment record
        await updateTreatmentRecordMutation.mutateAsync({
          id: Number(selectedAttendance.attendanceId),
          data: {
            food: formData.food || undefined,
            water: formData.water || undefined,
            ointments: formData.ointment || undefined,
            light_bath: formData.lightBath,
            rod: formData.rod,
            spiritual_treatment: false, // Always false since we removed this option
            return_in_weeks: formData.returnWeeks,
          },
        });
      } else {
        // Create new consultation attendance
        const newAttendance = await createAttendanceMutation.mutateAsync({
          patientId: Number(patient.id),
          attendanceType: "spiritual" as AttendanceType,
          scheduledDate: new Date().toISOString().split("T")[0], // Today
        });

        if (!newAttendance) {
          throw new Error("Failed to create new consultation attendance");
        }

        // Create treatment record for the new attendance
        await createTreatmentRecordMutation.mutateAsync({
          attendance_id: newAttendance.id,
          food: formData.food || undefined,
          water: formData.water || undefined,
          ointments: formData.ointment || undefined,
          light_bath: formData.lightBath,
          rod: formData.rod,
          spiritual_treatment: false, // Always false since we removed this option
          return_in_weeks: formData.returnWeeks,
        });
      }

      // Call success callback with the new recommendations
      onSuccess?.(formData);
      onClose();
    } catch (err) {
      console.error("Error saving treatment recommendations:", err);
      setError("Erro ao salvar recomendações. Tente novamente.");
    }
  };

  const resetForm = () => {
    setFormData({
      food: patient.currentRecommendations?.food || "",
      water: patient.currentRecommendations?.water || "",
      ointment: patient.currentRecommendations?.ointment || "",
      lightBath: patient.currentRecommendations?.lightBath || false,
      rod: patient.currentRecommendations?.rod || false,
      spiritualTreatment: false, // Always false since we're removing this option
      returnWeeks: patient.currentRecommendations?.returnWeeks || 2,
    });
    setLightBathTreatments([]);
    setRodTreatments([]);
    setError(null);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={handleClose}
      title="Recomendações de Tratamento"
      subtitle={`Definir recomendações para ${patient.name}`}
      maxWidth="2xl"
      preventOverflow={true}
      height="max-h-[90vh]"
    >
      <div className="flex flex-col h-full">
        {error && (
          <div className="px-6 pt-4">
            <ErrorDisplay error={error} />
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto max-h-[70vh] px-6 py-4 space-y-6">
            {/* General Recommendations */}
            <div className="space-y-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Recomendações Gerais
                </h3>
                <p className="text-sm text-gray-600">
                  Forneça orientações gerais sobre alimentação, hidratação e
                  cuidados complementares.
                </p>
              </div>

              {/* Food Recommendations */}
              <div>
                <label
                  htmlFor="food"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Alimentação
                </label>
                <textarea
                  id="food"
                  value={formData.food}
                  onChange={(e) => handleInputChange("food", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Recomendações alimentares (ex: evitar carnes vermelhas, priorizar vegetais, etc.)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Orientações específicas sobre dieta e alimentação durante o
                  tratamento
                </p>
              </div>

              {/* Water Recommendations */}
              <div>
                <label
                  htmlFor="water"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Água
                </label>
                <input
                  type="text"
                  id="water"
                  value={formData.water}
                  onChange={(e) => handleInputChange("water", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: 2L de água fluidificada por dia"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Quantidade e tipo de água recomendada
                </p>
              </div>

              {/* Ointments Recommendations */}
              <div>
                <label
                  htmlFor="ointment"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Pomadas
                </label>
                <input
                  type="text"
                  id="ointment"
                  value={formData.ointment}
                  onChange={(e) =>
                    handleInputChange("ointment", e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Pomadas ou unguentos recomendados..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Produtos tópicos para aplicação externa
                </p>
              </div>
            </div>

            {/* Treatment Recommendations */}
            <div className="space-y-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Recomendações de Tratamento
                </h3>
                <p className="text-sm text-gray-600">
                  Selecione os tratamentos específicos para este paciente.
                </p>
              </div>

              {/* Light Bath Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="lightBath"
                    checked={formData.lightBath}
                    onChange={(checked: boolean) =>
                      handleInputChange("lightBath", checked)
                    }
                    label="Banho de Luz"
                    size="sm"
                  />
                </div>

                {/* Light Bath Treatment Form */}
                {formData.lightBath && (
                  <div className="ml-6">
                    <TreatmentLocationForm
                      treatmentType="lightBath"
                      treatments={lightBathTreatments}
                      onChange={(treatments) =>
                        setLightBathTreatments(
                          treatments as LightBathLocationTreatment[]
                        )
                      }
                      disabled={
                        createTreatmentRecordMutation.isPending ||
                        updateTreatmentRecordMutation.isPending ||
                        createAttendanceMutation.isPending
                      }
                    />
                  </div>
                )}
              </div>

              {/* Rod Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="rod"
                    checked={formData.rod}
                    onChange={(checked: boolean) =>
                      handleInputChange("rod", checked)
                    }
                    label="Bastão"
                    size="sm"
                  />
                </div>

                {/* Rod Treatment Form */}
                {formData.rod && (
                  <div className="ml-6">
                    <TreatmentLocationForm
                      treatmentType="rod"
                      treatments={rodTreatments}
                      onChange={(treatments) =>
                        setRodTreatments(treatments as RodLocationTreatment[])
                      }
                      disabled={
                        createTreatmentRecordMutation.isPending ||
                        updateTreatmentRecordMutation.isPending ||
                        createAttendanceMutation.isPending
                      }
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Return Schedule */}
            <div className="space-y-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Agendamento de Retorno
                </h3>
                <p className="text-sm text-gray-600">
                  Defina quando o paciente deve retornar para reavaliação.
                </p>
              </div>

              <div>
                <label
                  htmlFor="returnWeeks"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Retorno em quantas semanas?
                </label>
                <input
                  type="number"
                  id="returnWeeks"
                  value={formData.returnWeeks}
                  onChange={(e) =>
                    handleInputChange(
                      "returnWeeks",
                      parseInt(e.target.value) || 1
                    )
                  }
                  min="1"
                  max="52"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Ex: 2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Baseado na avaliação do caso e resposta ao tratamento (1-52
                  semanas)
                </p>
              </div>
            </div>

            {/* Save Mode Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900 border-b pb-2">
                📋 Salvar Recomendações
              </h3>

              <div className="bg-blue-50 border border-blue-200 rounded-md p-4 w-full mx-auto">
                <div className="text-sm">
                  <div className="flex items-center gap-2 font-medium text-blue-900 mb-2">
                    <div className="flex items-center justify-center w-5 h-5 bg-blue-200 rounded-full">
                      <span className="text-blue-700 text-xs font-bold">i</span>
                    </div>
                    Como Salvar as Recomendações
                  </div>
                  <span className="text-blue-800 leading-relaxed">
                    As recomendações precisam estar vinculadas a um registro de
                    Consulta Espiritual para serem salvas no sistema. Você pode
                    atualizar uma consulta recente ou criar uma nova consulta
                    para hoje:
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                {/* Create new consultation option */}
                <label className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                  <input
                    type="radio"
                    name="saveMode"
                    value="create"
                    checked={saveMode === "create"}
                    onChange={(e) => setSaveMode(e.target.value as SaveMode)}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">
                      Criar Nova Consulta
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      📅 Hoje - Novo registro de consulta
                    </div>
                  </div>
                </label>

                {/* Update existing consultation option */}

                <label
                  className={`flex items-start gap-3 p-3 border rounded-lg ${
                    !recentCompletedAttendances.length
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="saveMode"
                    value="update"
                    checked={saveMode === "update"}
                    onChange={(e) => {
                      setSaveMode(e.target.value as SaveMode);
                      setSelectedAttendance(recentCompletedAttendances[0]);
                    }}
                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    disabled={!recentCompletedAttendances.length}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">
                      Atualizar Última Consulta
                    </div>
                    {!recentCompletedAttendances.length && (
                      <div className="text-xs text-gray-500 mt-1">
                        Nenhuma Consulta Espiritual passada disponível
                      </div>
                    )}
                    {selectedAttendance &&
                      selectedAttendance.type === "spiritual" && (
                        <div className="text-sm text-gray-600 mt-1">
                          📅{" "}
                          {selectedAttendance.date.toLocaleDateString("pt-BR")}{" "}
                          - Consulta Espiritual
                          {selectedAttendance.recommendations && (
                            <div className="text-xs text-gray-500 mt-1">
                              💡 Atual:{" "}
                              {[
                                selectedAttendance.recommendations.lightBath &&
                                  "Banho de Luz",
                                selectedAttendance.recommendations.rod &&
                                  "Bastão",
                                selectedAttendance.recommendations
                                  .spiritualTreatment && "Trat. Espiritual",
                              ]
                                .filter(Boolean)
                                .join(" + ") || "Sem tratamentos específicos"}
                            </div>
                          )}
                        </div>
                      )}
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* Fixed Footer - Action Buttons */}
          <div className="flex-shrink-0 px-6 py-4 border-t border-gray-200 rounded-b-md bg-white">
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleClose}
                className="ds-button-outline"
                disabled={
                  createTreatmentRecordMutation.isPending ||
                  updateTreatmentRecordMutation.isPending ||
                  createAttendanceMutation.isPending
                }
              >
                Cancelar
              </button>
              <LoadingButton
                type="submit"
                className="ds-button-primary"
                isLoading={
                  createTreatmentRecordMutation.isPending ||
                  updateTreatmentRecordMutation.isPending ||
                  createAttendanceMutation.isPending
                }
                loadingText={
                  saveMode === "update" ? "Atualizando..." : "Criando..."
                }
              >
                {saveMode === "update"
                  ? "Atualizar Recomendações"
                  : "Criar Nova Consulta"}
              </LoadingButton>
            </div>
          </div>
        </form>
      </div>
    </BaseModal>
  );
};

export default TreatmentRecommendationsModal;

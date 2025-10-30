import React from "react";
import { Patient, AttendanceType } from "@/types/types";
import { formatDateBR } from "@/utils/dateHelpers";

interface TreatmentStatusOverviewProps {
  patient: Patient;
}

const getTreatmentTitle = (type: AttendanceType): { title: string; icon: string } => {
  const treatmentTitles = {
    spiritual: { title: "Consulta Espiritual", icon: "🔮" },
    lightBath: { title: "Banho de Luz", icon: "💡" },
    rod: { title: "Bastão", icon: "⚡" },
    combined: { title: "Tratamento Combinado", icon: "✨" },
  };

  return treatmentTitles[type] || treatmentTitles.spiritual;
};

export const TreatmentStatusOverview: React.FC<TreatmentStatusOverviewProps> = ({
  patient,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      <div className="bg-blue-50 p-4 rounded-lg">
        <div className="text-sm text-blue-600 font-medium">
          Início do Tratamento
        </div>
        <div className="text-lg font-semibold text-blue-900">
          {formatDateBR(
            patient.startDate.toISOString?.() ?? String(patient.startDate)
          )}
        </div>
      </div>
      
      <div className="bg-green-50 p-4 rounded-lg">
        <div className="text-sm text-green-600 font-medium">
          Próximo Atendimento
        </div>
        <div className="text-lg font-semibold text-green-900">
          {patient.nextAttendanceDates[0]?.date ? (
            <>
              <div>
                {formatDateBR(
                  patient.nextAttendanceDates[0].date.toISOString?.() ??
                    String(patient.nextAttendanceDates[0].date)
                )}
              </div>
              <div className="text-xs text-green-600 font-normal mt-1">
                {getTreatmentTitle(patient.nextAttendanceDates[0].type).title}
              </div>
            </>
          ) : (
            <div className="text-sm text-orange-600 font-normal">
              Não agendado
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="text-sm text-gray-600 font-medium">
          Alta Prevista
        </div>
        <div className="text-lg font-semibold text-gray-900">
          {patient.dischargeDate
            ? formatDateBR(
                patient.dischargeDate.toISOString?.() ??
                  String(patient.dischargeDate)
              )
            : "Não definida"}
        </div>
      </div>
    </div>
  );
};
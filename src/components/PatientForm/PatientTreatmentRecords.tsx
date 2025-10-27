"use client";

import React, { useState, useEffect } from "react";
import { useTreatmentRecordsCompat as useTreatmentRecords } from "@/hooks/useTreatmentRecords";

interface PatientTreatmentRecordsProps {
  patientId: string;
}

const PatientTreatmentRecords: React.FC<PatientTreatmentRecordsProps> = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  patientId: _patientId,
}) => {
  const { treatmentRecords, loading, error, refreshTreatmentRecords } =
    useTreatmentRecords();
  const [showForm, setShowForm] = useState(false);

  // Filter records for this patient (based on attendance)
  // Note: We'll need to enhance this logic once we have attendance data linked
  // For now, show all records - this will be improved when we link attendances
  const patientRecords = treatmentRecords;

  useEffect(() => {
    // Refresh records when component mounts
    refreshTreatmentRecords();
  }, [refreshTreatmentRecords]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleRecordCreated = () => {
    setShowForm(false);
    refreshTreatmentRecords();
  };

  if (loading) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-600">Carregando registros de tratamento...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <p className="text-red-800">Erro ao carregar registros: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-gray-900">
          Registros de Tratamento
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          {showForm ? "Cancelar" : "Novo Registro"}
        </button>
      </div>

      {showForm && (
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="bg-blue-50 p-4 rounded-md">
            <p className="text-blue-800 text-sm">
              Formulário de registro de tratamento será implementado aqui.
            </p>
            <button
              onClick={() => setShowForm(false)}
              className="mt-2 px-3 py-1 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

      {patientRecords.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg">
          <p className="text-gray-600">
            Nenhum registro de tratamento encontrado
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Clique em &quot;Novo Registro&quot; para adicionar o primeiro
            registro
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {patientRecords.map((record) => (
            <div
              key={record.id}
              className="border border-gray-200 rounded-lg p-4 bg-white"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {record.spiritual_treatment && (
                      <span className="px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                        Espiritual
                      </span>
                    )}
                    <span className="text-sm text-gray-500">
                      {new Date(record.created_at).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  {record.notes && (
                    <p className="text-gray-700 text-sm">{record.notes}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientTreatmentRecords;

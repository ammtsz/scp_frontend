import React from "react";
import Link from "next/link";
import { Patient } from "@/types/types";

interface HeaderCardProps {
  patient: Patient;
}

export const HeaderCard: React.FC<HeaderCardProps> = ({ patient }) => {
  // Helper function to get priority badge color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "1":
        return "bg-red-100 text-red-800 border border-red-200";
      case "2":
        return "bg-yellow-100 text-yellow-800 border border-yellow-200";
      case "3":
        return "bg-green-100 text-green-800 border border-green-200";
      default:
        return "bg-gray-100 text-gray-800 border border-gray-200";
    }
  };

  // Helper function to get priority text
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "1":
        return "Emergência";
      case "2":
        return "Intermediário";
      case "3":
        return "Normal";
      default:
        return priority;
    }
  };

  // Calculate age
  const calculateAge = (birthDate: Date | string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }
    return age;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border mb-6">
      <div className="p-6">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          {/* Patient Basic Info */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <h1 className="text-3xl font-bold text-gray-900">
                {patient.name}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(
                  patient.priority
                )}`}
              >
                {getPriorityText(patient.priority)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Registro:</span>
                <span className="ml-2 font-medium">#{patient.id}</span>
              </div>
              <div>
                <span className="text-gray-500">Idade:</span>
                <span className="ml-2 font-medium">
                  {calculateAge(patient.birthDate)} anos
                </span>
              </div>
              <div>
                <span className="text-gray-500">Telefone:</span>
                <span className="ml-2 font-medium">{patient.phone}</span>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <span className="ml-2 font-medium">{patient.status}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-gray-500">Queixa principal:</span>
                <span className="ml-2 font-medium">
                  {patient.mainComplaint}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <Link
              href={`/patients/${patient.id}/edit`}
              className="button button-secondary"
            >
              ✏️ Editar
            </Link>
            <button
              className="button button-primary"
              onClick={() => alert("Funcionalidade em desenvolvimento")}
            >
              📅 Agendar
            </button>
            <button
              className="button bg-green-600 hover:bg-green-700 text-white"
              onClick={() => alert("Funcionalidade em desenvolvimento")}
            >
              📞 Contato
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

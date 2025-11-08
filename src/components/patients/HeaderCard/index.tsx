import React from "react";
import { Patient, AttendanceResponseDto } from "@/types/types";
import QuickActions from "./QuickActions";

interface HeaderCardProps {
  patient: Patient;
  latestAttendance?: AttendanceResponseDto;
  onAttendanceUpdate?: () => void;
}

export const HeaderCard: React.FC<HeaderCardProps> = ({
  patient,
  latestAttendance,
  onAttendanceUpdate,
}) => {
  // Helper function to get priority badge styling using design system classes
  const getPriorityBadgeClass = (priority: string) => {
    const baseClasses =
      "inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border";
    switch (priority) {
      case "1":
        return `${baseClasses} bg-red-50 text-red-800 border-red-200`;
      case "2":
        return `${baseClasses} bg-yellow-50 text-yellow-800 border-yellow-200`;
      case "3":
        return `${baseClasses} bg-green-50 text-green-800 border-green-200`;
      default:
        return `${baseClasses} bg-gray-50 text-gray-600 border-gray-200`;
    }
  };

  // Helper function to get priority text
  const getPriorityText = (priority: string) => {
    switch (priority) {
      case "1":
        return "Exceção";
      case "2":
        return "Idoso/crianças";
      case "3":
        return "Padrão";
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
    <div className="ds-card mb-6">
      <div className="ds-card-body">
        <div className="flex flex-col gap-8">
          {/* Patient Basic Info */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <h1 className="ds-text-heading-1">{patient.name}</h1>
              <span className={getPriorityBadgeClass(patient.priority)}>
                {getPriorityText(patient.priority)}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ds-text-body-secondary">
              <div>
                <span className="ds-text-caption">Registro:</span>
                <span className="ml-2 font-medium">#{patient.id}</span>
              </div>
              <div>
                <span className="ds-text-caption">Idade:</span>
                <span className="ml-2 font-medium">
                  {calculateAge(patient.birthDate)} anos
                </span>
              </div>
              <div>
                <span className="ds-text-caption">Telefone:</span>
                <span className="ml-2 font-medium">{patient.phone}</span>
              </div>
              <div>
                <span className="ds-text-caption">Status:</span>
                <span className="ml-2 font-medium">{patient.status}</span>
              </div>
              <div className="sm:col-span-2">
                <span className="ds-text-caption">Queixa principal:</span>
                <span className="ml-2 font-medium">
                  {patient.mainComplaint}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Actions - Interactive Features */}
          <QuickActions
            patient={patient}
            latestAttendance={latestAttendance}
            onAttendanceUpdate={onAttendanceUpdate}
          />
        </div>
      </div>
    </div>
  );
};

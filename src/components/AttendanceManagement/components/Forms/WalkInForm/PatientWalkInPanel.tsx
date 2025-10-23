"use client";

import React, { useState } from "react";
import { ChevronDown, Plus } from "react-feather";
import PatientWalkInForm from "./PatientWalkInForm";
import { Priority } from "@/types/types";

interface PatientWalkInPanelProps {
  onRegisterNewAttendance?: (
    patientName: string,
    types: string[],
    isNew: boolean,
    priority: Priority
  ) => void;
}

const PatientWalkInPanel: React.FC<PatientWalkInPanelProps> = ({
  onRegisterNewAttendance,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleSuccessfulCheckIn = (
    patientName: string,
    types: string[],
    isNew: boolean,
    priority: Priority
  ) => {
    // Call parent callback
    if (onRegisterNewAttendance) {
      onRegisterNewAttendance(patientName, types, isNew, priority);
    }

    // Optionally collapse the panel after successful check-in
    setIsExpanded(false);
  };

  return (
    <div className="card-shadow">
      {/* Header with toggle button */}
      <div
        className="p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Plus className="w-5 h-5 text-blue-600" />
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                Pacientes não Agendados
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Registro de pacientes não agendados para atendimento imediato
              </p>
            </div>
          </div>

          <ChevronDown
            className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
              isExpanded ? "rotate-180" : ""
            }`}
          />
        </div>
      </div>

      {/* Expandable content */}
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          isExpanded ? "max-h-[2000px] opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <PatientWalkInForm
          onRegisterNewAttendance={handleSuccessfulCheckIn}
          isDropdown={true}
        />
      </div>
    </div>
  );
};

export default PatientWalkInPanel;

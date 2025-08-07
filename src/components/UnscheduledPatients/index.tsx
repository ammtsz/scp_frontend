import React from "react";
import { ChevronDown, ChevronUp } from "react-feather";
import NewAttendanceForm from "../NewAttendanceForm";
import { IPriority } from "@/types/globals";

interface UnscheduledPatientsProps {
  onRegisterNewAttendance?: (
    patientName: string,
    types: string[],
    isNew: boolean,
    priority: IPriority
  ) => void;
}

const UnscheduledPatients: React.FC<UnscheduledPatientsProps> = ({
  onRegisterNewAttendance,
}) => {
  const [collapsed, setCollapsed] = React.useState(true);
  return (
    <div className="card-shadow">
      <div className="p-4">
        <button
          type="button"
          className="flex items-center justify-between w-full text-left focus:outline-none"
          onClick={() => setCollapsed((c) => !c)}
          aria-expanded={!collapsed}
          aria-controls="not-scheduled-form"
        >
          <div>
            <h2 className="text-xl font-semibold text-gray-800">
              Check-in de pacientes não agendados
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Registre pacientes não agendados ou novos pacientes
            </p>
          </div>
          {collapsed ? (
            <ChevronDown className="w-6 h-6 text-gray-500" />
          ) : (
            <ChevronUp className="w-6 h-6 text-gray-500" />
          )}
        </button>
        {!collapsed && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <NewAttendanceForm
              onRegisterNewAttendance={onRegisterNewAttendance}
              showSuccessModal
              submitLabel="Fazer Check-in"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default UnscheduledPatients;

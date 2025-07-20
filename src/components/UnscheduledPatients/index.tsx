import React from "react";
import { ChevronDown, ChevronUp } from "react-feather";
import NewAttendanceForm from "../NewAttendanceForm";
import { IPriority } from "@/types/globas";

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
    <div className="w-full max-w-5xl mx-auto p-4 bg-[color:var(--surface)] rounded shadow border border-[color:var(--border)]">
      <button
        type="button"
        className="flex items-center justify-between w-full text-xl font-bold text-[color:var(--primary-dark)] focus:outline-none"
        onClick={() => setCollapsed((c) => !c)}
        aria-expanded={!collapsed}
        aria-controls="not-scheduled-form"
      >
        <span>Pacientes não agendados</span>
        {collapsed ? (
          <ChevronDown className="w-6 h-6" />
        ) : (
          <ChevronUp className="w-6 h-6" />
        )}
      </button>
      {!collapsed && (
        <NewAttendanceForm
          onRegisterNewAttendance={onRegisterNewAttendance}
          showSuccessModal
          submitLabel="Fazer Check-in"
        />
      )}
    </div>
  );
};

export default UnscheduledPatients;

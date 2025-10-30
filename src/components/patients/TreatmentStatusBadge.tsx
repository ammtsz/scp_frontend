import React from "react";

interface TreatmentStatusBadgeProps {
  isActive: boolean;
  label: string;
  icon?: string;
  className?: string;
}

export const TreatmentStatusBadge: React.FC<TreatmentStatusBadgeProps> = ({
  isActive,
  label,
  icon,
  className = "",
}) => {
  const statusClasses = isActive
    ? "bg-green-50 text-green-800 border-green-200"
    : "bg-gray-50 text-gray-600 border-gray-200";

  return (
    <span className={`ds-badge ${statusClasses} ${className}`}>
      {icon && <span>{icon}</span>}
      <span>{label}</span>
    </span>
  );
};

interface PatientStatusOverviewProps {
  priority: string;
  totalAttendances: number;
  weeksInTreatment: number;
  nextAppointment?: string;
}

export const PatientStatusOverview: React.FC<PatientStatusOverviewProps> = ({
  priority,
  totalAttendances,
  weeksInTreatment,
  nextAppointment,
}) => {
  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case "1":
        return {
          badgeClass: "ds-badge-priority-emergency",
          text: "Emergência",
          icon: "🚨",
        };
      case "2":
        return {
          badgeClass: "ds-badge-priority-intermediate",
          text: "Intermediário",
          icon: "⚠️",
        };
      case "3":
        return {
          badgeClass: "ds-badge-priority-normal",
          text: "Normal",
          icon: "✅",
        };
      default:
        return {
          badgeClass:
            "ds-badge bg-gray-50 text-gray-600 border border-gray-200",
          text: priority,
          icon: "📋",
        };
    }
  };

  const priorityConfig = getPriorityConfig(priority);

  return (
    <div className="ds-card bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <div className="ds-card-body">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <span className={priorityConfig.badgeClass}>
              {priorityConfig.icon}
            </span>
            <span className="ds-text-label">Status do Paciente</span>
          </div>
          <span className="ds-text-body-secondary">{priorityConfig.text}</span>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="ds-text-body-secondary">Total de consultas:</span>
            <div className="ds-text-heading-3 text-blue-900">
              {totalAttendances}
            </div>
          </div>
          <div className="flex justify-between items-center">
            <span className="ds-text-body-secondary">
              Semanas de tratamento:
            </span>
            <div className="ds-text-heading-3 text-blue-900">
              {weeksInTreatment}
            </div>
          </div>
        </div>

        {nextAppointment && (
          <div className="mt-3 pt-3 border-t border-blue-200">
            <span className="ds-text-body-secondary">Próximo atendimento:</span>
            <div className="ds-text-body font-semibold text-blue-900">
              {nextAppointment}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

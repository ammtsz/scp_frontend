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
  icon = "📋",
  className = "",
}) => {
  const baseClasses =
    "px-3 py-1 rounded-full text-sm font-medium flex items-center gap-1";
  const statusClasses = isActive
    ? "bg-green-100 text-green-800 border border-green-200"
    : "bg-gray-100 text-gray-600 border border-gray-200";

  return (
    <span className={`${baseClasses} ${statusClasses} ${className}`}>
      <span>{icon}</span>
      <span>{label}</span>
    </span>
  );
};

interface TreatmentProgressBarProps {
  current: number;
  total: number;
  label: string;
}

export const TreatmentProgressBar: React.FC<TreatmentProgressBarProps> = ({
  current,
  total,
  label,
}) => {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm font-medium text-gray-700">{label}</span>
        <span className="text-sm text-gray-500">
          {current}/{total}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
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
        return { color: "bg-red-500", text: "Emergência", icon: "🚨" };
      case "2":
        return { color: "bg-yellow-500", text: "Intermediário", icon: "⚠️" };
      case "3":
        return { color: "bg-green-500", text: "Normal", icon: "✅" };
      default:
        return { color: "bg-gray-500", text: priority, icon: "📋" };
    }
  };

  const priorityConfig = getPriorityConfig(priority);

  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-400">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${priorityConfig.color}`} />
          <span className="font-semibold text-gray-900">
            Status do Paciente
          </span>
        </div>
        <span className="text-sm text-gray-600">
          {priorityConfig.icon} {priorityConfig.text}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Total de consultas:</span>
          <div className="font-semibold text-lg text-blue-900">
            {totalAttendances}
          </div>
        </div>
        <div>
          <span className="text-gray-600">Semanas de tratamento:</span>
          <div className="font-semibold text-lg text-blue-900">
            {weeksInTreatment}
          </div>
        </div>
      </div>

      {nextAppointment && (
        <div className="mt-3 pt-3 border-t border-blue-200">
          <span className="text-sm text-gray-600">Próximo atendimento:</span>
          <div className="font-semibold text-blue-900">{nextAppointment}</div>
        </div>
      )}
    </div>
  );
};

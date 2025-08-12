import { IAttendanceProgression, IAttendanceType } from "@/types/globals";

export const getStatusStyles = (status: IAttendanceProgression) => {
  // Default gray borders for all status types
  const statusStyles = {
    scheduled:
      "shadow-[0_2px_6px_0_rgba(107,114,128,0.5)] border-l-4 border-l-gray-400",
    checkedIn:
      "shadow-[0_2px_6px_0_rgba(107,114,128,0.5)] border-l-4 border-l-gray-400",
    onGoing:
      "shadow-[0_2px_6px_0_rgba(107,114,128,0.5)] border-l-4 border-l-gray-400",
    completed:
      "shadow-[0_2px_6px_0_rgba(107,114,128,0.5)] border-l-4 border-l-gray-400",
  };
  return (
    statusStyles[status] ||
    "shadow-[0_2px_6px_0_rgba(107,114,128,0.5)] border-l-4 border-l-gray-400"
  );
};

export const getTypeBasedStyles = (attendanceType: IAttendanceType) => {
  const typeStyles = {
    rod: "shadow-[0_2px_6px_0_rgba(59,130,246,0.5)] border-l-4 border-l-blue-400",
    lightBath: "shadow-[0_2px_6px_0_rgba(251,191,36,0.5)] border-l-4 border-l-yellow-400",
    spiritual: "shadow-[0_2px_6px_0_rgba(107,114,128,0.5)] border-l-4 border-l-gray-400",
  };
  return typeStyles[attendanceType] || typeStyles.spiritual;
};

export const getTypeIndicatorConfig = (attendanceType: IAttendanceType) => {
  const configs = {
    lightBath: {
      className: "text-yellow-600",
      label: "Banho de Luz",
    },
    rod: {
      className: "text-blue-600", 
      label: "Bastão",
    },
    spiritual: {
      className: "text-gray-600",
      label: "Espiritual",
    },
  };
  
  return configs[attendanceType] || configs.spiritual;
};

export const shouldShowTypeIndicator = (attendanceType: IAttendanceType) => {
  return attendanceType !== "spiritual";
};

export const getStatusColor = (status: IAttendanceProgression) => {
  switch (status) {
    case "scheduled":
      return "text-blue-600";
    case "checkedIn":
      return "text-red-600";
    case "onGoing":
      return "text-yellow-600";
    case "completed":
      return "text-green-600";
    default:
      return "text-gray-600";
  }
};

export const getStatusLabel = (status: IAttendanceProgression) => {
  const labels = {
    scheduled: "Agendados",
    checkedIn: "Sala de Espera",
    onGoing: "Em Atendimento",
    completed: "Finalizados",
  };
  return labels[status] || status;
};

export const getPriorityLabel = (priority: string) => {
  const priorityLabels = {
    "1": "Emergência",
    "2": "Intermediário", 
    "3": "Normal",
  };
  return priorityLabels[priority as keyof typeof priorityLabels] || priority;
};

export const getTooltipContent = (patientName: string, priority: string) => {
  const priorityLabel = getPriorityLabel(priority);
  return `${patientName} - Prioridade: ${priorityLabel}`;
};

import React from "react";

interface TreatmentCompletionBadgeProps {
  /** Completion percentage (0-100) */
  completionPercentage: number;
  /** Treatment status */
  status:
    | "scheduled"
    | "active"
    | "in_progress"
    | "completed"
    | "suspended"
    | "cancelled";
  /** Show detailed milestone info */
  showMilestone?: boolean;
  /** Size variant */
  size?: "sm" | "md" | "lg";
}

export const TreatmentCompletionBadge: React.FC<
  TreatmentCompletionBadgeProps
> = ({ completionPercentage, status, showMilestone = false, size = "md" }) => {
  // Get status configuration
  const getStatusConfig = () => {
    switch (status) {
      case "completed":
        return {
          color: "bg-green-100 text-green-800 border-green-200",
          icon: "✅",
          label: "Concluído",
        };
      case "in_progress":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: "▶️",
          label: "Em Andamento",
        };
      case "active":
        return {
          color: "bg-blue-100 text-blue-800 border-blue-200",
          icon: "🔄",
          label: "Ativo",
        };
      case "suspended":
        return {
          color: "bg-orange-100 text-orange-800 border-orange-200",
          icon: "⏸️",
          label: "Suspenso",
        };
      case "cancelled":
        return {
          color: "bg-red-100 text-red-800 border-red-200",
          icon: "❌",
          label: "Cancelado",
        };
      default: // scheduled
        return {
          color: "bg-gray-100 text-gray-800 border-gray-200",
          icon: "📅",
          label: "Agendado",
        };
    }
  };

  // Get milestone based on completion percentage
  const getMilestone = () => {
    if (completionPercentage >= 100) {
      return { emoji: "🏆", text: "Tratamento Finalizado!" };
    }
    if (completionPercentage >= 75) {
      return { emoji: "🎯", text: "Quase Lá!" };
    }
    if (completionPercentage >= 50) {
      return { emoji: "📈", text: "Meio Caminho" };
    }
    if (completionPercentage >= 25) {
      return { emoji: "🔄", text: "Progredindo" };
    }
    if (completionPercentage > 0) {
      return { emoji: "🚀", text: "Iniciado" };
    }
    return { emoji: "📋", text: "Planejado" };
  };

  // Size configurations
  const sizeConfig = {
    sm: {
      padding: "px-2 py-1",
      text: "text-xs",
      gap: "gap-1",
    },
    md: {
      padding: "px-3 py-1.5",
      text: "text-sm",
      gap: "gap-1.5",
    },
    lg: {
      padding: "px-4 py-2",
      text: "text-base",
      gap: "gap-2",
    },
  };

  const statusConfig = getStatusConfig();
  const milestone = getMilestone();
  const config = sizeConfig[size];

  return (
    <div className="flex flex-col items-start gap-2">
      {/* Status Badge */}
      <div
        className={`
        inline-flex items-center ${config.gap} ${config.padding} 
        ${statusConfig.color} border rounded-full 
        font-medium ${config.text}
      `}
      >
        <span>{statusConfig.icon}</span>
        <span>{statusConfig.label}</span>
        {completionPercentage > 0 && (
          <span className="ml-1">({completionPercentage}%)</span>
        )}
      </div>

      {/* Milestone Badge */}
      {showMilestone && completionPercentage > 0 && (
        <div
          className={`
          inline-flex items-center ${config.gap} ${config.padding}
          bg-purple-100 text-purple-800 border border-purple-200 rounded-full
          font-medium ${config.text}
        `}
        >
          <span>{milestone.emoji}</span>
          <span>{milestone.text}</span>
        </div>
      )}
    </div>
  );
};

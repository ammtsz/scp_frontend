import React from "react";

interface TreatmentProgressBarProps {
  /** Number of completed sessions */
  completed: number;
  /** Total number of planned sessions */
  total: number;
  /** Treatment type for appropriate coloring */
  treatmentType?: "light_bath" | "rod" | "spiritual";
  /** Additional session details (optional) */
  sessionDetails?: {
    upcoming: number;
    missed?: number;
    cancelled?: number;
  };
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Show detailed breakdown */
  showDetails?: boolean;
}

export const TreatmentProgressBar: React.FC<TreatmentProgressBarProps> = ({
  completed,
  total,
  treatmentType = "spiritual",
  sessionDetails,
  size = "md",
  showDetails = false,
}) => {
  // Ensure non-negative values
  const safeCompleted = Math.max(0, completed);
  const safeTotal = Math.max(0, total);

  // Calculate progress percentage
  const progressPercentage =
    safeTotal > 0 ? Math.round((safeCompleted / safeTotal) * 100) : 0;

  // Determine colors based on treatment type
  const getColors = () => {
    switch (treatmentType) {
      case "light_bath":
        return {
          bg: "bg-yellow-100",
          fill: "bg-yellow-500",
          text: "text-yellow-700",
          border: "border-yellow-200",
        };
      case "rod":
        return {
          bg: "bg-purple-100",
          fill: "bg-purple-500",
          text: "text-purple-700",
          border: "border-purple-200",
        };
      default: // spiritual
        return {
          bg: "bg-blue-100",
          fill: "bg-blue-500",
          text: "text-blue-700",
          border: "border-blue-200",
        };
    }
  };

  const colors = getColors();

  // Size configurations
  const sizeConfig = {
    sm: {
      height: "h-2",
      text: "text-xs",
      padding: "px-2 py-1",
    },
    md: {
      height: "h-3",
      text: "text-sm",
      padding: "px-3 py-2",
    },
    lg: {
      height: "h-4",
      text: "text-base",
      padding: "px-4 py-3",
    },
  };

  const config = sizeConfig[size];

  // Status text based on progress
  const getStatusText = () => {
    if (safeCompleted === safeTotal && safeTotal > 0) {
      return "Tratamento Concluído";
    }
    if (safeCompleted === 0) {
      return "Tratamento Iniciado";
    }
    return `Sessão ${safeCompleted} de ${safeTotal}`;
  };

  // Status emoji based on progress
  const getStatusEmoji = () => {
    if (completed === total && total > 0) {
      return "✅";
    }
    if (progressPercentage >= 75) {
      return "🎯";
    }
    if (progressPercentage >= 50) {
      return "📈";
    }
    if (progressPercentage >= 25) {
      return "🔄";
    }
    return "🚀";
  };

  return (
    <div
      className={`${colors.bg} ${colors.border} border rounded-lg ${config.padding}`}
    >
      {/* Header with status */}
      <div className="flex items-center justify-between mb-2">
        <div
          className={`font-medium ${colors.text} ${config.text} flex items-center gap-1`}
        >
          <span>{getStatusEmoji()}</span>
          <span>{getStatusText()}</span>
        </div>
        <div className={`${colors.text} ${config.text} font-semibold`}>
          {progressPercentage}%
        </div>
      </div>

      {/* Progress bar */}
      <div className={`w-full ${colors.bg} rounded-full ${config.height} mb-2`}>
        <div
          className={`${colors.fill} ${config.height} rounded-full transition-all duration-300 ease-in-out`}
          style={{ width: `${progressPercentage}%` }}
        />
      </div>

      {/* Session details */}
      {showDetails && sessionDetails && (
        <div className="flex flex-wrap gap-2 mt-2">
          {sessionDetails.upcoming > 0 && (
            <div
              className={`${config.text} text-gray-600 flex items-center gap-1`}
            >
              <span>📅</span>
              <span>{sessionDetails.upcoming} agendadas</span>
            </div>
          )}
          {sessionDetails.missed && sessionDetails.missed > 0 && (
            <div
              className={`${config.text} text-orange-600 flex items-center gap-1`}
            >
              <span>⚠️</span>
              <span>{sessionDetails.missed} perdidas</span>
            </div>
          )}
          {sessionDetails.cancelled && sessionDetails.cancelled > 0 && (
            <div
              className={`${config.text} text-red-600 flex items-center gap-1`}
            >
              <span>❌</span>
              <span>{sessionDetails.cancelled} canceladas</span>
            </div>
          )}
        </div>
      )}

      {/* Milestone indicators */}
      {safeTotal >= 5 && (
        <div className="flex justify-between mt-2 text-xs text-gray-500">
          <span
            className={
              safeCompleted >= Math.ceil(safeTotal * 0.25)
                ? colors.text
                : "text-gray-400"
            }
          >
            25%
          </span>
          <span
            className={
              safeCompleted >= Math.ceil(safeTotal * 0.5)
                ? colors.text
                : "text-gray-400"
            }
          >
            50%
          </span>
          <span
            className={
              safeCompleted >= Math.ceil(safeTotal * 0.75)
                ? colors.text
                : "text-gray-400"
            }
          >
            75%
          </span>
          <span
            className={
              safeCompleted >= safeTotal ? colors.text : "text-gray-400"
            }
          >
            Concluído
          </span>
        </div>
      )}
    </div>
  );
};

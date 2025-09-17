import React from "react";

interface TreatmentProgressBadgeProps {
  /** Current session number (1-based) */
  currentSession: number;
  /** Total number of planned sessions */
  totalSessions: number;
  /** Treatment type for color coding */
  treatmentType: "light_bath" | "rod" | "spiritual";
  /** Size variant */
  size?: "sm" | "md" | "lg";
  /** Show percentage instead of session count */
  showPercentage?: boolean;
  /** Show progress bar */
  showProgressBar?: boolean;
  /** Optional completion status */
  isCompleted?: boolean;
  /** Compact mode - minimal display */
  compact?: boolean;
  /** Additional CSS classes */
  className?: string;
}

/**
 * TreatmentProgressBadge - Displays treatment session progress with visual indicators
 * Shows "Session X of Y" or percentage completion with optional progress bar
 */
const TreatmentProgressBadge: React.FC<TreatmentProgressBadgeProps> = ({
  currentSession,
  totalSessions,
  treatmentType,
  size = "md",
  showPercentage = false,
  showProgressBar = false,
  isCompleted = false,
  compact = false,
  className = "",
}) => {
  // Calculate progress percentage
  const progressPercentage = Math.round((currentSession / totalSessions) * 100);

  // Ensure values are within bounds
  const safeCurrentSession = Math.max(
    0,
    Math.min(currentSession, totalSessions)
  );
  const safeProgressPercentage = Math.max(0, Math.min(progressPercentage, 100));

  // Color schemes for different treatment types
  const getColorScheme = () => {
    switch (treatmentType) {
      case "light_bath":
        return {
          bg: "bg-yellow-50",
          border: "border-yellow-200",
          text: "text-yellow-800",
          progressBg: "bg-yellow-100",
          progressFill: "bg-yellow-500",
          name: "Banho de Luz",
        };
      case "rod":
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          text: "text-blue-800",
          progressBg: "bg-blue-100",
          progressFill: "bg-blue-500",
          name: "Bastão",
        };
      case "spiritual":
        return {
          bg: "bg-gray-50",
          border: "border-gray-200",
          text: "text-gray-800",
          progressBg: "bg-gray-100",
          progressFill: "bg-gray-500",
          name: "Espiritual",
        };
      default:
        return {
          bg: "bg-gray-50",
          border: "border-gray-200",
          text: "text-gray-800",
          progressBg: "bg-gray-100",
          progressFill: "bg-gray-500",
          name: "Tratamento",
        };
    }
  };

  // Size variants
  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return {
          container: "px-2 py-1 text-xs",
          progressBar: "h-1",
          icon: "text-xs",
          gap: "gap-1",
        };
      case "lg":
        return {
          container: "px-4 py-3 text-base",
          progressBar: "h-3",
          icon: "text-lg",
          gap: "gap-3",
        };
      default: // md
        return {
          container: "px-3 py-2 text-sm",
          progressBar: "h-2",
          icon: "text-sm",
          gap: "gap-2",
        };
    }
  };

  const colors = getColorScheme();
  const sizes = getSizeClasses();

  // Completion indicator
  const getStatusIcon = () => {
    if (isCompleted) return "✅";
    if (safeCurrentSession === 0) return "⏳";
    if (safeCurrentSession === totalSessions) return "🎯";
    return "🔄";
  };

  // Display text based on preference
  const getDisplayText = () => {
    if (showPercentage) {
      return `${safeProgressPercentage}%`;
    }
    return `${safeCurrentSession}/${totalSessions}`;
  };

  if (compact) {
    return (
      <div
        className={`inline-flex items-center ${sizes.gap} ${colors.bg} ${colors.border} ${colors.text} border rounded-full ${sizes.container} font-medium`}
      >
        <span>{getDisplayText()}</span>
        {isCompleted && <span className="text-xs">✅</span>}
      </div>
    );
  }

  return (
    <div
      className={`${colors.bg} ${colors.border} ${colors.text} border rounded-lg ${sizes.container} space-y-1 ${className}`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between ${sizes.gap}`}>
        <div className="flex items-center gap-1">
          <span className="font-medium">{colors.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="font-bold">{getDisplayText()}</span>
          <span className="text-xs">{getStatusIcon()}</span>
        </div>
      </div>

      {/* Progress Bar */}
      {showProgressBar && (
        <div className="space-y-1">
          <div
            className={`${colors.progressBg} rounded-full ${sizes.progressBar} overflow-hidden`}
          >
            <div
              className={`${colors.progressFill} ${sizes.progressBar} transition-all duration-300 ease-out`}
              style={{ width: `${safeProgressPercentage}%` }}
            />
          </div>
          {!showPercentage && (
            <div className="flex justify-between text-xs opacity-75">
              <span>Sessão {safeCurrentSession}</span>
              <span>{safeProgressPercentage}% completo</span>
            </div>
          )}
        </div>
      )}

      {/* Additional status info */}
      {size === "lg" && (
        <div className="text-xs opacity-75 mt-1">
          {isCompleted
            ? "Tratamento concluído"
            : safeCurrentSession === 0
            ? "Aguardando início"
            : safeCurrentSession === totalSessions
            ? "Pronto para finalização"
            : `${totalSessions - safeCurrentSession} sessões restantes`}
        </div>
      )}
    </div>
  );
};

export default TreatmentProgressBadge;

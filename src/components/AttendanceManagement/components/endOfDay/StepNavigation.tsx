import React from "react";

interface StepNavigationProps {
  currentStep: "incomplete" | "absences" | "confirm";
  incompleteAttendancesCount: number;
  scheduledAbsencesCount: number;
}

const StepNavigation: React.FC<StepNavigationProps> = ({
  currentStep,
  incompleteAttendancesCount,
  scheduledAbsencesCount,
}) => {
  const getStepStatus = (step: "incomplete" | "absences" | "confirm") => {
    switch (step) {
      case "incomplete":
        if (incompleteAttendancesCount === 0) return "completed";
        return currentStep === step ? "current" : "pending";
      case "absences":
        if (currentStep === "confirm") return "completed";
        if (scheduledAbsencesCount === 0) return "completed";
        return currentStep === step ? "current" : "pending";
      case "confirm":
        return currentStep === "confirm" ? "current" : "pending";
      default:
        return "pending";
    }
  };

  const getStepClass = (status: string) => {
    switch (status) {
      case "current":
        return "bg-blue-500 text-white";
      case "completed":
        return "bg-green-500 text-white";
      default:
        return "bg-gray-300 text-gray-600";
    }
  };

  return (
    <div className="flex items-center mb-6">
      <div className="flex-1">
        <div className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${getStepClass(
              getStepStatus("incomplete")
            )}`}
          >
            1
          </div>
          <div className="ml-3 text-sm font-medium text-gray-700">
            Atendimentos
          </div>
        </div>
      </div>
      <div className="flex-1">
        <div className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${getStepClass(
              getStepStatus("absences")
            )}`}
          >
            2
          </div>
          <div className="ml-3 text-sm font-medium text-gray-700">Faltas</div>
        </div>
      </div>
      <div className="flex-1">
        <div className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${getStepClass(
              getStepStatus("confirm")
            )}`}
          >
            3
          </div>
          <div className="ml-3 text-sm font-medium text-gray-700">
            Confirmação
          </div>
        </div>
      </div>
    </div>
  );
};

export default StepNavigation;

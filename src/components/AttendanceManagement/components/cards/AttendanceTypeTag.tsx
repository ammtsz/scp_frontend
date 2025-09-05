import React from "react";
import { IAttendanceType } from "@/types/globals";

interface AttendanceTypeTagProps {
  type: IAttendanceType;
  size?: "sm" | "md";
}

const AttendanceTypeTag: React.FC<AttendanceTypeTagProps> = ({
  type,
  size = "sm",
}) => {
  const getTypeConfig = (attendanceType: IAttendanceType) => {
    switch (attendanceType) {
      case "rod":
        return {
          label: "Bastão",
          bgColor: "bg-blue-100",
          textColor: "text-blue-700",
          borderColor: "border-blue-200",
        };
      case "lightBath":
        return {
          label: "Banho de Luz",
          bgColor: "bg-yellow-100",
          textColor: "text-yellow-700",
          borderColor: "border-yellow-200",
        };
      case "spiritual":
        return {
          label: "Consulta Espiritual",
          bgColor: "bg-gray-100",
          textColor: "text-gray-700",
          borderColor: "border-gray-200",
        };
      default:
        return {
          label: "Desconhecido",
          bgColor: "bg-gray-100",
          textColor: "text-gray-500",
          borderColor: "border-gray-200",
        };
    }
  };

  const config = getTypeConfig(type);
  const sizeClasses =
    size === "md" ? "px-3 py-1 text-sm" : "px-2 py-0.5 text-xs";

  return (
    <span
      className={`
        inline-flex items-center rounded-full border font-medium
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        ${sizeClasses}
      `}
    >
      {config.label}
    </span>
  );
};

export default AttendanceTypeTag;

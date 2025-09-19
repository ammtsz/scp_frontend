import React from "react";
import type { TreatmentInfo } from "@/hooks/useTreatmentIndicators";
import {
  getTreatmentBorderClass,
  getTreatmentIndicatorText,
} from "../../styles/cardStyles";

interface TreatmentIndicatorProps {
  treatmentInfo: TreatmentInfo;
  onInfoClick: () => void;
}

// TODO: review component
const TreatmentIndicator: React.FC<TreatmentIndicatorProps> = ({
  treatmentInfo,
  onInfoClick,
}) => {
  if (treatmentInfo.treatmentType === "none") {
    return null;
  }

  const borderClass = getTreatmentBorderClass(treatmentInfo.treatmentType);
  const indicatorText = getTreatmentIndicatorText(treatmentInfo);

  return (
    <div
      className={`absolute top-1 left-1 rounded px-2 py-1 text-xs flex items-center gap-1 ${borderClass} bg-white shadow-sm`}
    >
      <span className="font-medium">{indicatorText}</span>
      <button
        onClick={onInfoClick}
        className="text-blue-600 hover:text-blue-800 ml-1"
        title="Ver detalhes do tratamento"
      >
        ℹ️
      </button>
    </div>
  );
};

export default TreatmentIndicator;

import React from "react";
import BodyLocationSelector from "@/components/AttendanceManagement/components/Forms/PostAttendanceForms/Tabs/TreatmentRecommendationsTab/BodyLocationSelector";
import BodyLocationTreatmentCard from "@/components/AttendanceManagement/components/Forms/PostAttendanceForms/Tabs/TreatmentRecommendationsTab/BodyLocationTreatmentCard";
import type {
  LightBathLocationTreatment,
  RodLocationTreatment,
} from "@/components/AttendanceManagement/components/Forms/PostAttendanceForms/types";

interface TreatmentLocationFormProps {
  treatmentType: "lightBath" | "rod";
  treatments: (LightBathLocationTreatment | RodLocationTreatment)[];
  onChange: (
    treatments: (LightBathLocationTreatment | RodLocationTreatment)[]
  ) => void;
  disabled?: boolean;
}

const TreatmentLocationForm: React.FC<TreatmentLocationFormProps> = ({
  treatmentType,
  treatments,
  onChange,
  disabled = false,
}) => {
  const handleLocationAdd = (locations: string[]) => {
    if (locations.length === 0) return;

    // Default start date: 1 week from today in YYYY-MM-DD format
    const defaultStartDate = new Date();
    defaultStartDate.setDate(defaultStartDate.getDate() + 7);
    const defaultStartDateString = defaultStartDate.toISOString().split("T")[0];

    let newTreatment: LightBathLocationTreatment | RodLocationTreatment;

    if (treatmentType === "lightBath") {
      newTreatment = {
        locations,
        color: "",
        duration: 1,
        quantity: 1,
        startDate: defaultStartDateString,
      } as LightBathLocationTreatment;
    } else {
      newTreatment = {
        locations,
        quantity: 1,
        startDate: defaultStartDateString,
      } as RodLocationTreatment;
    }

    onChange([...treatments, newTreatment]);
  };

  const handleTreatmentChange = (
    index: number,
    treatment: LightBathLocationTreatment | RodLocationTreatment
  ) => {
    const updatedTreatments = [...treatments];
    updatedTreatments[index] = treatment;
    onChange(updatedTreatments);
  };

  const handleTreatmentRemove = (index: number) => {
    const updatedTreatments = treatments.filter((_, i) => i !== index);
    onChange(updatedTreatments);
  };

  const treatmentTypeLabel =
    treatmentType === "lightBath" ? "Banho de Luz" : "Bastão";

  return (
    <div className="space-y-4">
      {/* Information Card */}
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
        <h4 className="text-sm font-medium text-blue-900 mb-2">
          ℹ️ Configuração de {treatmentTypeLabel}
        </h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            • Selecione um ou mais locais do corpo para aplicar o{" "}
            {treatmentTypeLabel.toLowerCase()}
          </li>
          <li>• Defina os parâmetros específicos para cada grupo de locais</li>
          <li>• Cada configuração criará sessões de tratamento individuais</li>
        </ul>
      </div>

      {/* Existing Treatments */}
      {treatments &&
        treatments.map((treatment, index) => (
          <BodyLocationTreatmentCard
            key={index}
            locations={treatment.locations}
            treatmentType={treatmentType}
            treatment={treatment}
            onChange={(updatedTreatment) =>
              handleTreatmentChange(index, updatedTreatment)
            }
            onRemove={() => handleTreatmentRemove(index)}
            disabled={disabled}
          />
        ))}

      {/* Add New Treatment Location */}
      <BodyLocationSelector
        onLocationsSubmit={handleLocationAdd}
        treatmentTypeLabel={treatmentTypeLabel}
        disabled={disabled}
      />
    </div>
  );
};

export default TreatmentLocationForm;

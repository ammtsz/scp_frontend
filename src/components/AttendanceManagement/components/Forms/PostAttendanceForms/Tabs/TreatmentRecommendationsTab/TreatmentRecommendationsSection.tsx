import React, { useCallback } from "react";
import BodyLocationSelector from "./BodyLocationSelector";
import LocationTreatmentCard from "./BodyLocationTreatmentCard";
import Switch from "@/components/common/Switch";
import type {
  TreatmentRecommendation,
  LightBathLocationTreatment,
  RodLocationTreatment,
} from "../../types";

interface TreatmentRecommendationsSectionProps {
  recommendations: TreatmentRecommendation;
  onChange: (recommendations: TreatmentRecommendation) => void;
}

const TreatmentRecommendationsSection: React.FC<
  TreatmentRecommendationsSectionProps
> = ({ recommendations, onChange }) => {
  // Removed handleReturnWeeksChange - using default 1 week

  // Light Bath Handlers
  const handleLightBathToggle = useCallback(
    (enabled: boolean) => {
      if (enabled) {
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split("T")[0];
        onChange({
          ...recommendations,
          lightBath: {
            startDate: today,
            treatments: [],
          },
        });
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { lightBath, ...rest } = recommendations;
        onChange(rest);
      }
    },
    [recommendations, onChange]
  );

  const handleLightBathLocationAdd = useCallback(
    (locations: string[]) => {
      if (!recommendations.lightBath || locations.length === 0) return;

      // Default start date: 1 week from today in YYYY-MM-DD format
      const defaultStartDate = new Date();
      defaultStartDate.setDate(defaultStartDate.getDate() + 7);
      const defaultStartDateString = defaultStartDate
        .toISOString()
        .split("T")[0];

      const newTreatment: LightBathLocationTreatment = {
        locations,
        color: "",
        duration: 1,
        quantity: 1,
        startDate: defaultStartDateString,
      };

      onChange({
        ...recommendations,
        lightBath: {
          ...recommendations.lightBath,
          treatments: [...recommendations.lightBath.treatments, newTreatment],
        },
      });
    },
    [recommendations, onChange]
  );

  const handleLightBathTreatmentChange = useCallback(
    (index: number, treatment: LightBathLocationTreatment) => {
      if (!recommendations.lightBath) return;

      const updatedTreatments = [...recommendations.lightBath.treatments];
      updatedTreatments[index] = treatment;

      onChange({
        ...recommendations,
        lightBath: {
          ...recommendations.lightBath,
          treatments: updatedTreatments,
        },
      });
    },
    [recommendations, onChange]
  );

  const handleLightBathTreatmentRemove = useCallback(
    (index: number) => {
      if (!recommendations.lightBath) return;

      const updatedTreatments = recommendations.lightBath.treatments.filter(
        (_, i) => i !== index
      );

      onChange({
        ...recommendations,
        lightBath: {
          ...recommendations.lightBath,
          treatments: updatedTreatments,
        },
      });
    },
    [recommendations, onChange]
  );

  // Rod Handlers
  const handleRodToggle = useCallback(
    (enabled: boolean) => {
      if (enabled) {
        // Get today's date in YYYY-MM-DD format
        const today = new Date().toISOString().split("T")[0];
        onChange({
          ...recommendations,
          rod: {
            startDate: today,
            treatments: [],
          },
        });
      } else {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { rod, ...rest } = recommendations;
        onChange(rest);
      }
    },
    [recommendations, onChange]
  );

  const handleRodLocationAdd = useCallback(
    (locations: string[]) => {
      if (!recommendations.rod || locations.length === 0) return;

      // Default start date: 1 week from today in YYYY-MM-DD format
      const defaultStartDate = new Date();
      defaultStartDate.setDate(defaultStartDate.getDate() + 7);
      const defaultStartDateString = defaultStartDate
        .toISOString()
        .split("T")[0];

      const newTreatment: RodLocationTreatment = {
        locations,
        quantity: 1,
        startDate: defaultStartDateString,
      };

      onChange({
        ...recommendations,
        rod: {
          ...recommendations.rod,
          treatments: [...recommendations.rod.treatments, newTreatment],
        },
      });
    },
    [recommendations, onChange]
  );

  const handleRodTreatmentChange = useCallback(
    (index: number, treatment: RodLocationTreatment) => {
      if (!recommendations.rod) return;

      const updatedTreatments = [...recommendations.rod.treatments];
      updatedTreatments[index] = treatment;

      onChange({
        ...recommendations,
        rod: {
          ...recommendations.rod,
          treatments: updatedTreatments,
        },
      });
    },
    [recommendations, onChange]
  );

  const handleRodTreatmentRemove = useCallback(
    (index: number) => {
      if (!recommendations.rod) return;

      const updatedTreatments = recommendations.rod.treatments.filter(
        (_, i) => i !== index
      );

      onChange({
        ...recommendations,
        rod: {
          ...recommendations.rod,
          treatments: updatedTreatments,
        },
      });
    },
    [recommendations, onChange]
  );

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-800">
        Recomendações de Tratamento
      </h3>

      {/* Light Bath Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="lightBath"
            checked={!!recommendations.lightBath}
            onChange={handleLightBathToggle}
            label="Banho de Luz"
            size="sm"
          />
        </div>

        {recommendations.lightBath && (
          <div className="ml-6 space-y-4">
            {/* Existing Light Bath Treatments */}
            {recommendations.lightBath.treatments.map((treatment, index) => (
              <LocationTreatmentCard
                key={index}
                locations={treatment.locations}
                treatmentType="lightBath"
                treatment={treatment}
                onChange={(updatedTreatment) =>
                  handleLightBathTreatmentChange(
                    index,
                    updatedTreatment as LightBathLocationTreatment
                  )
                }
                onRemove={() => handleLightBathTreatmentRemove(index)}
              />
            ))}

            {/* Add New Light Bath Location */}
            <BodyLocationSelector
              onLocationsSubmit={handleLightBathLocationAdd}
              treatmentTypeLabel="Banho de Luz"
            />
          </div>
        )}
      </div>

      {/* Rod Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="rod"
            checked={!!recommendations.rod}
            onChange={handleRodToggle}
            label="Bastão"
            size="sm"
          />
        </div>

        {recommendations.rod && (
          <div className="ml-6 space-y-4">
            {/* Existing Rod Treatments */}
            {recommendations.rod.treatments.map((treatment, index) => (
              <LocationTreatmentCard
                key={index}
                locations={treatment.locations}
                treatmentType="rod"
                treatment={treatment}
                onChange={(updatedTreatment) =>
                  handleRodTreatmentChange(
                    index,
                    updatedTreatment as RodLocationTreatment
                  )
                }
                onRemove={() => handleRodTreatmentRemove(index)}
              />
            ))}

            {/* Add New Rod Location */}
            <BodyLocationSelector
              onLocationsSubmit={handleRodLocationAdd}
              treatmentTypeLabel="Bastão"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default TreatmentRecommendationsSection;

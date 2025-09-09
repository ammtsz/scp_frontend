import React, { useCallback } from "react";
import BodyLocationSelector from "./BodyLocationSelector";
import LocationTreatmentCard from "./LocationTreatmentCard";
import type {
  TreatmentRecommendation,
  LightBathLocationTreatment,
  RodLocationTreatment,
} from "./types";

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
        onChange({
          ...recommendations,
          lightBath: {
            startDate: new Date(),
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
    (location: string) => {
      if (!recommendations.lightBath) return;

      // Default start date: 1 week from today
      const defaultStartDate = new Date();
      defaultStartDate.setDate(defaultStartDate.getDate() + 7);

      const newTreatment: LightBathLocationTreatment = {
        location,
        color: "",
        duration: 1,
        quantity: 1,
        startDate: defaultStartDate,
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
        onChange({
          ...recommendations,
          rod: {
            startDate: new Date(),
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
    (location: string) => {
      if (!recommendations.rod) return;

      // Default start date: 1 week from today
      const defaultStartDate = new Date();
      defaultStartDate.setDate(defaultStartDate.getDate() + 7);

      const newTreatment: RodLocationTreatment = {
        location,
        quantity: 1,
        startDate: defaultStartDate,
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
      <h3 className="text-lg font-medium text-gray-800 border-b pb-2">
        Recomendações de Tratamento
      </h3>

      {/* Light Bath Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="lightBath"
            checked={!!recommendations.lightBath}
            onChange={(e) => handleLightBathToggle(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            htmlFor="lightBath"
            className="text-sm font-medium text-gray-700"
          >
            Banho de Luz
          </label>
        </div>

        {recommendations.lightBath && (
          <div className="ml-6 space-y-4">
            {/* Existing Light Bath Treatments */}
            {recommendations.lightBath.treatments.map((treatment, index) => (
              <LocationTreatmentCard
                key={index}
                location={treatment.location}
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
              onLocationSelect={handleLightBathLocationAdd}
            />
          </div>
        )}
      </div>

      {/* Rod Section */}
      <div className="space-y-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="rod"
            checked={!!recommendations.rod}
            onChange={(e) => handleRodToggle(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="rod" className="text-sm font-medium text-gray-700">
            Tratamento com Bastão
          </label>
        </div>

        {recommendations.rod && (
          <div className="ml-6 space-y-4">
            {/* Existing Rod Treatments */}
            {recommendations.rod.treatments.map((treatment, index) => (
              <LocationTreatmentCard
                key={index}
                location={treatment.location}
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
            <BodyLocationSelector onLocationSelect={handleRodLocationAdd} />
          </div>
        )}
      </div>
    </div>
  );
};

export default TreatmentRecommendationsSection;

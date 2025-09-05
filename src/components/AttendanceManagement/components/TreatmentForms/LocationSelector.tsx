import React, { useState, useCallback } from "react";
import { LOCATION_GROUPS, isValidLocation } from "@/utils/treatmentLocations";

interface LocationSelectorProps {
  selectedLocations: string[];
  customLocation: string;
  onLocationChange: (locations: string[]) => void;
  onCustomLocationChange: (location: string) => void;
  disabled?: boolean;
  maxSelections?: number;
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  selectedLocations,
  customLocation,
  onLocationChange,
  onCustomLocationChange,
  disabled = false,
  maxSelections = 5,
}) => {
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleLocationToggle = useCallback(
    (location: string) => {
      if (disabled) return;

      const isSelected = selectedLocations.includes(location);

      if (isSelected) {
        // Remove location
        onLocationChange(selectedLocations.filter((loc) => loc !== location));
      } else {
        // Add location if under max limit
        if (selectedLocations.length < maxSelections) {
          onLocationChange([...selectedLocations, location]);
        }
      }
    },
    [selectedLocations, onLocationChange, disabled, maxSelections]
  );

  const handleCustomLocationSubmit = useCallback(() => {
    if (!customLocation.trim() || disabled) return;

    const trimmedLocation = customLocation.trim();

    // Check if it's not already in predefined locations
    if (isValidLocation(trimmedLocation)) {
      // It's a predefined location, add it normally
      if (
        !selectedLocations.includes(trimmedLocation) &&
        selectedLocations.length < maxSelections
      ) {
        onLocationChange([...selectedLocations, trimmedLocation]);
      }
    } else {
      // It's a custom location, add it if not already present
      if (
        !selectedLocations.includes(trimmedLocation) &&
        selectedLocations.length < maxSelections
      ) {
        onLocationChange([...selectedLocations, trimmedLocation]);
      }
    }

    // Clear custom input
    onCustomLocationChange("");
    setShowCustomInput(false);
  }, [
    customLocation,
    selectedLocations,
    onLocationChange,
    onCustomLocationChange,
    disabled,
    maxSelections,
  ]);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCustomLocationSubmit();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium text-gray-700">
          Locais do Tratamento
        </label>
        <span className="text-xs text-gray-500">
          {selectedLocations.length}/{maxSelections} selecionados
        </span>
      </div>

      {/* Selected locations display */}
      {selectedLocations.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {selectedLocations.map((location) => (
            <span
              key={location}
              className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
            >
              {location}
              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleLocationToggle(location)}
                  className="ml-1 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              )}
            </span>
          ))}
        </div>
      )}

      {/* Predefined locations by group */}
      {Object.entries(LOCATION_GROUPS).map(([groupName, locations]) => (
        <div key={groupName} className="border border-gray-200 rounded-lg p-3">
          <h4 className="text-sm font-medium text-gray-800 mb-2">
            {groupName}
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {locations.map((location) => {
              const isSelected = selectedLocations.includes(location);
              const isAtMax =
                selectedLocations.length >= maxSelections && !isSelected;

              return (
                <button
                  key={location}
                  type="button"
                  onClick={() => handleLocationToggle(location)}
                  disabled={disabled || isAtMax}
                  className={`
                    text-left px-3 py-2 text-sm rounded-md border transition-colors
                    ${
                      isSelected
                        ? "bg-blue-50 border-blue-300 text-blue-800"
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    }
                    ${
                      disabled || isAtMax
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }
                  `}
                >
                  {location}
                </button>
              );
            })}
          </div>
        </div>
      ))}

      {/* Custom location input */}
      <div className="border border-gray-200 rounded-lg p-3">
        <div className="flex justify-between items-center mb-2">
          <h4 className="text-sm font-medium text-gray-800">
            Local Personalizado
          </h4>
          {!showCustomInput && (
            <button
              type="button"
              onClick={() => setShowCustomInput(true)}
              disabled={disabled || selectedLocations.length >= maxSelections}
              className="text-sm text-blue-600 hover:text-blue-800 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + Adicionar
            </button>
          )}
        </div>

        {showCustomInput && (
          <div className="flex gap-2">
            <input
              type="text"
              value={customLocation}
              onChange={(e) => onCustomLocationChange(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={disabled}
              placeholder="Digite o local do tratamento..."
              className="flex-1 input text-sm"
              maxLength={50}
            />
            <button
              type="button"
              onClick={handleCustomLocationSubmit}
              disabled={!customLocation.trim() || disabled}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Adicionar
            </button>
            <button
              type="button"
              onClick={() => {
                setShowCustomInput(false);
                onCustomLocationChange("");
              }}
              disabled={disabled}
              className="px-3 py-1 text-sm bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
              Cancelar
            </button>
          </div>
        )}
      </div>

      {/* Help text */}
      <p className="text-xs text-gray-500">
        Selecione até {maxSelections} locais onde o tratamento foi aplicado.
        Você pode escolher entre os locais predefinidos ou adicionar um local
        personalizado.
      </p>
    </div>
  );
};

export default LocationSelector;

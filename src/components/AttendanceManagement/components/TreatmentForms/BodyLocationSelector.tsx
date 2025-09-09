import React, { useState } from "react";

export interface BodyLocationSelectorProps {
  onLocationSelect: (location: string) => void;
  disabled?: boolean;
}

// Predefined body location groups
const BODY_LOCATION_GROUPS = {
  "Região Central": [
    "cabeça",
    "testa",
    "olhos",
    "nariz",
    "ouvidos",
    "boca",
    "garganta",
    "peito",
    "coração",
    "pulmões",
    "estômago",
    "fígado",
    "intestinos",
    "rins",
    "bexiga",
  ],
  "Coluna e Pescoço": [
    "pescoço",
    "coluna cervical",
    "coluna torácica",
    "coluna lombar",
    "coluna sacral",
    "cóccix",
  ],
  "Membros Superiores": [
    "ombro direito",
    "ombro esquerdo",
    "braço direito",
    "braço esquerdo",
    "cotovelo direito",
    "cotovelo esquerdo",
    "antebraço direito",
    "antebraço esquerdo",
    "punho direito",
    "punho esquerdo",
    "mão direita",
    "mão esquerda",
  ],
  "Membros Inferiores": [
    "quadril direito",
    "quadril esquerdo",
    "coxa direita",
    "coxa esquerda",
    "joelho direito",
    "joelho esquerdo",
    "perna direita",
    "perna esquerda",
    "tornozelo direito",
    "tornozelo esquerdo",
    "pé direito",
    "pé esquerdo",
  ],
};

const BodyLocationSelector: React.FC<BodyLocationSelectorProps> = ({
  onLocationSelect,
  disabled = false,
}) => {
  const [selectedGroup, setSelectedGroup] = useState<string>("");
  const [selectedLocation, setSelectedLocation] = useState<string>("");
  const [customLocation, setCustomLocation] = useState<string>("");
  const [showCustomInput, setShowCustomInput] = useState(false);

  const handleGroupChange = (group: string) => {
    setSelectedGroup(group);
    setSelectedLocation("");
    setShowCustomInput(group === "Local Personalizado");
  };

  const handleLocationChange = (location: string) => {
    setSelectedLocation(location);
  };

  const handleAddLocation = () => {
    let locationToAdd = "";

    if (showCustomInput) {
      locationToAdd = customLocation.trim();
    } else {
      locationToAdd = selectedLocation;
    }

    if (locationToAdd) {
      onLocationSelect(locationToAdd);
      // Reset form
      setSelectedGroup("");
      setSelectedLocation("");
      setCustomLocation("");
      setShowCustomInput(false);
    }
  };

  const availableLocations =
    selectedGroup && selectedGroup !== "Local Personalizado"
      ? BODY_LOCATION_GROUPS[
          selectedGroup as keyof typeof BODY_LOCATION_GROUPS
        ] || []
      : [];

  const canAdd = showCustomInput
    ? customLocation.trim().length > 0
    : selectedLocation.length > 0;

  return (
    <div className="space-y-4 p-4 border border-gray-200 rounded-md bg-gray-50">
      <h4 className="font-medium text-gray-800">Adicionar Local do Corpo</h4>

      {/* Group Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Região do Corpo
        </label>
        <select
          value={selectedGroup}
          onChange={(e) => handleGroupChange(e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
        >
          <option value="">Selecione uma região...</option>
          {Object.keys(BODY_LOCATION_GROUPS).map((group) => (
            <option key={group} value={group}>
              {group}
            </option>
          ))}
          <option value="Local Personalizado">Local Personalizado</option>
        </select>
      </div>

      {/* Location Selection */}
      {selectedGroup && !showCustomInput && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Local Específico
          </label>
          <select
            value={selectedLocation}
            onChange={(e) => handleLocationChange(e.target.value)}
            disabled={disabled}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          >
            <option value="">Selecione um local...</option>
            {availableLocations.map((location) => (
              <option key={location} value={location}>
                {location}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Custom Location Input */}
      {showCustomInput && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Local Personalizado
          </label>
          <input
            type="text"
            value={customLocation}
            onChange={(e) => setCustomLocation(e.target.value)}
            disabled={disabled}
            placeholder="Digite o local específico..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>
      )}

      {/* Add Button */}
      {selectedGroup && (
        <button
          type="button"
          onClick={handleAddLocation}
          disabled={disabled || !canAdd}
          className="px-3 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Adicionar Local
        </button>
      )}
    </div>
  );
};

export default BodyLocationSelector;

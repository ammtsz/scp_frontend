import React, { useState, useRef, useEffect } from "react";

export interface BodyLocationSelectorProps {
  onLocationsSubmit: (locations: string[]) => void;
  treatmentTypeLabel?: string; // e.g., "Banho de Luz" or "Bastão"
  disabled?: boolean;
}

// Predefined body locations in a flat structure for multiselect
const BODY_LOCATIONS = {
  // Região Central
  cabeça: "Região Central",
  testa: "Região Central",
  olhos: "Região Central",
  nariz: "Região Central",
  ouvidos: "Região Central",
  boca: "Região Central",
  garganta: "Região Central",
  peito: "Região Central",
  coração: "Região Central",
  pulmões: "Região Central",
  estômago: "Região Central",
  fígado: "Região Central",
  intestinos: "Região Central",
  rins: "Região Central",
  bexiga: "Região Central",

  // Coluna e Pescoço
  pescoço: "Coluna e Pescoço",
  "coluna cervical": "Coluna e Pescoço",
  "coluna torácica": "Coluna e Pescoço",
  "coluna lombar": "Coluna e Pescoço",
  "coluna sacral": "Coluna e Pescoço",
  cóccix: "Coluna e Pescoço",

  // Membros Superiores
  "ombro direito": "Membros Superiores",
  "ombro esquerdo": "Membros Superiores",
  "braço direito": "Membros Superiores",
  "braço esquerdo": "Membros Superiores",
  "cotovelo direito": "Membros Superiores",
  "cotovelo esquerdo": "Membros Superiores",
  "antebraço direito": "Membros Superiores",
  "antebraço esquerdo": "Membros Superiores",
  "punho direito": "Membros Superiores",
  "punho esquerdo": "Membros Superiores",
  "mão direita": "Membros Superiores",
  "mão esquerda": "Membros Superiores",

  // Membros Inferiores
  "quadril direito": "Membros Inferiores",
  "quadril esquerdo": "Membros Inferiores",
  "coxa direita": "Membros Inferiores",
  "coxa esquerda": "Membros Inferiores",
  "joelho direito": "Membros Inferiores",
  "joelho esquerdo": "Membros Inferiores",
  "perna direita": "Membros Inferiores",
  "perna esquerda": "Membros Inferiores",
  "tornozelo direito": "Membros Inferiores",
  "tornozelo esquerdo": "Membros Inferiores",
  "pé direito": "Membros Inferiores",
  "pé esquerdo": "Membros Inferiores",
};

export default function BodyLocationSelector({
  onLocationsSubmit,
  treatmentTypeLabel = "tratamento",
  disabled = false,
}: BodyLocationSelectorProps) {
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [isCustomLocationSelected, setIsCustomLocationSelected] =
    useState(false);
  const [customLocation, setCustomLocation] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
        setSearchTerm(""); // Clear search when closing dropdown
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLocationToggle = (location: string) => {
    if (location === "Local Personalizado") {
      setIsCustomLocationSelected(!isCustomLocationSelected);
      if (isCustomLocationSelected) {
        setCustomLocation("");
      }
      return;
    }

    let newLocations: string[];

    if (selectedLocations.includes(location)) {
      // Removing location
      newLocations = selectedLocations.filter((l) => l !== location);
    } else {
      // Adding location
      newLocations = [...selectedLocations, location];
    }

    setSelectedLocations(newLocations);
  };

  const handleCustomLocationChange = (value: string) => {
    setCustomLocation(value);
  };

  const handleSubmit = () => {
    const allSelectedLocations = [...selectedLocations];
    if (isCustomLocationSelected && customLocation.trim()) {
      allSelectedLocations.push(customLocation.trim());
    }

    if (allSelectedLocations.length > 0) {
      onLocationsSubmit(allSelectedLocations);
      // Reset the selector after submitting
      setSelectedLocations([]);
      setIsCustomLocationSelected(false);
      setCustomLocation("");
      setIsDropdownOpen(false);
      setSearchTerm(""); // Clear search on submit
    }
  };

  const getDisplayText = () => {
    const displayItems = [...selectedLocations];
    if (isCustomLocationSelected && customLocation.trim()) {
      displayItems.push(customLocation.trim());
    }

    if (displayItems.length === 0) return "Selecione os locais do corpo";
    if (displayItems.length === 1) return displayItems[0];
    if (displayItems.length <= 3) return displayItems.join(", ");
    return `${displayItems.slice(0, 2).join(", ")} e mais ${
      displayItems.length - 2
    }`;
  };

  // Group locations by region for better organization in the dropdown
  const groupedLocations = Object.entries(BODY_LOCATIONS).reduce(
    (acc, [location, region]) => {
      if (!acc[region]) {
        acc[region] = [];
      }
      acc[region].push(location);
      return acc;
    },
    {} as Record<string, string[]>
  );

  // Filter locations based on search term
  const filteredGroupedLocations = Object.entries(groupedLocations).reduce(
    (acc, [region, locations]) => {
      const filteredLocations = locations.filter((location) =>
        location.toLowerCase().includes(searchTerm.toLowerCase())
      );
      if (filteredLocations.length > 0) {
        acc[region] = filteredLocations;
      }
      return acc;
    },
    {} as Record<string, string[]>
  );

  return (
    <div className="space-y-4 p-4 border border-gray-200 rounded-md bg-white mb-8">
      {/* Multiselect Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {`Adicione um ou mais locais para o ${treatmentTypeLabel}:`}
        </label>

        {/* Dropdown Button */}
        <button
          type="button"
          onClick={() => {
            const newOpen = !isDropdownOpen;
            setIsDropdownOpen(newOpen);
            if (newOpen) {
              setSearchTerm(""); // Clear search when opening dropdown
            }
          }}
          disabled={disabled}
          className="w-full px-3 py-2 text-left select focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
        >
          <span className="block truncate text-gray-900 font-normal">
            {getDisplayText()}
          </span>
          <span className="absolute -translate-y-6 right-0 flex items-center pr-2 pointer-events-none">
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </span>
        </button>

        {/* Dropdown Menu */}
        {isDropdownOpen && (
          <div className="absolute z-10 w-full mt-1 max-h-60 overflow-hidden pb-16">
            <div className="bg-white border border-gray-300 rounded-md shadow-lg">
              {/* Search Input */}
              <div className="p-3 border-b border-gray-200">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar local do corpo..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>

              {/* Scrollable Options Area */}
              <div className="max-h-32 overflow-auto">
                {/* Grouped Options */}
                {Object.entries(filteredGroupedLocations).map(
                  ([region, locations]) => (
                    <div key={region}>
                      <div className="px-3 py-2 text-xs font-semibold text-gray-700 bg-gray-100">
                        {region}
                      </div>
                      {locations.map((location) => (
                        <label
                          key={location}
                          className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={selectedLocations.includes(location)}
                            onChange={() => handleLocationToggle(location)}
                            className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <span className="text-sm text-gray-900 capitalize">
                            {location}
                          </span>
                        </label>
                      ))}
                    </div>
                  )
                )}

                {/* Show message if no results */}
                {Object.keys(filteredGroupedLocations).length === 0 &&
                  searchTerm.trim() && (
                    <div className="px-3 py-4 text-sm text-gray-500 text-center">
                      Nenhum local encontrado para &ldquo;{searchTerm}&rdquo;
                    </div>
                  )}

                {/* Custom Location Option */}
                <div className="border-t border-gray-400">
                  <label className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isCustomLocationSelected}
                      onChange={() =>
                        handleLocationToggle("Local Personalizado")
                      }
                      className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-900 font-medium">
                      Local Personalizado
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom Location Input */}
      {isCustomLocationSelected && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Local Personalizado
          </label>
          <input
            type="text"
            value={customLocation}
            onChange={(e) => handleCustomLocationChange(e.target.value)}
            disabled={disabled}
            placeholder="Digite o local específico..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100"
          />
        </div>
      )}

      {/* Selected Locations Display */}
      {(selectedLocations.length > 0 ||
        (isCustomLocationSelected && customLocation.trim())) && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Locais Selecionados:
          </label>
          <div className="flex flex-wrap gap-2">
            {selectedLocations.map((location) => (
              <span
                key={location}
                className="inline-flex items-center px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full"
              >
                {location}
                <button
                  type="button"
                  onClick={() => handleLocationToggle(location)}
                  className="ml-1 h-4 w-4 !p-0 text-blue-600 hover:text-red-600 flex items-center justify-center"
                >
                  ×
                </button>
              </span>
            ))}
            {isCustomLocationSelected && customLocation.trim() && (
              <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                {customLocation.trim()}
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomLocationSelected(false);
                    setCustomLocation("");
                  }}
                  className="ml-1 h-4 w-4 !p-0 text-green-600 hover:text-green-800 flex items-center justify-center"
                >
                  ×
                </button>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Add Treatment Button */}
      {(selectedLocations.length > 0 ||
        (isCustomLocationSelected && customLocation.trim())) && (
        <div className="pt-2">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={disabled}
            className="w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Confirmar locais
          </button>
        </div>
      )}
    </div>
  );
}

/**
 * Predefined body locations for spiritual center treatments
 * Based on SCP requirements for treatment location tracking
 */
export const TREATMENT_LOCATIONS = [
  // Central areas
  'Coronário',
  'Coração', 
  'Estômago',
  'Cabeça',
  
  // Spine and back
  'Lombar',
  'Pescoço',
  
  // Extremities
  'Pé',
  'Braço Direito',
  'Braço Esquerdo',
  'Perna Direita',
  'Perna Esquerda',
  'Ombro Direito',
  'Ombro Esquerdo',
  
  // Additional common areas
  'Joelho Direito',
  'Joelho Esquerdo',
  'Tornozelo Direito',
  'Tornozelo Esquerdo',
  'Punho Direito',
  'Punho Esquerdo',
] as const;

export type TreatmentLocation = typeof TREATMENT_LOCATIONS[number];

/**
 * Groups locations by body region for better UX
 */
export const LOCATION_GROUPS = {
  'Região Central': ['Coronário', 'Coração', 'Estômago', 'Cabeça'],
  'Coluna e Pescoço': ['Lombar', 'Pescoço'],
  'Membros Superiores': ['Braço Direito', 'Braço Esquerdo', 'Ombro Direito', 'Ombro Esquerdo', 'Punho Direito', 'Punho Esquerdo'],
  'Membros Inferiores': ['Perna Direita', 'Perna Esquerda', 'Pé', 'Joelho Direito', 'Joelho Esquerdo', 'Tornozelo Direito', 'Tornozelo Esquerdo'],
} as const;

/**
 * Helper function to get all available locations as a flat array
 */
export const getAllLocations = (): readonly string[] => {
  return TREATMENT_LOCATIONS;
};

/**
 * Helper function to validate if a location is predefined
 */
export const isValidLocation = (location: string): location is TreatmentLocation => {
  return (TREATMENT_LOCATIONS as readonly string[]).includes(location);
};

/**
 * Helper function to format location for display
 */
export const formatLocationForDisplay = (location: string): string => {
  return location.trim();
};

/**
 * Helper function to get locations by group
 */
export const getLocationsByGroup = (group: keyof typeof LOCATION_GROUPS): readonly string[] => {
  return LOCATION_GROUPS[group];
};

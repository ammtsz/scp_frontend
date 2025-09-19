// Individual treatment for each body location or group of locations
export interface LightBathLocationTreatment {
  locations: string[]; // Array of locations that share the same treatment parameters
  color: string;
  duration: number; // in 7-minute units (1 = 7min, 2 = 14min, etc.)
  quantity: number;
  startDate: string; // YYYY-MM-DD format
}

export interface RodLocationTreatment {
  locations: string[]; // Array of locations that share the same treatment parameters
  quantity: number;
  startDate: string; // YYYY-MM-DD format
}

export interface TreatmentRecommendation {
  lightBath?: {
    startDate: string; // YYYY-MM-DD format
    treatments: LightBathLocationTreatment[]; // Individual settings per location
  };
  rod?: {
    startDate: string; // YYYY-MM-DD format
    treatments: RodLocationTreatment[]; // Individual settings per location
  };
  returnWeeks: number; // 1-52 weeks for return appointment
  spiritualMedicalDischarge: boolean;
}

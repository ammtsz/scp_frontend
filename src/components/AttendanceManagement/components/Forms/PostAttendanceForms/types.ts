// Individual treatment for each body location or group of locations
export interface LightBathLocationTreatment {
  locations: string[]; // Array of locations that share the same treatment parameters
  color: string;
  duration: number; // in 7-minute units (1 = 7min, 2 = 14min, etc.)
  quantity: number;
  startDate: Date;
}

export interface RodLocationTreatment {
  locations: string[]; // Array of locations that share the same treatment parameters
  quantity: number;
  startDate: Date;
}

export interface TreatmentRecommendation {
  lightBath?: {
    startDate: Date;
    treatments: LightBathLocationTreatment[]; // Individual settings per location
  };
  rod?: {
    startDate: Date;
    treatments: RodLocationTreatment[]; // Individual settings per location
  };
  returnWeeks: number; // 1-52 weeks for return appointment
  spiritualMedicalDischarge: boolean;
}

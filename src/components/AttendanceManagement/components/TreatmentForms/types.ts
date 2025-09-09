// Individual treatment for each body location
export interface LightBathLocationTreatment {
  location: string;
  color: string;
  duration: number; // in 7-minute units (1 = 7min, 2 = 14min, etc.)
  quantity: number;
  startDate: Date;
}

export interface RodLocationTreatment {
  location: string;
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

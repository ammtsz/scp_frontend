export interface Patient {
  id: string;
  registrationNumber: number;
  name: string;
  birthDate: string;
  phone: string;
  priority: 'I' | 'E' | 'N';
  mainComplaint: string;
  status: 'T' | 'A' | 'F' | 'N' | 'I';
  spiritualConsultation: SpiritualConsultation;
  lightBaths: LightBath[];
  rods: Rod[];
  attendances: Attendance[];
  history: TreatmentHistory[];
}

export interface SpiritualConsultation {
  startDate: string;
  nextDate: string;
  dischargeDate: string;
  recommendations: Recommendations;
}

export interface Recommendations {
  food: string;
  water: string;
  ointment: string;
  lightBath: boolean;
  rod: boolean;
  spiritualTreatment: boolean;
  returnWeeks: number;
}

export interface LightBath {
  location: string;
  startDate: string;
  endDate: string;
  color: string;
  duration: number;
  quantity: number;
}

export interface Rod {
  location: string;
  startDate: string;
  endDate: string;
  quantity: number;
}

export interface Attendance {
  date: string;
  status: 'OK' | 'Faltou';
  notes?: string;
  recommendations?: Recommendations;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface TreatmentHistory {
  // TODO: Define fields for treatment history as needed
}

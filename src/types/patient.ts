export interface Patient {
  id: string;
  registrationNumber: number;
  name: string;
  birthDate: string;
  phone: string;
  priority: 'I' | 'E' | 'N';
  mainComplaint: string;
  status: 'T' | 'A' | 'F';
  spiritualConsultation: SpiritualConsultation;
  lightBaths: LightBath[];
  staffs: Staff[];
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
  staff: boolean;
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

export interface Staff {
  location: string;
  startDate: string;
  endDate: string;
  quantity: number;
}

export interface Attendance {
  date: string;
  status: 'OK' | 'Faltou';
}

export interface TreatmentHistory {
  // TODO: Define fields for treatment history as needed
}

export interface AbsenceJustification {
  patientId: number;
  patientName: string;
  attendanceType: string;
  justified?: boolean; // Optional until user selects
  justification?: string;
}

export interface ScheduledAbsence {
  patientId: number;
  patientName: string;
  attendanceType: string;
}
